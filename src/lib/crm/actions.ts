"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  contactPriorityEnum,
  contactStatusEnum,
  contactTypeEnum,
  contacts,
  gigStatusEnum,
  gigs,
  similarArtists,
  venueNotes,
  venueScaleEnum,
  venueStatusEnum,
  venues,
} from "@/db/schema";
import { requireSessionUser } from "@/lib/auth";
import {
  syncGigContacts,
  syncSimilarArtistContacts,
  syncVenueContacts,
  uniqueContactIds,
} from "@/lib/crm/contact-links";

const CRM_PATHS = [
  "/crm",
  "/crm/contacts",
  "/crm/venues",
  "/crm/gigs",
  "/crm/similar-artists",
] as const;

function revalidateCrm() {
  for (const path of CRM_PATHS) {
    revalidatePath(path);
  }
}

export type ActionResult = { ok: true } | { ok: false; error: string };
export type UpsertVenueResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
export type UpsertContactResult =
  | {
      ok: true;
      id: string;
      contact: {
        id: string;
        firstName: string;
        lastName: string | null;
        email: string | null;
        phone: string | null;
        organization: string | null;
        jobTitle: string | null;
        type: (typeof contactTypeEnum.enumValues)[number];
        city: string | null;
      };
    }
  | { ok: false; error: string };

export async function upsertContact(
  input: {
    id?: string;
    firstName: string;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    organization?: string | null;
    jobTitle?: string | null;
    type?: (typeof contactTypeEnum.enumValues)[number];
    status?: (typeof contactStatusEnum.enumValues)[number];
    priority?: (typeof contactPriorityEnum.enumValues)[number];
    city?: string | null;
    source?: string | null;
    notes?: string | null;
    tags?: string[] | null;
  },
): Promise<UpsertContactResult> {
  const user = await requireSessionUser();
  const firstName = input.firstName.trim();

  if (!firstName) {
    return { ok: false, error: "Voornaam is verplicht." };
  }

  const type = input.type ?? "other";
  const status = input.status ?? "lead";
  const priority = input.priority ?? "normal";

  if (!contactTypeEnum.enumValues.includes(type)) {
    return { ok: false, error: "Ongeldig contacttype." };
  }

  if (!contactStatusEnum.enumValues.includes(status)) {
    return { ok: false, error: "Ongeldige status." };
  }

  if (!contactPriorityEnum.enumValues.includes(priority)) {
    return { ok: false, error: "Ongeldige prioriteit." };
  }

  const values = {
    firstName,
    lastName: input.lastName?.trim() || null,
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    organization: input.organization?.trim() || null,
    jobTitle: input.jobTitle?.trim() || null,
    type,
    status,
    priority,
    city: input.city?.trim() || null,
    source: input.source?.trim() || null,
    notes: input.notes?.trim() || null,
    tags: input.tags?.length ? input.tags : null,
  };

  try {
    let contactId = input.id;

    if (input.id) {
      await db.update(contacts).set(values).where(eq(contacts.id, input.id));
    } else {
      const [created] = await db
        .insert(contacts)
        .values({ ...values, createdById: user.id })
        .returning({ id: contacts.id });
      contactId = created.id;
    }

    if (!contactId) {
      return { ok: false, error: "Contact kon niet worden opgeslagen." };
    }

    revalidateCrm();
    return {
      ok: true,
      id: contactId,
      contact: {
        id: contactId,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        organization: values.organization,
        jobTitle: values.jobTitle,
        type: values.type,
        city: values.city,
      },
    };
  } catch {
    return { ok: false, error: "Contact kon niet worden opgeslagen." };
  }
}

export async function deleteContact(contactId: string): Promise<ActionResult> {
  await requireSessionUser();

  try {
    await db.delete(contacts).where(eq(contacts.id, contactId));
    revalidateCrm();
    return { ok: true };
  } catch {
    return { ok: false, error: "Contact kon niet worden verwijderd." };
  }
}

