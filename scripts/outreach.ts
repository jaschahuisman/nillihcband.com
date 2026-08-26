/**
 * Headless entry point for the outreach engine.
 *
 * Runs the exact same code path as the CRM buttons, which makes it both a smoke
 * test and the seam for future automation (cron, queue, bulk selection).
 *
 *   pnpm outreach research "Dizzy"
 *   pnpm outreach draft "Dizzy" --angle=double_bill
 *   pnpm outreach draft "Dizzy" --kind=reminder
 *   pnpm outreach run "Dizzy"            # research + draft in one go
 */
import { config } from "dotenv";

config();
config({ path: ".env.local", override: true });

import type { OutreachAngle, OutreachKind } from "../src/db/schema";

// Everything below is imported lazily: the db client reads DATABASE_URL at
// module scope, which must happen after dotenv has run.
type Command = "research" | "draft" | "run";

function parseFlags(argv: string[]) {
  const flags = new Map<string, string>();
  for (const arg of argv) {
    const match = /^--([^=]+)=(.*)$/.exec(arg);
    if (match) flags.set(match[1], match[2]);
  }
  return flags;
}

async function findVenue(query: string) {
  const { ilike, or } = await import("drizzle-orm");
  const { db } = await import("../src/db");
  const { venues } = await import("../src/db/schema");

  const matches = await db
    .select({ id: venues.id, name: venues.name, city: venues.city })
    .from(venues)
    .where(or(ilike(venues.name, `%${query}%`), ilike(venues.city, `%${query}%`)))
    .limit(5);

  if (matches.length === 0) {
    throw new Error(`Geen venue gevonden voor "${query}".`);
  }
  if (matches.length > 1) {
    const list = matches.map((venue) => `  - ${venue.name} (${venue.city})`).join("\n");
    console.log(`Meerdere treffers, eerste wordt gebruikt:\n${list}\n`);
  }

  return matches[0];
}

async function main() {
  const [command, query, ...rest] = process.argv.slice(2) as [
    Command | undefined,
    string | undefined,
    ...string[],
  ];

  if (!command || !query) {
    console.error(
      'Gebruik: pnpm outreach <research|draft|run> "<venue naam>" [--kind=initial|reminder|follow_up] [--angle=...] [--instructions="..."]',
    );
    process.exit(1);
  }

  const flags = parseFlags(rest);
  const { generateDraftForVenue, researchVenueById } = await import(
    "../src/lib/outreach/service"
  );

  const venue = await findVenue(query);
  console.log(`Venue: ${venue.name}${venue.city ? ` (${venue.city})` : ""}\n`);

  if (command === "research" || command === "run") {
    console.log("Onderzoek draait…");
    const research = await researchVenueById(venue.id, null);
    console.log(`\nFit: ${research.data.fitScore}/100 — ${research.data.fitReasoning}`);
    console.log(`Samenvatting: ${research.summary}`);
    console.log(`Positionering: ${research.data.positioning}`);
    console.log(`Genres: ${research.data.programmingGenres.join(", ") || "—"}`);
    if (research.data.genreMatches.length > 0) {
      console.log("Verwante acts:");
      for (const match of research.data.genreMatches) {
        console.log(`  - ${match.artist} (${match.strength}): ${match.why}`);
      }
    }
    if (research.data.hooks.length > 0) {
      console.log("Haakjes:");
      for (const hook of research.data.hooks) console.log(`  - ${hook}`);
    }
    console.log(
      `Aanbevolen invalshoek: ${research.data.recommendedAngles[0]?.angle ?? "—"}`,
    );
    console.log(`Bronnen: ${research.sources.length}`);
    console.log(`Nieuwe vondsten voor het CRM: ${research.newFindings}\n`);
  }

  if (command === "draft" || command === "run") {
    console.log("Mail schrijven…");
    const result = await generateDraftForVenue(
      {
        venueId: venue.id,
        kind: (flags.get("kind") as OutreachKind | undefined) ?? "initial",
        angle: (flags.get("angle") as OutreachAngle | undefined) ?? null,
        instructions: flags.get("instructions") ?? null,
      },
      null,
    );

    console.log(`\n--- versie ${result.version.versionNumber} (${result.version.angle}) ---`);
    console.log(`Onderwerp: ${result.version.subject}\n`);
    console.log(result.version.body);
    console.log(`\nWaarom: ${result.version.rationale}`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
