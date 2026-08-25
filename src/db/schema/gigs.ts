import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { venues } from "./venues";

export const gigStatusEnum = pgEnum("gig_status", [
  "inquiry",
  "option",
  "confirmed",
  "completed",
  "cancelled",
]);

export const gigs = pgTable("gigs", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  venueId: uuid("venue_id").references(() => venues.id, {
    onDelete: "set null",
  }),
  status: gigStatusEnum("status").notNull().default("inquiry"),
  fee: text("fee"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Gig = typeof gigs.$inferSelect;
export type NewGig = typeof gigs.$inferInsert;
