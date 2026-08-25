CREATE TYPE "public"."gig_status" AS ENUM('inquiry', 'option', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "gigs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"venue_id" uuid,
	"status" "gig_status" DEFAULT 'inquiry' NOT NULL,
	"fee" text,
	"notes" text,
	"promoter_contact_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "similar_artists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"genre" text,
	"city" text,
	"spotify_url" text,
	"website" text,
	"contact_name" text,
	"contact_email" text,
	"notes" text,
	"tags" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"city" text,
	"address" text,
	"capacity" integer,
	"email" text,
	"phone" text,
	"website" text,
	"notes" text,
	"contact_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gigs" ADD CONSTRAINT "gigs_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gigs" ADD CONSTRAINT "gigs_promoter_contact_id_contacts_id_fk" FOREIGN KEY ("promoter_contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venues" ADD CONSTRAINT "venues_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;