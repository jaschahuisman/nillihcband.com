import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  outreachDraftVersions,
  outreachDrafts,
  researchFindings,
  venueResearch,
  type OutreachDraft,
  type OutreachAngle,
  type ResearchFindingKind,
} from "@/db/schema";
import { requireSessionUser } from "@/lib/auth";
import type {
  ArtistFindingValue,
  ContactFindingValue,
  VenueFieldFindingValue,
} from "@/lib/outreach/findings";
import type { ResearchSource, VenueResearchData } from "@/lib/outreach/schemas";
import { keepUpcomingMatches } from "@/lib/outreach/timing";

export type VenueResearchEntry = {
  id: string;
  venueId: string;
  summary: string;
  data: VenueResearchData;
  sources: ResearchSource[];
  model: string;
  fitScore: number | null;
  createdAt: Date;
};

export type OutreachVersionEntry = {
  id: string;
  draftId: string;
  versionNumber: number;
  subject: string;
  body: string;
  language: string;
  angle: OutreachAngle | null;
  rationale: string | null;
  talkingPoints: string[];
  instructions: string | null;
  model: string | null;
  edited: boolean;
  selected: boolean;
  createdAt: Date;
};

export type OutreachDraftEntry = OutreachDraft & {
  versions: OutreachVersionEntry[];
};

export type FindingEntry = {
  id: string;
  venueId: string;
  kind: ResearchFindingKind;
  field: string | null;
  label: string;
  currentValue: string | null;
  sourceUrl: string | null;
  value: VenueFieldFindingValue | ContactFindingValue | ArtistFindingValue;
  createdAt: Date;
};

export type VenueOutreach = {
  research: VenueResearchEntry | null;
  researchHistory: Array<Pick<VenueResearchEntry, "id" | "createdAt" | "fitScore" | "model">>;
  drafts: OutreachDraftEntry[];
  findings: FindingEntry[];
};

function mapResearchRow(row: {
  id: string;
  venueId: string;
  summary: string;
  data: unknown;
  sources: unknown;
  model: string;
  fitScore: number | null;
  createdAt: Date;
}): VenueResearchEntry {
  return {
    id: row.id,
    venueId: row.venueId,
    summary: row.summary,
    // Re-filtered on read so acts that have since played drop out on their own.
    data: keepUpcomingMatches(row.data as VenueResearchData),
    sources: (row.sources ?? []) as ResearchSource[],
    model: row.model,
    fitScore: row.fitScore,
    createdAt: row.createdAt,
  };
}

function mapVersionRow(row: {
  id: string;
  draftId: string;
  versionNumber: number;
  subject: string;
  body: string;
  language: string;
  angle: OutreachAngle | null;
  rationale: string | null;
  talkingPoints: unknown;
  instructions: string | null;
  model: string | null;
  edited: boolean;
  selected: boolean;
  createdAt: Date;
}): OutreachVersionEntry {
  return {
    ...row,
    talkingPoints: Array.isArray(row.talkingPoints)
      ? (row.talkingPoints as string[])
      : [],
  };
}

export async function getLatestVenueResearch(
  venueId: string,
): Promise<VenueResearchEntry | null> {
  const [row] = await db
    .select()
    .from(venueResearch)
    .where(eq(venueResearch.venueId, venueId))
    .orderBy(desc(venueResearch.createdAt))
    .limit(1);

  return row ? mapResearchRow(row) : null;
}

export async function getVenueOutreach(venueId: string): Promise<VenueOutreach> {
  await requireSessionUser();

  const [researchRows, draftRows, findingRows] = await Promise.all([
    db
      .select()
      .from(venueResearch)
      .where(eq(venueResearch.venueId, venueId))
      .orderBy(desc(venueResearch.createdAt))
      .limit(10),
    db
      .select()
      .from(outreachDrafts)
      .where(eq(outreachDrafts.venueId, venueId))
      .orderBy(desc(outreachDrafts.createdAt)),
    db
      .select()
      .from(researchFindings)
      .where(
        and(
          eq(researchFindings.venueId, venueId),
          eq(researchFindings.status, "pending"),
        ),
      )
      .orderBy(asc(researchFindings.kind), asc(researchFindings.createdAt)),
  ]);

  const versionRows =
    draftRows.length > 0
      ? await db
          .select()
          .from(outreachDraftVersions)
          .where(
            inArray(
              outreachDraftVersions.draftId,
              draftRows.map((draft) => draft.id),
            ),
          )
          .orderBy(asc(outreachDraftVersions.versionNumber))
      : [];

  const versionsByDraft = new Map<string, OutreachVersionEntry[]>();
  for (const row of versionRows) {
    const existing = versionsByDraft.get(row.draftId) ?? [];
    existing.push(mapVersionRow(row));
    versionsByDraft.set(row.draftId, existing);
  }

  return {
    research: researchRows[0] ? mapResearchRow(researchRows[0]) : null,
    researchHistory: researchRows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      fitScore: row.fitScore,
      model: row.model,
    })),
    drafts: draftRows.map((draft) => ({
      ...draft,
      versions: versionsByDraft.get(draft.id) ?? [],
    })),
    findings: findingRows.map((row) => ({
      id: row.id,
      venueId: row.venueId,
      kind: row.kind,
      field: row.field,
      label: row.label,
      currentValue: row.currentValue,
      sourceUrl: row.sourceUrl,
      value: row.value as FindingEntry["value"],
      createdAt: row.createdAt,
    })),
  };
}
