ALTER TABLE "cards" ADD COLUMN "degree" text DEFAULT 'bachelor' NOT NULL;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "oisp" boolean DEFAULT false NOT NULL;