/**
 * Framework-free orchestration for the outreach engine.
 *
 * Nothing in here depends on React, server actions or the request lifecycle, so
 * the same functions back the venue detail UI today and can back a cron job,
 * an API route or a bulk run over many venues later.
 */
import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  contacts,
  outreachDraftVersions,
  outreachDrafts,
  venueContacts,
  venueNotes,
  venueResearch,
  venues,
  type OutreachAngle,
  type OutreachKind,
  type Venue,
} from "@/db/schema";
import { formatContactName } from "@/lib/crm/labels";
import { OutreachError } from "@/lib/outreach/errors";
import { buildFindings } from "@/lib/outreach/findings";
import { generateOutreachEmail, type PriorMessage } from "@/lib/outreach/generate";
import {
  getLatestVenueResearch,
  type OutreachVersionEntry,
  type VenueResearchEntry,
} from "@/lib/outreach/queries";
import { runVenueResearch } from "@/lib/outreach/research";

export { OutreachError };

async function loadVenue(venueId: string): Promise<Venue> {
  const [venue] = await db.select().from(venues).where(eq(venues.id, venueId)).limit(1);
  if (!venue) throw new OutreachError("Venue niet gevonden.");
  return venue;
}

export type ResearchRunResult = VenueResearchEntry & {
  /** Number of new reviewable findings this run produced. */
  newFindings: number;
};

export async function researchVenueById(
  venueId: string,
  userId: string | null,
): Promise<ResearchRunResult> {
  const venue = await loadVenue(venueId);
  const result = await runVenueResearch(venue);

  const [row] = await db
    .insert(venueResearch)
    .values({
      venueId,
      summary: result.summary,
      data: result.data,
      sources: result.sources,
      model: result.model,
      fitScore: result.data.fitScore,
      createdById: userId,
    })
    .returning();

  const newFindings = await buildFindings(venue, row.id, result.data);

  return {
    id: row.id,
    venueId: row.venueId,
    summary: row.summary,
    data: result.data,
    sources: result.sources,
    model: row.model,
    fitScore: row.fitScore,
    createdAt: row.createdAt,
    newFindings,
  };
}

async function loadRecipient(venueId: string, contactId: string | null) {
  if (contactId) {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1);
    if (contact) {
      return {
        id: contact.id,
        name: formatContactName(contact),
        role: contact.jobTitle,
      };
    }
  }

  const linked = await db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      jobTitle: contacts.jobTitle,
      type: contacts.type,
    })
    .from(venueContacts)
    .innerJoin(contacts, eq(venueContacts.contactId, contacts.id))
    .where(eq(venueContacts.venueId, venueId));

  const preferred =
    linked.find((contact) => contact.type === "venue") ??
    linked.find((contact) => contact.type === "promoter") ??
    linked.find((contact) => contact.type === "booking_agent") ??
    linked[0];

  if (!preferred) return null;

  return {
    id: preferred.id,
    name: formatContactName(preferred),
    role: preferred.jobTitle,
  };
}

/** Selected version of every draft that has actually been sent, oldest first. */
async function loadPriorMessages(
  venueId: string,
  excludeDraftId: string | null,
): Promise<PriorMessage[]> {
  const conditions = [
    eq(outreachDrafts.venueId, venueId),
    eq(outreachDrafts.status, "sent" as const),
  ];
  if (excludeDraftId) conditions.push(ne(outreachDrafts.id, excludeDraftId));

  const sentDrafts = await db
    .select()
    .from(outreachDrafts)
    .where(and(...conditions))
    .orderBy(asc(outreachDrafts.sentAt));

  if (sentDrafts.length === 0) return [];

  const versions = await db
    .select()
    .from(outreachDraftVersions)
    .where(
      inArray(
        outreachDraftVersions.draftId,
        sentDrafts.map((draft) => draft.id),
      ),
    )
    .orderBy(asc(outreachDraftVersions.versionNumber));

  return sentDrafts
    .map((draft) => {
      const draftVersions = versions.filter((version) => version.draftId === draft.id);
      const chosen =
        draftVersions.find((version) => version.selected) ??
        draftVersions[draftVersions.length - 1];
      if (!chosen) return null;
      return {
        subject: chosen.subject,
        body: chosen.body,
        sentAt: draft.sentAt,
        kind: draft.kind,
      } satisfies PriorMessage;
    })
    .filter((message): message is PriorMessage => message !== null);
}

