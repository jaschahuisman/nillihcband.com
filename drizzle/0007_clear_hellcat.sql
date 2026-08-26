CREATE TYPE "public"."outreach_angle" AS ENUM('direct_booking', 'support_act', 'double_bill', 'series_fit', 'festival_slot');--> statement-breakpoint
CREATE TYPE "public"."outreach_draft_status" AS ENUM('draft', 'approved', 'sent', 'archived');--> statement-breakpoint
CREATE TYPE "public"."outreach_kind" AS ENUM('initial', 'reminder', 'follow_up');--> statement-breakpoint
CREATE TABLE "outreach_draft_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"draft_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"language" text DEFAULT 'nl' NOT NULL,
	"angle" "outreach_angle",
	"rationale" text,
	"talking_points" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"instructions" text,
	"research_id" uuid,
	"model" text,
	"edited" boolean DEFAULT false NOT NULL,
	"selected" boolean DEFAULT false NOT NULL,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "outreach_draft_version_number" UNIQUE("draft_id","version_number")
);
--> statement-breakpoint
CREATE TABLE "outreach_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid NOT NULL,
	"contact_id" uuid,
	"kind" "outreach_kind" DEFAULT 'initial' NOT NULL,
	"status" "outreach_draft_status" DEFAULT 'draft' NOT NULL,
	"sent_at" timestamp with time zone,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "venue_research" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid NOT NULL,
	"summary" text NOT NULL,
	"data" jsonb NOT NULL,
	"sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"model" text NOT NULL,
	"fit_score" integer,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "outreach_draft_versions" ADD CONSTRAINT "outreach_draft_versions_draft_id_outreach_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."outreach_drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach_draft_versions" ADD CONSTRAINT "outreach_draft_versions_research_id_venue_research_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."venue_research"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach_draft_versions" ADD CONSTRAINT "outreach_draft_versions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach_drafts" ADD CONSTRAINT "outreach_drafts_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach_drafts" ADD CONSTRAINT "outreach_drafts_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach_drafts" ADD CONSTRAINT "outreach_drafts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venue_research" ADD CONSTRAINT "venue_research_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venue_research" ADD CONSTRAINT "venue_research_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;