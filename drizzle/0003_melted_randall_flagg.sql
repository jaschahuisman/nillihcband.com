ALTER TABLE "gigs" ADD COLUMN "title" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "gigs" ALTER COLUMN "title" DROP DEFAULT;
