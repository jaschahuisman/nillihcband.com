import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { venues } from "./venues";

export const venueNotes = pgTable("venue_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdById: uuid("created_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type VenueNote = typeof venueNotes.$inferSelect;
export type NewVenueNote = typeof venueNotes.$inferInsert;
