CREATE TYPE "public"."contact_priority" AS ENUM('low', 'normal', 'high');--> statement-breakpoint
CREATE TYPE "public"."contact_status" AS ENUM('lead', 'active', 'inactive', 'archived');--> statement-breakpoint
CREATE TYPE "public"."contact_type" AS ENUM('venue', 'promoter', 'journalist', 'booking_agent', 'fan', 'collaborator', 'supplier', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('superadmin', 'admin', 'member');--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text,
	"email" text,
	"phone" text,
	"organization" text,
	"job_title" text,
	"type" "contact_type" DEFAULT 'other' NOT NULL,
	"status" "contact_status" DEFAULT 'lead' NOT NULL,
	"priority" "contact_priority" DEFAULT 'normal' NOT NULL,
	"city" text,
	"country" text DEFAULT 'NL',
	"source" text,
	"tags" text[],
	"notes" text,
	"last_contacted_at" timestamp with time zone,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text,
	"role" "user_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;