import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const similarArtists = pgTable("similar_artists", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  genre: text("genre"),
  city: text("city"),
  spotifyUrl: text("spotify_url"),
  website: text("website"),
  notes: text("notes"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type SimilarArtist = typeof similarArtists.$inferSelect;
export type NewSimilarArtist = typeof similarArtists.$inferInsert;
