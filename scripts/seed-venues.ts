import { config } from "dotenv";

config();
config({ path: ".env.local", override: true });

import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { venueProspects } from "./data/venue-prospects";

const { venues } = schema;

async function seedVenues() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  let created = 0;
  let updated = 0;

  for (const prospect of venueProspects) {
    const values = {
      name: prospect.name,
      city: prospect.city,
      region: prospect.region,
      scale: prospect.scale,
      email: prospect.email ?? null,
      phone: prospect.phone ?? null,
      homeUrl: prospect.homeUrl ?? null,
      website: prospect.homeUrl ?? null,
      notes: prospect.notes,
      favorite: prospect.favorite ?? false,
      status: "prospect" as const,
      archived: false,
    };

    const [existing] = await db
      .select({ id: venues.id })
      .from(venues)
      .where(and(eq(venues.name, prospect.name), eq(venues.city, prospect.city)))
      .limit(1);

    if (existing) {
      await db.update(venues).set(values).where(eq(venues.id, existing.id));
      updated += 1;
    } else {
      await db.insert(venues).values(values);
      created += 1;
    }
  }

  console.log(
    `Venues seeded: ${created} created, ${updated} updated (${venueProspects.length} total).`,
  );

  await client.end();
}

seedVenues().catch((error) => {
  console.error(error);
  process.exit(1);
});
