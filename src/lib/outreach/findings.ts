import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  contacts,
  researchFindings,
  similarArtists,
  venueContacts,
  venues,
  type ResearchFinding,
  type Venue,
  type VenueScale,
} from "@/db/schema";
import { formatContactName, venueScaleLabels } from "@/lib/crm/labels";
import type { ContactOption } from "@/lib/crm/queries";
import { OutreachError } from "@/lib/outreach/errors";
import { normaliseUrl } from "@/lib/outreach/jina";
import type { VenueResearchData } from "@/lib/outreach/schemas";

/** Venue columns the research step is allowed to propose a value for. */
const VENUE_FIELD_SPECS = [
  { field: "email", label: "E-mail", type: "email" },
  { field: "phone", label: "Telefoon", type: "phone" },
  { field: "address", label: "Adres", type: "text" },
  { field: "capacity", label: "Capaciteit", type: "number" },
  { field: "homeUrl", label: "Home URL", type: "url" },
  { field: "programmaUrl", label: "Programma URL", type: "url" },
  { field: "contactUrl", label: "Contact URL", type: "url" },
  { field: "region", label: "Regio", type: "text" },
  { field: "scale", label: "Schaal", type: "enum" },
] as const;

export type VenueFieldName = (typeof VENUE_FIELD_SPECS)[number]["field"];

export type VenueFieldFindingValue = {
  field: VenueFieldName;
  value: string;
  display: string;
};

export type ContactFindingValue = {
  firstName: string;
  lastName: string | null;
  jobTitle: string | null;
  email: string | null;
  phone: string | null;
};

export type ArtistFindingValue = {
  name: string;
  genre: string | null;
  city: string | null;
  website: string | null;
  why: string | null;
  /** When they play at this venue, which is what makes a shared bill possible. */
  eventDate: string | null;
};

