CREATE TABLE "consent_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"card_id" text,
	"terms_version" text NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"reply_to" text,
	"topic" text NOT NULL,
	"message" text NOT NULL,
	"card_slug" text,
	"ip_hash" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "consent_logs" ADD CONSTRAINT "consent_logs_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "consent_logs_card_id_idx" ON "consent_logs" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "consent_logs_accepted_at_idx" ON "consent_logs" USING btree ("accepted_at");--> statement-breakpoint
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");