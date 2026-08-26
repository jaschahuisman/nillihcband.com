import type { VenueResearchData } from "@/lib/outreach/schemas";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** `YYYY-MM-DD` in Amsterdam time, which is what the venue agendas use. */
export function todayIso(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    dateStyle: "short",
  }).format(now);
}

function isoOrNull(value: string | null | undefined): string | null {
  return value && ISO_DATE.test(value) ? value : null;
}

/**
 * Keeps only acts that can still share a bill with Nillihc.
 *
 * Runs both after research and on every read: the prompt already forbids past
 * acts, but a misread year would quietly poison the email and the CRM findings,
 * and an act that was upcoming when researched goes stale on its own.
 */
export function keepUpcomingMatches(
  data: VenueResearchData,
  today: string = todayIso(),
): VenueResearchData {
  const acts = data.programmedActs ?? [];

  const genreMatches = (data.genreMatches ?? []).filter((match) => {
    const iso = isoOrNull(match.isoDate);
    if (iso) return iso >= today;

    // No usable date on the match: fall back to what the act list knows.
    const act = acts.find(
      (entry) => entry.name.trim().toLowerCase() === match.artist.trim().toLowerCase(),
    );
    if (!act) return true;
    if (act.timing === "past") return false;

    const actIso = isoOrNull(act.isoDate);
    return actIso ? actIso >= today : true;
  });

  const programmedActs = acts.map((act) => {
    const iso = isoOrNull(act.isoDate);
    if (!iso) return act;
    return { ...act, timing: iso >= today ? ("upcoming" as const) : ("past" as const) };
  });

  return { ...data, genreMatches, programmedActs };
}

/**
 * Research stored before acts carried dates. Those matches cannot be checked
 * against today, so the writer has to be told not to trust them.
 */
export function hasUnverifiableDates(data: VenueResearchData): boolean {
  const matches = data.genreMatches ?? [];
  if (matches.length === 0) return false;
  return matches.every((match) => !isoOrNull(match.isoDate));
}
