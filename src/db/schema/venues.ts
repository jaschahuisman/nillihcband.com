import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const venueStatusEnum = pgEnum("venue_status", [
  "prospect",
  "approached",
  "reminder_sent",
  "contact_made",
  "played",
  "rejected",
  "permanently_closed",
]);

export const venueScaleEnum = pgEnum("venue_scale", [
  "intimate",
  "club",
  "midsize",
  "hall",
  "festival",
  "institutional",
]);

export const venues = pgTable("venues", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  city: text("city"),
  address: text("address"),
  capacity: integer("capacity"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  homeUrl: text("home_url"),
  programmaUrl: text("programma_url"),
  contactUrl: text("contact_url"),
  region: text("region"),
  status: venueStatusEnum("status").notNull().default("prospect"),
  scale: venueScaleEnum("scale"),
  rejectionReason: text("rejection_reason"),
  favorite: boolean("favorite").notNull().default(false),
  archived: boolean("archived").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;
export type VenueStatus = (typeof venueStatusEnum.enumValues)[number];
export type VenueScale = (typeof venueScaleEnum.enumValues)[number];