function normaliseText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normaliseEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalisePhone(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

function normaliseUrlKey(value: string): string {
  const url = normaliseUrl(value);
  if (!url) return normaliseText(value);
  try {
    const parsed = new URL(url);
    return `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return normaliseText(value);
  }
}

function normaliseByType(value: string, type: (typeof VENUE_FIELD_SPECS)[number]["type"]) {
  switch (type) {
    case "email":
      return normaliseEmail(value);
    case "phone":
      return normalisePhone(value);
    case "url":
      return normaliseUrlKey(value);
    default:
      return normaliseText(value);
  }
}

type NewFinding = typeof researchFindings.$inferInsert;

/**
 * Turns a research run into a review queue by comparing what was found against
 * what the CRM already holds. Only genuinely new or conflicting information
 * becomes a finding.
 */
export async function buildFindings(
  venue: Venue,
  researchId: string,
  data: VenueResearchData,
): Promise<number> {
  const findings: NewFinding[] = [];

  const details = data.venueDetails;
  if (details) {
    for (const spec of VENUE_FIELD_SPECS) {
      const raw = details[spec.field];
      if (raw === null || raw === undefined || raw === "") continue;

      const value = spec.type === "number" ? String(raw) : String(raw).trim();
      if (!value) continue;

      if (spec.field === "scale" && !(value in venueScaleLabels)) continue;
      if (spec.type === "number" && !Number.isFinite(Number(value))) continue;
      if (spec.type === "url" && !normaliseUrl(value)) continue;

      const currentRaw = venue[spec.field];
      const current =
        currentRaw === null || currentRaw === undefined ? "" : String(currentRaw);

      if (current && normaliseByType(current, spec.type) === normaliseByType(value, spec.type)) {
        continue;
      }

      const display =
        spec.field === "scale" ? venueScaleLabels[value as VenueScale] : value;

      findings.push({
        venueId: venue.id,
        researchId,
        kind: "venue_field",
        field: spec.field,
        label: spec.label,
        value: { field: spec.field, value, display } satisfies VenueFieldFindingValue,
        currentValue:
          current && spec.field === "scale"
            ? venueScaleLabels[current as VenueScale]
            : current || null,
        dedupeKey: `venue_field:${spec.field}:${normaliseByType(value, spec.type)}`,
      });
    }
  }

  const linkedContacts = await db
    .select({
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      email: contacts.email,
    })
    .from(venueContacts)
    .innerJoin(contacts, eq(venueContacts.contactId, contacts.id))
    .where(eq(venueContacts.venueId, venue.id));

  const knownEmails = new Set(
    linkedContacts.filter((c) => c.email).map((c) => normaliseEmail(c.email!)),
  );
  const knownNames = new Set(
    linkedContacts.map((c) => normaliseText(formatContactName(c))),
  );

  for (const person of data.discoveredContacts ?? []) {
    const firstName = person.firstName?.trim();
    if (!firstName) continue;

    const fullName = [firstName, person.lastName?.trim()].filter(Boolean).join(" ");
    const email = person.email?.trim() || null;

    if (email && knownEmails.has(normaliseEmail(email))) continue;
    if (knownNames.has(normaliseText(fullName))) continue;

    findings.push({
      venueId: venue.id,
      researchId,
      kind: "contact",
      label: fullName,
      value: {
        firstName,
        lastName: person.lastName?.trim() || null,
        jobTitle: person.jobTitle?.trim() || null,
        email,
        phone: person.phone?.trim() || null,
      } satisfies ContactFindingValue,
      currentValue: null,
      sourceUrl: person.sourceUrl?.trim() || null,
      dedupeKey: `contact:${email ? normaliseEmail(email) : normaliseText(fullName)}`,
    });
  }

  const artistCandidates = (data.genreMatches ?? []).filter(
    (match) => match.strength !== "weak" && match.artist?.trim(),
  );

  if (artistCandidates.length > 0) {
    const existing = await db
      .select({ name: similarArtists.name })
      .from(similarArtists);
    const knownArtists = new Set(existing.map((artist) => normaliseText(artist.name)));

    for (const match of artistCandidates) {
      const name = match.artist.trim();
      if (knownArtists.has(normaliseText(name))) continue;

      findings.push({
        venueId: venue.id,
        researchId,
        kind: "artist",
        label: name,
        value: {
          name,
          genre: match.genre?.trim() || null,
          city: match.city?.trim() || null,
          website: match.website?.trim() || null,
          why: match.why?.trim() || null,
          eventDate: match.eventDate?.trim() || match.isoDate || null,
        } satisfies ArtistFindingValue,
        currentValue: null,
        dedupeKey: `artist:${normaliseText(name)}`,
      });
    }
  }

  if (findings.length === 0) return 0;

  const inserted = await db
    .insert(researchFindings)
    .values(findings)
    .onConflictDoNothing({
      target: [researchFindings.venueId, researchFindings.dedupeKey],
    })
    .returning({ id: researchFindings.id });

  return inserted.length;
}

export type AppliedFinding =
  | { kind: "venue_field"; venueId: string; field: VenueFieldName; value: string }
  | { kind: "contact"; venueId: string; contact: ContactOption }
  | { kind: "artist"; venueId: string; artistId: string; name: string };

async function applyVenueField(
  venue: Venue,
  value: VenueFieldFindingValue,
): Promise<AppliedFinding> {
  switch (value.field) {
    case "capacity": {
      const capacity = Number(value.value);
      if (!Number.isFinite(capacity)) throw new OutreachError("Ongeldige capaciteit.");
      await db.update(venues).set({ capacity }).where(eq(venues.id, venue.id));
      break;
    }
    case "scale": {
      if (!(value.value in venueScaleLabels)) {
        throw new OutreachError("Ongeldige schaal.");
      }
      await db
        .update(venues)
        .set({ scale: value.value as VenueScale })
        .where(eq(venues.id, venue.id));
      break;
    }
    case "homeUrl": {
      // The legacy `website` column mirrors homeUrl everywhere else too.
      await db
        .update(venues)
        .set({ homeUrl: value.value, website: value.value })
        .where(eq(venues.id, venue.id));
      break;
    }
    default: {
      await db
        .update(venues)
        .set({ [value.field]: value.value })
        .where(eq(venues.id, venue.id));
      break;
    }
  }

  return {
    kind: "venue_field",
    venueId: venue.id,
    field: value.field,
    value: value.value,
  };
}

async function applyContact(
  venue: Venue,
  value: ContactFindingValue,
  userId: string | null,
): Promise<AppliedFinding> {
  const [created] = await db
    .insert(contacts)
    .values({
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      phone: value.phone,
      jobTitle: value.jobTitle,
      organization: venue.name,
      city: venue.city,
      type: "venue",
      status: "lead",
      source: "Venue-onderzoek",
      createdById: userId,
    })
    .returning();

  await db
    .insert(venueContacts)
    .values({ venueId: venue.id, contactId: created.id })
    .onConflictDoNothing();

  return {
    kind: "contact",
    venueId: venue.id,
    contact: {
      id: created.id,
      firstName: created.firstName,
      lastName: created.lastName,
      email: created.email,
      phone: created.phone,
      organization: created.organization,
      jobTitle: created.jobTitle,
      type: created.type,
      city: created.city,
    },
  };
}

async function applyArtist(
  venue: Venue,
  value: ArtistFindingValue,
): Promise<AppliedFinding> {
  const venueLabel = `${venue.name}${venue.city ? ` (${venue.city})` : ""}`;
  const noteParts = [
    value.eventDate
      ? `Speelt op ${value.eventDate} bij ${venueLabel}.`
      : `Staat op de agenda bij ${venueLabel}.`,
  ];
  if (value.why) noteParts.push(value.why);

  const [created] = await db
    .insert(similarArtists)
    .values({
      name: value.name,
      genre: value.genre,
      city: value.city,
      website: value.website,
      notes: noteParts.join(" "),
      tags: [venue.name],
    })
    .returning({ id: similarArtists.id, name: similarArtists.name });

  return {
    kind: "artist",
    venueId: venue.id,
    artistId: created.id,
    name: created.name,
  };
}

async function loadFinding(findingId: string): Promise<ResearchFinding> {
  const [finding] = await db
    .select()
    .from(researchFindings)
    .where(eq(researchFindings.id, findingId))
    .limit(1);

  if (!finding) throw new OutreachError("Vondst niet gevonden.");
  if (finding.status !== "pending") {
    throw new OutreachError("Deze vondst is al verwerkt.");
  }
  return finding;
}

export async function applyFinding(
  findingId: string,
  userId: string | null,
): Promise<AppliedFinding> {
  const finding = await loadFinding(findingId);

  const [venue] = await db
    .select()
    .from(venues)
    .where(eq(venues.id, finding.venueId))
    .limit(1);
  if (!venue) throw new OutreachError("Venue niet gevonden.");

  let applied: AppliedFinding;

  switch (finding.kind) {
    case "venue_field":
      applied = await applyVenueField(venue, finding.value as VenueFieldFindingValue);
      break;
    case "contact":
      applied = await applyContact(venue, finding.value as ContactFindingValue, userId);
      break;
    case "artist":
      applied = await applyArtist(venue, finding.value as ArtistFindingValue);
      break;
  }

  await db
    .update(researchFindings)
    .set({
      status: "applied",
      appliedEntityId:
        applied.kind === "contact"
          ? applied.contact.id
          : applied.kind === "artist"
            ? applied.artistId
            : null,
      resolvedAt: new Date(),
      resolvedById: userId,
    })
    .where(eq(researchFindings.id, findingId));

  return applied;
}

export async function dismissFinding(
  findingId: string,
  userId: string | null,
): Promise<void> {
  await loadFinding(findingId);
  await db
    .update(researchFindings)
    .set({ status: "dismissed", resolvedAt: new Date(), resolvedById: userId })
    .where(eq(researchFindings.id, findingId));
}

/** Applies a batch in a stable order so venue fields land before contacts. */
export async function applyFindings(
  findingIds: string[],
  userId: string | null,
): Promise<AppliedFinding[]> {
  if (findingIds.length === 0) return [];

  const rows = await db
    .select({ id: researchFindings.id, kind: researchFindings.kind })
    .from(researchFindings)
    .where(inArray(researchFindings.id, findingIds));

  const order: Record<ResearchFinding["kind"], number> = {
    venue_field: 0,
    contact: 1,
    artist: 2,
  };
  const sorted = [...rows].sort((a, b) => order[a.kind] - order[b.kind]);

  const applied: AppliedFinding[] = [];
  for (const row of sorted) {
    applied.push(await applyFinding(row.id, userId));
  }
  return applied;
}
