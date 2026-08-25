CREATE TABLE "venue_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "venue_notes" ADD CONSTRAINT "venue_notes_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venue_notes" ADD CONSTRAINT "venue_notes_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
INSERT INTO "venue_notes" ("venue_id", "body", "created_at")
SELECT "id", "notes", COALESCE("updated_at", "created_at")
FROM "venues"
WHERE "notes" IS NOT NULL AND btrim("notes") <> '';--> statement-breakpoint
UPDATE "venues" SET "notes" = NULL WHERE "notes" IS NOT NULL;
