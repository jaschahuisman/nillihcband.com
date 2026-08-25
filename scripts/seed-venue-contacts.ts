import { config } from "dotenv";

config();
config({ path: ".env.local", override: true });

import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";

const { contacts, venues, venueContacts } = schema;

/**
 * People extracted from venue notes/emails where both a first name and role
 * are present in the prospect research fields.
 */
const extracted = [
  {
    venueName: "De Zwarte Ruiter",
    city: "Den Haag",
    firstName: "Marco",
    lastName: "Groenland",
    jobTitle: "Boeker",
    email: "marco@popdistrict.nl",
    type: "booking_agent" as const,
  },
  {
    venueName: "Nobel",
    city: "Leiden",
    firstName: "Jurrian",
    lastName: "Jockin",
    jobTitle: "Programmeur",
    email: null,
    type: "venue" as const,
  },
  {
    venueName: "Nobel",
    city: "Leiden",
    firstName: "Leontine",
    lastName: "de Reede",
    jobTitle: "Programmeur",
    email: null,
    type: "venue" as const,
  },
  {
    venueName: "Poppodium Boerderij",
    city: "Zoetermeer",
    firstName: "Ron",
    lastName: "Ouwehand",
    jobTitle: "Programmeur",
    email: "booking@boerderij.org",
    type: "venue" as const,
  },
  {
    venueName: "Bibelot",
    city: "Dordrecht",
    firstName: "Bart",
    lastName: "Kuntz",
    jobTitle: "Programmeur",
    email: "bart@bibelot.net",
    phone: "078-2040131",
    type: "venue" as const,
  },
  {
    venueName: "Bibelot",
    city: "Dordrecht",
    firstName: "Daniël",
    lastName: "Nagelkerke",
    jobTitle: "Programmeur",
    email: "daniel@bibelot.net",
    phone: "078-2040132",
    type: "venue" as const,
  },
  {
    venueName: "Gorcum Groove",
    city: "Gorinchem",
    firstName: "Hans",
    lastName: "Mosselman",
    jobTitle: "Programmeur",
    email: null,
    type: "venue" as const,
  },
  {
    venueName: "Gorcum Groove",
    city: "Gorinchem",
    firstName: "Marinus",
    lastName: "Aalberts",
    jobTitle: "Programmeur",
    email: null,
    type: "venue" as const,
  },
] as const;

async function seedVenueContacts() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  let createdContacts = 0;
  let linked = 0;
  let skipped = 0;

  for (const person of extracted) {
    const [venue] = await db
      .select({ id: venues.id, name: venues.name, city: venues.city })
      .from(venues)
      .where(and(eq(venues.name, person.venueName), eq(venues.city, person.city)))
      .limit(1);

    if (!venue) {
      console.warn(`Venue not found: ${person.venueName} (${person.city})`);
      skipped += 1;
      continue;
    }

    let contactId: string | undefined;

    if (person.email) {
      const [byEmail] = await db
        .select({ id: contacts.id })
        .from(contacts)
        .where(eq(contacts.email, person.email))
        .limit(1);
      contactId = byEmail?.id;
    }

    if (!contactId) {
      const [byName] = await db
        .select({ id: contacts.id })
        .from(contacts)
        .where(
          and(
            eq(contacts.firstName, person.firstName),
            eq(contacts.lastName, person.lastName ?? ""),
            eq(contacts.organization, person.venueName),
          ),
        )
        .limit(1);
      contactId = byName?.id;
    }

    if (!contactId) {
      const [created] = await db
        .insert(contacts)
        .values({
          firstName: person.firstName,
          lastName: person.lastName,
          email: person.email,
          phone: "phone" in person ? person.phone : null,
          organization: person.venueName,
          jobTitle: person.jobTitle,
          type: person.type,
          status: "lead",
          city: person.city,
          country: "NL",
          source: "venue-prospects research",
          notes: `Geëxtraheerd uit venue-prospects: ${person.jobTitle} bij ${person.venueName}.`,
        })
        .returning({ id: contacts.id });
      contactId = created.id;
      createdContacts += 1;
    } else {
      await db
        .update(contacts)
        .set({
          jobTitle: person.jobTitle,
          organization: person.venueName,
          email: person.email ?? undefined,
          phone: "phone" in person ? person.phone : undefined,
          city: person.city,
          type: person.type,
        })
        .where(eq(contacts.id, contactId));
    }

    const [existingLink] = await db
      .select({ venueId: venueContacts.venueId })
      .from(venueContacts)
      .where(
        and(
          eq(venueContacts.venueId, venue.id),
          eq(venueContacts.contactId, contactId),
        ),
      )
      .limit(1);

    if (!existingLink) {
      await db.insert(venueContacts).values({
        venueId: venue.id,
        contactId,
      });
      linked += 1;
    }

    console.log(
      `✓ ${person.firstName} ${person.lastName} (${person.jobTitle}) → ${venue.name}`,
    );
  }

  console.log(
    `\nDone: ${createdContacts} contacts created, ${linked} links added, ${skipped} skipped.`,
  );

  await client.end();
}

seedVenueContacts().catch((error) => {
  console.error(error);
  process.exit(1);
});
