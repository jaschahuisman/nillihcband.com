import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { contacts } from "./contacts";
import { gigs } from "./gigs";
import { similarArtists } from "./similar-artists";
import { venues } from "./venues";

export const venueContacts = pgTable(
  "venue_contacts",
  {
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.venueId, table.contactId] })],
);

export const gigContacts = pgTable(
  "gig_contacts",
  {
    gigId: uuid("gig_id")
      .notNull()
      .references(() => gigs.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.gigId, table.contactId] })],
);

export const similarArtistContacts = pgTable(
  "similar_artist_contacts",
  {
    similarArtistId: uuid("similar_artist_id")
      .notNull()
      .references(() => similarArtists.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.similarArtistId, table.contactId] }),
  ],
);
