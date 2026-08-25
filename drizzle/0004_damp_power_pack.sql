CREATE TYPE "public"."venue_scale" AS ENUM('intimate', 'club', 'midsize', 'hall', 'festival', 'institutional');--> statement-breakpoint
CREATE TYPE "public"."venue_status" AS ENUM('prospect', 'approached', 'reminder_sent', 'contact_made', 'played', 'rejected', 'permanently_closed');--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "home_url" text;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "programma_url" text;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "contact_url" text;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "status" "venue_status" DEFAULT 'prospect' NOT NULL;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "scale" "venue_scale";--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "favorite" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "archived" boolean DEFAULT false NOT NULL;