ALTER TABLE "cards" ADD COLUMN "before_time" text;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "after_time" text;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "music_id" text;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "rsvp_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "rsvp_deadline" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "rsvp_max_headcount" smallint DEFAULT 20 NOT NULL;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "guestbook_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "rsvps" ADD COLUMN "hidden" boolean DEFAULT false NOT NULL;