export type GenerateDraftInput = {
  venueId: string;
  /** Omit to start a new thread, pass an id to add a version to it. */
  draftId?: string | null;
  kind?: OutreachKind;
  angle?: OutreachAngle | null;
  instructions?: string | null;
  contactId?: string | null;
  language?: "nl" | "en";
};

export type GenerateDraftResult = {
  draftId: string;
  kind: OutreachKind;
  version: OutreachVersionEntry;
};

export async function generateDraftForVenue(
  input: GenerateDraftInput,
  userId: string | null,
): Promise<GenerateDraftResult> {
  const venue = await loadVenue(input.venueId);

  const existingDraft = input.draftId
    ? (
        await db
          .select()
          .from(outreachDrafts)
          .where(eq(outreachDrafts.id, input.draftId))
          .limit(1)
      )[0]
    : undefined;

  if (input.draftId && !existingDraft) {
    throw new OutreachError("Concept niet gevonden.");
  }

  const kind = existingDraft?.kind ?? input.kind ?? "initial";
  const language = input.language ?? "nl";

  const existingVersions = existingDraft
    ? await db
        .select()
        .from(outreachDraftVersions)
        .where(eq(outreachDraftVersions.draftId, existingDraft.id))
        .orderBy(desc(outreachDraftVersions.versionNumber))
    : [];

  const baseVersion =
    existingVersions.find((version) => version.selected) ?? existingVersions[0];

  const [research, recipient, noteRows, priorMessages] = await Promise.all([
    getLatestVenueResearch(venue.id),
    loadRecipient(venue.id, input.contactId ?? existingDraft?.contactId ?? null),
    db
      .select({ body: venueNotes.body })
      .from(venueNotes)
      .where(eq(venueNotes.venueId, venue.id))
      .orderBy(desc(venueNotes.createdAt))
      .limit(10),
    loadPriorMessages(venue.id, existingDraft?.id ?? null),
  ]);

  if ((kind === "reminder" || kind === "follow_up") && priorMessages.length === 0) {
    throw new OutreachError(
      "Er is nog geen mail als verzonden gemarkeerd. Markeer eerst een eerdere mail als verzonden.",
    );
  }

  const email = await generateOutreachEmail({
    venue,
    research: research?.data ?? null,
    kind,
    angle: input.angle ?? null,
    instructions: input.instructions ?? null,
    recipient: recipient ? { name: recipient.name, role: recipient.role } : null,
    notes: noteRows.map((note) => note.body),
    previousVersion: baseVersion
      ? { subject: baseVersion.subject, body: baseVersion.body }
      : null,
    priorMessages,
    language,
  });

  const draftId =
    existingDraft?.id ??
    (
      await db
        .insert(outreachDrafts)
        .values({
          venueId: venue.id,
          contactId: input.contactId ?? recipient?.id ?? null,
          kind,
          createdById: userId,
        })
        .returning({ id: outreachDrafts.id })
    )[0].id;

  const nextVersionNumber =
    existingVersions.length > 0 ? existingVersions[0].versionNumber + 1 : 1;

  await db
    .update(outreachDraftVersions)
    .set({ selected: false })
    .where(eq(outreachDraftVersions.draftId, draftId));

  const [version] = await db
    .insert(outreachDraftVersions)
    .values({
      draftId,
      versionNumber: nextVersionNumber,
      subject: email.subject,
      body: email.body,
      language,
      angle: email.angle,
      rationale: email.rationale,
      talkingPoints: email.talkingPoints,
      instructions: input.instructions?.trim() || null,
      researchId: research?.id ?? null,
      model: email.model,
      selected: true,
      createdById: userId,
    })
    .returning();

  if (existingDraft) {
    await db
      .update(outreachDrafts)
      .set({ updatedAt: new Date() })
      .where(eq(outreachDrafts.id, draftId));
  }

  return {
    draftId,
    kind,
    version: {
      ...version,
      angle: version.angle,
      talkingPoints: Array.isArray(version.talkingPoints)
        ? (version.talkingPoints as string[])
        : [],
    },
  };
}
