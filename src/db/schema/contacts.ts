import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const contactTypeEnum = pgEnum("contact_type", [
  "venue",
  "promoter",
  "journalist",
  "booking_agent",
  "fan",
  "collaborator",
  "supplier",
  "other",
]);

export const contactStatusEnum = pgEnum("contact_status", [
  "lead",
  "active",
  "inactive",
  "archived",
]);

export const contactPriorityEnum = pgEnum("contact_priority", [
  "low",
  "normal",
  "high",
]);

export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  organization: text("organization"),
  jobTitle: text("job_title"),
  type: contactTypeEnum("type").notNull().default("other"),
  status: contactStatusEnum("status").notNull().default("lead"),
  priority: contactPriorityEnum("priority").notNull().default("normal"),
  city: text("city"),
  country: text("country").default("NL"),
  source: text("source"),
  tags: text("tags").array(),
  notes: text("notes"),
  lastContactedAt: timestamp("last_contacted_at", { withTimezone: true }),
  createdById: uuid("created_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
