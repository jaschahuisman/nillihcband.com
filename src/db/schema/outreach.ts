import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { contacts } from "./contacts";
import { users } from "./users";
import { venues } from "./venues";

export const outreachKindEnum = pgEnum("outreach_kind", [
  "initial",
  "reminder",
  "follow_up",
]);

export const outreachAngleEnum = pgEnum("outreach_angle", [
  "direct_booking",
  "support_act",
  "double_bill",
  "series_fit",
  "festival_slot",
]);

export const outreachDraftStatusEnum = pgEnum("outreach_draft_status", [
  "draft",
  "approved",
  "sent",
  "archived",
]);

export const researchFindingKindEnum = pgEnum("research_finding_kind", [
  "venue_field",
  "contact",
  "artist",
]);

export const researchFindingStatusEnum = pgEnum("research_finding_status", [
  "pending",
  "applied",
  "dismissed",
]);

/**
 * One research run per row so earlier findings stay auditable; the newest row
 * for a venue is the one the generator uses.
 */
export const venueResearch = pgTable("venue_research", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  data: jsonb("data").notNull(),
  sources: jsonb("sources").notNull().default([]),
  model: text("model").notNull(),
  fitScore: integer("fit_score"),
  createdById: uuid("created_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const outreachDrafts = pgTable("outreach_drafts", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id").references(() => contacts.id, {
    onDelete: "set null",
  }),
  kind: outreachKindEnum("kind").notNull().default("initial"),
  status: outreachDraftStatusEnum("status").notNull().default("draft"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
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

export const outreachDraftVersions = pgTable(
  "outreach_draft_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    draftId: uuid("draft_id")
      .notNull()
      .references(() => outreachDrafts.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    language: text("language").notNull().default("nl"),
    angle: outreachAngleEnum("angle"),
    rationale: text("rationale"),
    talkingPoints: jsonb("talking_points").notNull().default([]),
    instructions: text("instructions"),
    researchId: uuid("research_id").references(() => venueResearch.id, {
      onDelete: "set null",
    }),
    model: text("model"),
    edited: boolean("edited").notNull().default(false),
    selected: boolean("selected").notNull().default(false),
    createdById: uuid("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique("outreach_draft_version_number").on(table.draftId, table.versionNumber)],
);

/**
 * Reviewable queue of things research turned up that the CRM does not have yet.
 * `dedupe_key` makes re-running research idempotent: an already applied or
 * dismissed finding never comes back.
 */
export const researchFindings = pgTable(
  "research_findings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "cascade" }),
    researchId: uuid("research_id").references(() => venueResearch.id, {
      onDelete: "set null",
    }),
    kind: researchFindingKindEnum("kind").notNull(),
    /** Venue column name for `venue_field` findings. */
    field: text("field"),
    label: text("label").notNull(),
    value: jsonb("value").notNull(),
    /** What the CRM holds today, so the UI can show a before/after. */
    currentValue: text("current_value"),
    sourceUrl: text("source_url"),
    dedupeKey: text("dedupe_key").notNull(),
    status: researchFindingStatusEnum("status").notNull().default("pending"),
    appliedEntityId: uuid("applied_entity_id"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedById: uuid("resolved_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique("research_finding_dedupe").on(table.venueId, table.dedupeKey)],
);

export type VenueResearchRow = typeof venueResearch.$inferSelect;
export type ResearchFinding = typeof researchFindings.$inferSelect;
export type ResearchFindingKind = (typeof researchFindingKindEnum.enumValues)[number];
export type ResearchFindingStatus =
  (typeof researchFindingStatusEnum.enumValues)[number];
export type OutreachDraft = typeof outreachDrafts.$inferSelect;
export type OutreachDraftVersion = typeof outreachDraftVersions.$inferSelect;
export type OutreachKind = (typeof outreachKindEnum.enumValues)[number];
export type OutreachAngle = (typeof outreachAngleEnum.enumValues)[number];
export type OutreachDraftStatus =
  (typeof outreachDraftStatusEnum.enumValues)[number];