export async function upsertVenue(
  input: {
    id?: string;
    name: string;
    city?: string | null;
    address?: string | null;
    capacity?: number | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    homeUrl?: string | null;
    programmaUrl?: string | null;
    contactUrl?: string | null;
    region?: string | null;
    status?: (typeof venueStatusEnum.enumValues)[number];
    scale?: (typeof venueScaleEnum.enumValues)[number] | null;
    rejectionReason?: string | null;
    favorite?: boolean;
    archived?: boolean;
    contactIds?: string[];
  },
): Promise<UpsertVenueResult> {
  await requireSessionUser();
  const name = input.name.trim();

  if (!name) {
    return { ok: false, error: "Naam is verplicht." };
  }

  const status = input.status ?? "prospect";
  if (!venueStatusEnum.enumValues.includes(status)) {
    return { ok: false, error: "Ongeldige status." };
  }

  const scale = input.scale || null;
  if (scale && !venueScaleEnum.enumValues.includes(scale)) {
    return { ok: false, error: "Ongeldige schaal." };
  }

  if (status === "rejected" && !input.rejectionReason?.trim()) {
    return { ok: false, error: "Reden van afwijzing is verplicht." };
  }

  const homeUrl = input.homeUrl?.trim() || input.website?.trim() || null;

  const values = {
    name,
    city: input.city?.trim() || null,
    address: input.address?.trim() || null,
    capacity: input.capacity ?? null,
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    website: homeUrl,
    homeUrl,
    programmaUrl: input.programmaUrl?.trim() || null,
    contactUrl: input.contactUrl?.trim() || null,
    region: input.region?.trim() || null,
    status,
    scale,
    rejectionReason:
      status === "rejected" ? input.rejectionReason?.trim() || null : null,
    favorite: input.favorite ?? false,
    archived: input.archived ?? false,
  };

  try {
    let venueId = input.id;

    if (input.id) {
      await db.update(venues).set(values).where(eq(venues.id, input.id));
    } else {
      const [created] = await db
        .insert(venues)
        .values(values)
        .returning({ id: venues.id });
      venueId = created.id;
    }

    if (!venueId) {
      return { ok: false, error: "Venue kon niet worden opgeslagen." };
    }

    await syncVenueContacts(venueId, uniqueContactIds(input.contactIds ?? []));

    revalidateCrm();
    revalidatePath(`/crm/venues/${venueId}`);
    return { ok: true, id: venueId };
  } catch {
    return { ok: false, error: "Venue kon niet worden opgeslagen." };
  }
}

