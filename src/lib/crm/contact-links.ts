import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  gigContacts,
  similarArtistContacts,
  venueContacts,
} from "@/db/schema";

export async function syncVenueContacts(venueId: string, contactIds: string[]) {
  await db.delete(venueContacts).where(eq(venueContacts.venueId, venueId));

  if (contactIds.length === 0) return;

  await db.insert(venueContacts).values(
    contactIds.map((contactId) => ({ venueId, contactId })),
  );
}

export async function syncGigContacts(gigId: string, contactIds: string[]) {
  await db.delete(gigContacts).where(eq(gigContacts.gigId, gigId));

  if (contactIds.length === 0) return;

  await db.insert(gigContacts).values(
    contactIds.map((contactId) => ({ gigId, contactId })),
  );
}

export async function syncSimilarArtistContacts(
  similarArtistId: string,
  contactIds: string[],
) {
  await db
    .delete(similarArtistContacts)
    .where(eq(similarArtistContacts.similarArtistId, similarArtistId));

  if (contactIds.length === 0) return;

  await db.insert(similarArtistContacts).values(
    contactIds.map((contactId) => ({ similarArtistId, contactId })),
  );
}

export function uniqueContactIds(contactIds: string[]) {
  return [...new Set(contactIds.filter(Boolean))];
}
