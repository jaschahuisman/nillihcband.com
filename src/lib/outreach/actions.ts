"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  outreachDraftVersions,
  outreachDrafts,
  venues,
  type OutreachAngle,
  type OutreachDraftStatus,
  type OutreachKind,
} from "@/db/schema";
import { requireSessionUser } from "@/lib/auth";
import { OutreachError } from "@/lib/outreach/errors";
import {
  applyFindings,
  dismissFinding,
  type AppliedFinding,
} from "@/lib/outreach/findings";
import { JinaConfigError } from "@/lib/outreach/jina";
import { OutreachConfigError } from "@/lib/outreach/model";
import type { OutreachVersionEntry, VenueResearchEntry } from "@/lib/outreach/queries";
import { generateDraftForVenue, researchVenueById } from "@/lib/outreach/service";

export type OutreachActionResult = { ok: true } | { ok: false; error: string };
export type ResearchActionResult =
  | { ok: true; research: VenueResearchEntry; newFindings: number }
  | { ok: false; error: string };
export type GenerateActionResult =
  | { ok: true; draftId: string; version: OutreachVersionEntry }
  | { ok: false; error: string };

function toMessage(error: unknown): string {
  if (
    error instanceof OutreachError ||
    error instanceof OutreachConfigError ||
    error instanceof JinaConfigError
  ) {
    return error.message;
  }
  if (error instanceof Error && error.message === "Unauthorized") {
    return "Sessie verlopen. Log opnieuw in.";
  }
  console.error("[outreach]", error);
  return "Er ging iets mis. Probeer het opnieuw.";
}

function revalidateVenue(venueId: string) {
  revalidatePath(`/crm/venues/${venueId}`);
  revalidatePath("/crm/venues");
}

export type ApplyFindingResult =
  | { ok: true; applied: AppliedFinding[] }
  | { ok: false; error: string };

export async function applyFindingsAction(
  venueId: string,
  findingIds: string[],
): Promise<ApplyFindingResult> {
  try {
    const user = await requireSessionUser();
    const applied = await applyFindings(findingIds, user.id);
    revalidateVenue(venueId);
    return { ok: true, applied };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function dismissFindingAction(
  venueId: string,
  findingId: string,
): Promise<OutreachActionResult> {
  try {
    const user = await requireSessionUser();
    await dismissFinding(findingId, user.id);
    revalidateVenue(venueId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function researchVenueAction(
  venueId: string,
): Promise<ResearchActionResult> {
  try {
    const user = await requireSessionUser();
    const { newFindings, ...research } = await researchVenueById(venueId, user.id);
    revalidateVenue(venueId);
    return { ok: true, research, newFindings };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function generateOutreachDraftAction(input: {
  venueId: string;
  draftId?: string | null;
  kind?: OutreachKind;
  angle?: OutreachAngle | null;
  instructions?: string | null;
  contactId?: string | null;
  language?: "nl" | "en";
}): Promise<GenerateActionResult> {
  try {
    const user = await requireSessionUser();
    const result = await generateDraftForVenue(input, user.id);
    revalidateVenue(input.venueId);
    return { ok: true, draftId: result.draftId, version: result.version };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function selectDraftVersionAction(
  draftId: string,
  versionId: string,
): Promise<OutreachActionResult> {
  try {
    await requireSessionUser();
    await db
      .update(outreachDraftVersions)
      .set({ selected: false })
      .where(eq(outreachDraftVersions.draftId, draftId));
    await db
      .update(outreachDraftVersions)
      .set({ selected: true })
      .where(eq(outreachDraftVersions.id, versionId));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function updateDraftVersionAction(
  versionId: string,
  input: { subject: string; body: string },
): Promise<OutreachActionResult> {
  try {
    await requireSessionUser();
    const subject = input.subject.trim();
    const body = input.body.trim();

    if (!subject || !body) {
      return { ok: false, error: "Onderwerp en tekst mogen niet leeg zijn." };
    }

    await db
      .update(outreachDraftVersions)
      .set({ subject, body, edited: true })
      .where(eq(outreachDraftVersions.id, versionId));

    return { ok: true };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

/**
 * Marking a thread as sent is always a deliberate click; the venue status
 * follows along so the pipeline view stays truthful without extra bookkeeping.
 */
export async function setDraftStatusAction(
  draftId: string,
  status: OutreachDraftStatus,
): Promise<OutreachActionResult> {
  try {
    await requireSessionUser();

    const [draft] = await db
      .select()
      .from(outreachDrafts)
      .where(eq(outreachDrafts.id, draftId))
      .limit(1);

    if (!draft) return { ok: false, error: "Concept niet gevonden." };

    await db
      .update(outreachDrafts)
      .set({
        status,
        sentAt: status === "sent" ? (draft.sentAt ?? new Date()) : null,
      })
      .where(eq(outreachDrafts.id, draftId));

    if (status === "sent") {
      const [venue] = await db
        .select({ status: venues.status })
        .from(venues)
        .where(eq(venues.id, draft.venueId))
        .limit(1);

      const nextVenueStatus =
        draft.kind === "reminder"
          ? "reminder_sent"
          : venue?.status === "prospect"
            ? "approached"
            : null;

      if (nextVenueStatus && venue?.status !== nextVenueStatus) {
        await db
          .update(venues)
          .set({ status: nextVenueStatus })
          .where(eq(venues.id, draft.venueId));
      }
    }

    revalidateVenue(draft.venueId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function deleteOutreachDraftAction(
  draftId: string,
): Promise<OutreachActionResult> {
  try {
    await requireSessionUser();
    const [draft] = await db
      .select({ venueId: outreachDrafts.venueId })
      .from(outreachDrafts)
      .where(eq(outreachDrafts.id, draftId))
      .limit(1);

    await db.delete(outreachDrafts).where(eq(outreachDrafts.id, draftId));
    if (draft) revalidateVenue(draft.venueId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}
