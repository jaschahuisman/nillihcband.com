CREATE TABLE "gig_contacts" (
	"gig_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	CONSTRAINT "gig_contacts_gig_id_contact_id_pk" PRIMARY KEY("gig_id","contact_id")
);
--> statement-breakpoint
CREATE TABLE "similar_artist_contacts" (
	"similar_artist_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	CONSTRAINT "similar_artist_contacts_similar_artist_id_contact_id_pk" PRIMARY KEY("similar_artist_id","contact_id")
);
--> statement-breakpoint
CREATE TABLE "venue_contacts" (
	"venue_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	CONSTRAINT "venue_contacts_venue_id_contact_id_pk" PRIMARY KEY("venue_id","contact_id")
);
--> statement-breakpoint
ALTER TABLE "gigs" DROP CONSTRAINT "gigs_promoter_contact_id_contacts_id_fk";
--> statement-breakpoint
ALTER TABLE "venues" DROP CONSTRAINT "venues_contact_id_contacts_id_fk";
--> statement-breakpoint
ALTER TABLE "gig_contacts" ADD CONSTRAINT "gig_contacts_gig_id_gigs_id_fk" FOREIGN KEY ("gig_id") REFERENCES "public"."gigs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gig_contacts" ADD CONSTRAINT "gig_contacts_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "similar_artist_contacts" ADD CONSTRAINT "similar_artist_contacts_similar_artist_id_similar_artists_id_fk" FOREIGN KEY ("similar_artist_id") REFERENCES "public"."similar_artists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "similar_artist_contacts" ADD CONSTRAINT "similar_artist_contacts_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venue_contacts" ADD CONSTRAINT "venue_contacts_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venue_contacts" ADD CONSTRAINT "venue_contacts_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gigs" DROP COLUMN "promoter_contact_id";--> statement-breakpoint
ALTER TABLE "similar_artists" DROP COLUMN "contact_name";--> statement-breakpoint
ALTER TABLE "similar_artists" DROP COLUMN "contact_email";--> statement-breakpoint
ALTER TABLE "venues" DROP COLUMN "contact_id";