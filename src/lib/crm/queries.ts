import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  contacts,
  gigContacts,
  gigs,
  similarArtistContacts,
  similarArtists,
  venueContacts,
  venueNotes,
  venues,
  type Contact,
  type Gig,
  type SimilarArtist,
  type Venue,
  type VenueNote,
} from "@/db/schema";
import { requireSessionUser } from "@/lib/auth";
import { formatContactName } from "@/lib/crm/labels";

export type ContactOption = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  organization: string | null;
  jobTitle: string | null;
  type: Contact["type"];
  city: string | null;
};

export type LinkedContact = ContactOption;

export type VenueNoteEntry = Pick<VenueNote, "id" | "venueId" | "body" | "createdAt">;

export type GigWithRelations = Gig & {
  venueName: string | null;
  contacts: LinkedContact[];
};

export type VenueWithContacts = Venue & {
  contacts: LinkedContact[];
  noteEntries: VenueNoteEntry[];
};
export type SimilarArtistWithContacts = SimilarArtist & {
  contacts: LinkedContact[];
};

const contactOptionColumns = {
  id: contacts.id,
  firstName: contacts.firstName,
  lastName: contacts.lastName,
  email: contacts.email,
  phone: contacts.phone,
  organization: contacts.organization,
  jobTitle: contacts.jobTitle,
  type: contacts.type,
  city: contacts.city,
} as const;

function mapContactOption(contact: ContactOption): LinkedContact {
  return contact;
}

async function loadContactsByEntity<
  T extends { entityId: string; contactId: string },
>(
  links: T[],
  contactRows: ContactOption[],
): Promise<Map<string, LinkedContact[]>> {
  const contactById = new Map(contactRows.map((contact) => [contact.id, contact]));
  const grouped = new Map<string, LinkedContact[]>();

  for (const link of links) {
    const contact = contactById.get(link.contactId);
    if (!contact) continue;

    const existing = grouped.get(link.entityId) ?? [];
    existing.push(mapContactOption(contact));
    grouped.set(link.entityId, existing);
  }

  return grouped;
}

export async function getContactOptions(): Promise<ContactOption[]> {
  await requireSessionUser();
  return db
    .select(contactOptionColumns)
    .from(contacts)
    .orderBy(asc(contacts.firstName), asc(contacts.lastName));
}

export async function getContacts(): Promise<Contact[]> {
  await requireSessionUser();
  return db.select().from(contacts).orderBy(desc(contacts.updatedAt));
}

async function attachVenueContacts(
  venueRows: Venue[],
): Promise<VenueWithContacts[]> {
  if (venueRows.length === 0) return [];

  const venueIds = venueRows.map((venue) => venue.id);

  const [links, noteRows] = await Promise.all([
    db
      .select({
        entityId: venueContacts.venueId,
        contactId: venueContacts.contactId,
      })
      .from(venueContacts)
      .where(inArray(venueContacts.venueId, venueIds)),
    db
      .select({
        id: venueNotes.id,
        venueId: venueNotes.venueId,
        body: venueNotes.body,
        createdAt: venueNotes.createdAt,
      })
      .from(venueNotes)
      .where(inArray(venueNotes.venueId, venueIds))
      .orderBy(desc(venueNotes.createdAt)),
  ]);

  const contactIds = [...new Set(links.map((link) => link.contactId))];
  const contactRows =
    contactIds.length > 0
      ? await db
          .select(contactOptionColumns)
          .from(contacts)
          .where(inArray(contacts.id, contactIds))
      : [];

  const grouped = await loadContactsByEntity(links, contactRows);
  const notesByVenue = new Map<string, VenueNoteEntry[]>();

  for (const note of noteRows) {
    const existing = notesByVenue.get(note.venueId) ?? [];
    existing.push(note);
    notesByVenue.set(note.venueId, existing);
  }

  return venueRows.map((venue) => ({
    ...venue,
    contacts: grouped.get(venue.id) ?? [],
    noteEntries: notesByVenue.get(venue.id) ?? [],
  }));
}

export async function getVenues(): Promise<VenueWithContacts[]> {
  await requireSessionUser();
  const venueRows = await db
    .select()
    .from(venues)
    .orderBy(desc(venues.favorite), desc(venues.updatedAt));

  return attachVenueContacts(venueRows);
}

export async function getVenue(
  venueId: string,
): Promise<VenueWithContacts | null> {
  await requireSessionUser();
  const [venue] = await db
    .select()
    .from(venues)
    .where(eq(venues.id, venueId))
    .limit(1);

  if (!venue) return null;

  const [withContacts] = await attachVenueContacts([venue]);
  return withContacts ?? null;
}

export async function getGigs(): Promise<GigWithRelations[]> {
  await requireSessionUser();
  const gigRows = await db
    .select({
      id: gigs.id,
      title: gigs.title,
      date: gigs.date,
      venueId: gigs.venueId,
      status: gigs.status,
      fee: gigs.fee,
      notes: gigs.notes,
      createdAt: gigs.createdAt,
      updatedAt: gigs.updatedAt,
      venueName: venues.name,
    })
    .from(gigs)
    .leftJoin(venues, eq(gigs.venueId, venues.id))
    .orderBy(desc(gigs.date));

  if (gigRows.length === 0) return [];

  const links = await db
    .select({
      entityId: gigContacts.gigId,
      contactId: gigContacts.contactId,
    })
    .from(gigContacts)
    .where(
      inArray(
        gigContacts.gigId,
        gigRows.map((gig) => gig.id),
      ),
    );

  const contactIds = [...new Set(links.map((link) => link.contactId))];
  const contactRows =
    contactIds.length > 0
      ? await db
          .select(contactOptionColumns)
          .from(contacts)
          .where(inArray(contacts.id, contactIds))
      : [];

  const grouped = await loadContactsByEntity(links, contactRows);

  return gigRows.map((gig) => ({
    ...gig,
    contacts: grouped.get(gig.id) ?? [],
  }));
}

export async function getSimilarArtists(): Promise<SimilarArtistWithContacts[]> {
  await requireSessionUser();
  const artistRows = await db
    .select()
    .from(similarArtists)
    .orderBy(desc(similarArtists.updatedAt));

  if (artistRows.length === 0) return [];

  const links = await db
    .select({
      entityId: similarArtistContacts.similarArtistId,
      contactId: similarArtistContacts.contactId,
    })
    .from(similarArtistContacts)
    .where(
      inArray(
        similarArtistContacts.similarArtistId,
        artistRows.map((artist) => artist.id),
      ),
    );

  const contactIds = [...new Set(links.map((link) => link.contactId))];
  const contactRows =
    contactIds.length > 0
      ? await db
          .select(contactOptionColumns)
          .from(contacts)
          .where(inArray(contacts.id, contactIds))
      : [];

  const grouped = await loadContactsByEntity(links, contactRows);

  return artistRows.map((artist) => ({
    ...artist,
    contacts: grouped.get(artist.id) ?? [],
  }));
}

export async function getVenueOptions() {
  await requireSessionUser();
  return db
    .select({ id: venues.id, name: venues.name, city: venues.city })
    .from(venues)
    .where(eq(venues.archived, false))
    .orderBy(venues.name);
}

export function formatContactList(items: LinkedContact[]) {
  if (items.length === 0) return "—";
  return items.map((contact) => formatContactName(contact)).join(", ");
}