export async function toggleVenueFavorite(venueId: string): Promise<ActionResult> {
  await requireSessionUser();

  try {
    const [venue] = await db
      .select({ favorite: venues.favorite })
      .from(venues)
      .where(eq(venues.id, venueId))
      .limit(1);

    if (!venue) {
      return { ok: false, error: "Venue niet gevonden." };
    }

    await db
      .update(venues)
      .set({ favorite: !venue.favorite })
      .where(eq(venues.id, venueId));

    revalidateCrm();
    revalidatePath(`/crm/venues/${venueId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Favoriet kon niet worden bijgewerkt." };
  }
}

export async function setVenueArchived(
  venueId: string,
  archived: boolean,
): Promise<ActionResult> {
  await requireSessionUser();

  try {
    await db.update(venues).set({ archived }).where(eq(venues.id, venueId));
    revalidateCrm();
    revalidatePath(`/crm/venues/${venueId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Archiefstatus kon niet worden bijgewerkt." };
  }
}

export async function setVenueStatus(
  venueId: string,
  status: (typeof venueStatusEnum.enumValues)[number],
  rejectionReason?: string | null,
): Promise<ActionResult> {
  await requireSessionUser();

  if (!venueStatusEnum.enumValues.includes(status)) {
    return { ok: false, error: "Ongeldige status." };
  }

  try {
    const [venue] = await db
      .select({ rejectionReason: venues.rejectionReason })
      .from(venues)
      .where(eq(venues.id, venueId))
      .limit(1);

    if (!venue) {
      return { ok: false, error: "Venue niet gevonden." };
    }

    const reason =
      rejectionReason?.trim() || venue.rejectionReason?.trim() || null;

    if (status === "rejected" && !reason) {
      return { ok: false, error: "Reden van afwijzing is verplicht." };
    }

    await db
      .update(venues)
      .set({
        status,
        rejectionReason: status === "rejected" ? reason : null,
      })
      .where(eq(venues.id, venueId));

    revalidateCrm();
    revalidatePath(`/crm/venues/${venueId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Status kon niet worden bijgewerkt." };
  }
}

export async function deleteVenue(venueId: string): Promise<ActionResult> {
  await requireSessionUser();

  try {
    await db.delete(venues).where(eq(venues.id, venueId));
    revalidateCrm();
    revalidatePath(`/crm/venues/${venueId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Venue kon niet worden verwijderd." };
  }
}

export type AddVenueNoteResult =
  | {
      ok: true;
      note: {
        id: string;
        venueId: string;
        body: string;
        createdAt: Date;
      };
    }
  | { ok: false; error: string };

export async function addVenueNote(
  venueId: string,
  body: string,
): Promise<AddVenueNoteResult> {
  const user = await requireSessionUser();
  const text = body.trim();

  if (!text) {
    return { ok: false, error: "Notitie mag niet leeg zijn." };
  }

  try {
    const [venue] = await db
      .select({ id: venues.id })
      .from(venues)
      .where(eq(venues.id, venueId))
      .limit(1);

    if (!venue) {
      return { ok: false, error: "Venue niet gevonden." };
    }

    const [note] = await db
      .insert(venueNotes)
      .values({
        venueId,
        body: text,
        createdById: user.id,
      })
      .returning({
        id: venueNotes.id,
        venueId: venueNotes.venueId,
        body: venueNotes.body,
        createdAt: venueNotes.createdAt,
      });

    revalidateCrm();
    revalidatePath(`/crm/venues/${venueId}`);
    return { ok: true, note };
  } catch {
    return { ok: false, error: "Notitie kon niet worden opgeslagen." };
  }
}

export async function deleteVenueNote(noteId: string): Promise<ActionResult> {
  await requireSessionUser();

  try {
    const [note] = await db
      .select({ venueId: venueNotes.venueId })
      .from(venueNotes)
      .where(eq(venueNotes.id, noteId))
      .limit(1);

    if (!note) {
      return { ok: false, error: "Notitie niet gevonden." };
    }

    await db.delete(venueNotes).where(eq(venueNotes.id, noteId));
    revalidateCrm();
    revalidatePath(`/crm/venues/${note.venueId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Notitie kon niet worden verwijderd." };
  }
}

export async function upsertGig(
  input: {
    id?: string;
    title: string;
    date: string;
    venueId?: string | null;
    status?: (typeof gigStatusEnum.enumValues)[number];
    fee?: string | null;
    notes?: string | null;
    contactIds?: string[];
  },
): Promise<ActionResult> {
  await requireSessionUser();

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Titel is verplicht." };
  }

  const date = new Date(input.date);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "Ongeldige datum." };
  }

  const status = input.status ?? "inquiry";
  if (!gigStatusEnum.enumValues.includes(status)) {
    return { ok: false, error: "Ongeldige status." };
  }

  const values = {
    title,
    date,
    venueId: input.venueId || null,
    status,
    fee: input.fee?.trim() || null,
    notes: input.notes?.trim() || null,
  };

  try {
    let gigId = input.id;

    if (input.id) {
      await db.update(gigs).set(values).where(eq(gigs.id, input.id));
    } else {
      const [created] = await db
        .insert(gigs)
        .values(values)
        .returning({ id: gigs.id });
      gigId = created.id;
    }

    if (gigId) {
      await syncGigContacts(gigId, uniqueContactIds(input.contactIds ?? []));
    }

    revalidateCrm();
    return { ok: true };
  } catch {
    return { ok: false, error: "Optreden kon niet worden opgeslagen." };
  }
}

export async function deleteGig(gigId: string): Promise<ActionResult> {
  await requireSessionUser();

  try {
    await db.delete(gigs).where(eq(gigs.id, gigId));
    revalidateCrm();
    return { ok: true };
  } catch {
    return { ok: false, error: "Optreden kon niet worden verwijderd." };
  }
}

export async function upsertSimilarArtist(
  input: {
    id?: string;
    name: string;
    genre?: string | null;
    city?: string | null;
    spotifyUrl?: string | null;
    website?: string | null;
    notes?: string | null;
    tags?: string[] | null;
    contactIds?: string[];
  },
): Promise<ActionResult> {
  await requireSessionUser();
  const name = input.name.trim();

  if (!name) {
    return { ok: false, error: "Naam is verplicht." };
  }

  const values = {
    name,
    genre: input.genre?.trim() || null,
    city: input.city?.trim() || null,
    spotifyUrl: input.spotifyUrl?.trim() || null,
    website: input.website?.trim() || null,
    notes: input.notes?.trim() || null,
    tags: input.tags?.length ? input.tags : null,
  };

  try {
    let artistId = input.id;

    if (input.id) {
      await db
        .update(similarArtists)
        .set(values)
        .where(eq(similarArtists.id, input.id));
    } else {
      const [created] = await db
        .insert(similarArtists)
        .values(values)
        .returning({ id: similarArtists.id });
      artistId = created.id;
    }

    if (artistId) {
      await syncSimilarArtistContacts(
        artistId,
        uniqueContactIds(input.contactIds ?? []),
      );
    }

    revalidateCrm();
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Vergelijkbare artiest kon niet worden opgeslagen.",
    };
  }
}

export async function deleteSimilarArtist(
  artistId: string,
): Promise<ActionResult> {
  await requireSessionUser();

  try {
    await db.delete(similarArtists).where(eq(similarArtists.id, artistId));
    revalidateCrm();
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Vergelijkbare artiest kon niet worden verwijderd.",
    };
  }
}
