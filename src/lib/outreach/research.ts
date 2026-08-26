import { generateObject } from "ai";
import type { Venue } from "@/db/schema";
import { renderBandProfile } from "@/lib/outreach/band-profile";
import { OutreachError } from "@/lib/outreach/errors";
import {
  hasJinaKey,
  normaliseUrl,
  readPage,
  searchWeb,
  type ReadPageResult,
  type SearchHit,
} from "@/lib/outreach/jina";
import { researchModel, researchModelId } from "@/lib/outreach/model";
import {
  outreachAngleDescriptions,
  venueResearchSchema,
  type ResearchSource,
  type VenueResearchData,
} from "@/lib/outreach/schemas";
import {
  hasUnverifiableDates,
  keepUpcomingMatches,
  todayIso,
} from "@/lib/outreach/timing";

const MAX_PAGE_READS = 5;
const MAX_CORPUS_CHARS = 90_000;

export type ResearchResult = {
  summary: string;
  data: VenueResearchData;
  sources: ResearchSource[];
  model: string;
};

type SeedUrl = { url: string; kind: ResearchSource["kind"] };

function seedUrls(venue: Venue): SeedUrl[] {
  const candidates: SeedUrl[] = [
    { url: venue.homeUrl ?? venue.website ?? "", kind: "home" },
    { url: venue.programmaUrl ?? "", kind: "programma" },
    { url: venue.contactUrl ?? "", kind: "contact" },
  ];

  const seen = new Set<string>();
  const result: SeedUrl[] = [];

  for (const candidate of candidates) {
    const url = normaliseUrl(candidate.url);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    result.push({ url, kind: candidate.kind });
  }

  return result;
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function venueLabel(venue: Venue): string {
  return [venue.name, venue.city].filter(Boolean).join(" ");
}

async function discoverOfficialSite(venue: Venue): Promise<SearchHit | null> {
  const hits = await searchWeb(
    `${venue.name} ${venue.city ?? ""} podium officiële website programma`.trim(),
    { num: 4 },
  );
  return hits[0] ?? null;
}

async function gatherSearchHits(venue: Venue, knownHost: string | null) {
  const label = venueLabel(venue);
  const year = new Date().getFullYear();

  const queries = [
    `${label} agenda komende concerten ${year} ${year + 1}`,
    `${label} jazz funk fusion live optreden aankomend`,
    `${label} boekingen programmering contact programmeur`,
  ];

  const results = await Promise.all(
    queries.map((query) => searchWeb(query, { num: 5 })),
  );

  const seen = new Set<string>();
  const hits: SearchHit[] = [];

  for (const group of results) {
    for (const hit of group) {
      if (seen.has(hit.url)) continue;
      seen.add(hit.url);
      hits.push(hit);
    }
  }

  // Pages on the venue's own domain are the most trustworthy, so rank them up.
  return hits.sort((a, b) => {
    const aOwn = knownHost && hostOf(a.url) === knownHost ? 0 : 1;
    const bOwn = knownHost && hostOf(b.url) === knownHost ? 0 : 1;
    return aOwn - bOwn;
  });
}

function renderCorpus(
  venue: Venue,
  pages: Array<{ source: ResearchSource; page: ReadPageResult }>,
  hits: SearchHit[],
): string {
  const parts: string[] = [];

  parts.push(`# CRM-gegevens van de venue`);
  parts.push(
    [
      `- Naam: ${venue.name}`,
      `- Stad: ${venue.city ?? "onbekend"}`,
      `- Regio: ${venue.region ?? "onbekend"}`,
      `- Adres: ${venue.address ?? "onbekend"}`,
      `- Capaciteit in CRM: ${venue.capacity ?? "onbekend"}`,
      `- Schaal in CRM: ${venue.scale ?? "onbekend"}`,
      `- E-mail in CRM: ${venue.email ?? "onbekend"}`,
      `- Status in CRM: ${venue.status}`,
    ].join("\n"),
  );

  if (hits.length > 0) {
    parts.push(`\n# Zoekresultaten`);
    parts.push(
      hits
        .slice(0, 15)
        .map(
          (hit) =>
            `- [${hit.title}](${hit.url})${hit.date ? ` (${hit.date})` : ""}\n  ${hit.description}`,
        )
        .join("\n"),
    );
  }

  for (const { source, page } of pages) {
    parts.push(`\n# Pagina (${source.kind}): ${page.title || source.url}`);
    parts.push(`URL: ${page.url}`);
    parts.push(page.content);
  }

  const corpus = parts.join("\n");
  return corpus.length > MAX_CORPUS_CHARS
    ? `${corpus.slice(0, MAX_CORPUS_CHARS)}\n\n[afgekapt]`
    : corpus;
}

const RESEARCH_SYSTEM_PROMPT = `Je bent een research-analist voor een Nederlandse boekingsagent. Je leest ruwe websitetekst en zoekresultaten over een podium en destilleert daar harde, bruikbare feiten uit voor een boekingsmail.

Regels:
- Baseer je uitsluitend op het aangeleverde bronmateriaal. Verzin niets.
- Als iets niet in de bronnen staat, gebruik dan null of een lege lijst en benoem het in dataGaps.
- Neem alleen artiestennamen op die letterlijk in de bronnen voorkomen.
- Wees kritisch: als het podium geen live muziek programmeert, of alleen coverbands, klassiek of dance, zeg dat dan en geef een lage fitScore.
- hooks moeten concreet en verifieerbaar zijn (een specifieke reeks, een specifieke act, een specifieke zaal of avond). Niet "gezellig podium met mooie programmering".
- Schrijf alle tekstvelden in het Nederlands.

## Datums: verleden en toekomst strikt uit elkaar houden
De datum van vandaag staat in de prompt. Die is leidend, niet je eigen aanname over het huidige jaar.
- Bepaal voor elke gevonden act de datum en zet die om naar JJJJ-MM-DD in isoDate.
- Staat er geen jaartal bij een datum (bijvoorbeeld "vr 14 maart")? Dan hoort die datum bij een agenda die vooruit kijkt: kies het eerstvolgende jaar waarin die dag-maandcombinatie op of na vandaag valt. Twijfel je echt, gebruik dan null voor isoDate.
- Een archief-, terugblik- of "afgelopen"-pagina bevat optredens die geweest zijn, ook als er geen jaartal bij staat.
- timing is "past" zodra de datum vóór vandaag ligt, anders "upcoming".

## genreMatches gaat alleen over de toekomst
genreMatches wordt gebruikt om Nillihc samen met die act op één affiche te krijgen. Dat kan alleen bij een optreden dat nog moet plaatsvinden.
- Zet in genreMatches uitsluitend acts met een datum vanaf vandaag.
- Een act die er vorig seizoen speelde hoort NOOIT in genreMatches, hoe goed de muzikale match ook is. Zulke acts zet je in programmedActs met timing "past"; ze tellen wel mee voor programmingGenres en fitScore.
- Vind je geen enkele aankomende match, laat genreMatches dan leeg. Een lege lijst is beter dan een act uit het archief.

Extra aandacht voor venueDetails, discoveredContacts en genreMatches: die worden gebruikt om het CRM aan te vullen.
- Neem in venueDetails alleen waarden op die letterlijk op een pagina staan. Kopieer e-mailadressen, telefoonnummers en URL's exact over; verzin geen varianten en gok geen adressen.
- URL's altijd volledig, inclusief https://.
- Neem in discoveredContacts alleen mensen met een echte naam op. Sla generieke inboxen zoals info@ of een contactformulier over; die horen in venueDetails of booking.
- Vul bij genreMatches genre, city en website in als je die vindt, anders null.`;

/**
 * Scrapes what is knowable about a venue and turns it into a structured
 * briefing. Throws when neither Jina nor Gemini is configured; individual
 * page failures are tolerated.
 */
export async function runVenueResearch(venue: Venue): Promise<ResearchResult> {
  if (!hasJinaKey()) {
    throw new OutreachError(
      "JINA_API_KEY ontbreekt. Zet de key in je environment om venue-onderzoek te gebruiken.",
    );
  }

  const seeds = seedUrls(venue);
  let knownHost = seeds.length > 0 ? hostOf(seeds[0].url) : null;

  if (seeds.length === 0) {
    const discovered = await discoverOfficialSite(venue);
    if (discovered) {
      seeds.push({ url: discovered.url, kind: "discovered" });
      knownHost = hostOf(discovered.url);
    }
  }

  const hits = await gatherSearchHits(venue, knownHost);

  const seenUrls = new Set(seeds.map((seed) => seed.url));
  const extraSeeds: SeedUrl[] = [];
  for (const hit of hits) {
    if (seeds.length + extraSeeds.length >= MAX_PAGE_READS) break;
    if (seenUrls.has(hit.url)) continue;
    if (knownHost && hostOf(hit.url) !== knownHost) continue;
    seenUrls.add(hit.url);
    extraSeeds.push({ url: hit.url, kind: "discovered" });
  }

  const toRead = [...seeds, ...extraSeeds].slice(0, MAX_PAGE_READS);
  const readResults = await Promise.all(
    toRead.map(async (seed) => ({ seed, page: await readPage(seed.url) })),
  );

  const pages = readResults
    .filter(
      (entry): entry is { seed: SeedUrl; page: ReadPageResult } => entry.page !== null,
    )
    .map(({ seed, page }) => ({
      source: {
        url: page.url,
        title: page.title || seed.url,
        kind: seed.kind,
        chars: page.content.length,
      } satisfies ResearchSource,
      page,
    }));

  if (pages.length === 0 && hits.length === 0) {
    throw new OutreachError(
      "Geen bronnen gevonden voor deze venue. Vul een Home URL of Programma URL in en probeer opnieuw.",
    );
  }

  const angleGuide = Object.entries(outreachAngleDescriptions)
    .map(([angle, description]) => `- ${angle}: ${description}`)
    .join("\n");

  const now = new Date();
  const today = todayIso(now);

  const { object } = await generateObject({
    model: researchModel(),
    schema: venueResearchSchema,
    temperature: 0.2,
    system: RESEARCH_SYSTEM_PROMPT,
    prompt: [
      `Analyseer het podium "${venueLabel(venue)}" voor een boekingsaanvraag van de band Nillihc.`,
      ``,
      `Vandaag is het ${new Intl.DateTimeFormat("nl-NL", { dateStyle: "full", timeZone: "Europe/Amsterdam" }).format(now)} (${today}).`,
      `Alles vóór deze datum is verleden tijd. Nillihc kan alleen nog op affiches komen van optredens vanaf deze datum.`,
      ``,
      renderBandProfile(),
      ``,
      `# Mogelijke invalshoeken`,
      angleGuide,
      ``,
      `# Bronmateriaal`,
      renderCorpus(venue, pages, hits),
    ].join("\n"),
  });

  const sources: ResearchSource[] = [
    ...pages.map(({ source }) => source),
    ...hits.slice(0, 10).map(
      (hit): ResearchSource => ({
        url: hit.url,
        title: hit.title,
        kind: "search",
        chars: 0,
      }),
    ),
  ];

  return {
    summary: object.venueSummary,
    data: keepUpcomingMatches(object, today),
    sources,
    model: researchModelId(),
  };
}

/** Markdown briefing handed to the email writer. */
export function renderResearchBriefing(data: VenueResearchData): string {
  const lines: string[] = [
    `## Wat voor plek is dit`,
    data.venueSummary,
    `Positionering: ${data.positioning}`,
    `Fit-score: ${data.fitScore}/100 — ${data.fitReasoning}`,
  ];

  if (data.programmingGenres.length > 0) {
    lines.push(`Programmeert: ${data.programmingGenres.join(", ")}`);
  }
  if (data.programmingRhythm) {
    lines.push(`Ritme: ${data.programmingRhythm}`);
  }
  if (data.audienceProfile) {
    lines.push(`Publiek: ${data.audienceProfile}`);
  }
  if (data.capacityEstimate) {
    lines.push(`Geschatte capaciteit: ${data.capacityEstimate}`);
  }

  const matches = data.genreMatches ?? [];
  if (matches.length > 0) {
    lines.push(
      ``,
      `## Aankomende verwante acts (kandidaten om samen mee op het affiche te staan)`,
    );
    if (hasUnverifiableDates(data)) {
      lines.push(
        `Let op: dit onderzoek is van vóór de datumcontrole, dus het is niet zeker dat deze optredens nog moeten komen. Stel geen gedeeld affiche voor met een van deze acts; houd de vraag open.`,
      );
    }
    for (const match of matches) {
      const when = match.eventDate ?? match.isoDate;
      lines.push(
        `- ${match.artist}${when ? ` op ${when}` : " (datum onbekend)"} — ${match.strength}: ${match.why}`,
      );
    }
  } else {
    lines.push(
      ``,
      `## Aankomende verwante acts`,
      `Geen. Er staat op dit moment geen muzikaal verwante act op hun agenda, dus een dubbelconcert of voorprogramma kan niet aan een concrete act opgehangen worden.`,
    );
  }

  const acts = data.programmedActs ?? [];
  const upcoming = acts.filter((act) => act.timing === "upcoming");
  const past = acts.filter((act) => act.timing === "past");

  const renderAct = (act: (typeof acts)[number]) => {
    const meta = [act.date, act.genre].filter(Boolean).join(", ");
    return `- ${act.name}${meta ? ` (${meta})` : ""}`;
  };

  if (upcoming.length > 0) {
    lines.push(``, `## Staat binnenkort op de agenda`);
    lines.push(...upcoming.slice(0, 12).map(renderAct));
  }

  if (past.length > 0) {
    lines.push(
      ``,
      `## Eerder geprogrammeerd (alleen als bewijs van hun smaak)`,
      `Deze optredens zijn geweest. Je mag ernaar verwijzen om te laten zien dat je hun programmering kent, maar stel nooit voor om samen met deze acts te spelen.`,
    );
    lines.push(...past.slice(0, 12).map(renderAct));
  }

  lines.push(``, `## Boekingsroute`);
  lines.push(`Kanaal: ${data.booking.channel}`);
  if (data.booking.contactName) lines.push(`Contactpersoon: ${data.booking.contactName}`);
  if (data.booking.email) lines.push(`E-mail: ${data.booking.email}`);
  if (data.booking.formUrl) lines.push(`Formulier: ${data.booking.formUrl}`);
  if (data.booking.instructions) lines.push(`Instructies: ${data.booking.instructions}`);
  if (data.booking.submissionWindow) lines.push(`Timing: ${data.booking.submissionWindow}`);

  if (data.hooks.length > 0) {
    lines.push(``, `## Concrete haakjes voor de mail`);
    for (const hook of data.hooks) lines.push(`- ${hook}`);
  }

  if (data.risks.length > 0) {
    lines.push(``, `## Risico's en gevoeligheden`);
    for (const risk of data.risks) lines.push(`- ${risk}`);
  }

  if (data.recommendedAngles.length > 0) {
    lines.push(``, `## Aanbevolen invalshoeken`);
    for (const angle of data.recommendedAngles) {
      lines.push(
        `- ${angle.angle} (vertrouwen ${angle.confidence.toFixed(2)}): ${angle.reasoning}`,
      );
    }
  }

  if (data.dataGaps.length > 0) {
    lines.push(``, `## Onbekend gebleven`);
    for (const gap of data.dataGaps) lines.push(`- ${gap}`);
  }

  return lines.join("\n");
}
