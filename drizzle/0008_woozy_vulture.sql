CREATE TYPE "public"."research_finding_kind" AS ENUM('venue_field', 'contact', 'artist');--> statement-breakpoint
CREATE TYPE "public"."research_finding_status" AS ENUM('pending', 'applied', 'dismissed');--> statement-breakpoint
CREATE TABLE "research_findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid NOT NULL,
	"research_id" uuid,
	"kind" "research_finding_kind" NOT NULL,
	"field" text,
	"label" text NOT NULL,
	"value" jsonb NOT NULL,
	"current_value" text,
	"source_url" text,
	"dedupe_key" text NOT NULL,
	"status" "research_finding_status" DEFAULT 'pending' NOT NULL,
	"applied_entity_id" uuid,
	"resolved_at" timestamp with time zone,
	"resolved_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "research_finding_dedupe" UNIQUE("venue_id","dedupe_key")
);
--> statement-breakpoint
ALTER TABLE "research_findings" ADD CONSTRAINT "research_findings_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_findings" ADD CONSTRAINT "research_findings_research_id_venue_research_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."venue_research"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_findings" ADD CONSTRAINT "research_findings_resolved_by_id_users_id_fk" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;