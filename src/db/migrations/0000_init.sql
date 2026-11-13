CREATE TABLE "cards" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"faculty_id" text NOT NULL,
	"ceremony_at" timestamp with time zone NOT NULL,
	"venue" text DEFAULT 'Hội trường A5' NOT NULL,
	"template_id" text NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"greetings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"meeting_poi_id" text,
	"meeting_time" text,
	"meeting_note" text,
	"phone" text,
	"manage_token_hash" text NOT NULL,
	"owner_email" text,
	"locked" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cards_slug_unique" UNIQUE("slug"),
	CONSTRAINT "cards_manage_token_hash_unique" UNIQUE("manage_token_hash")
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" text PRIMARY KEY NOT NULL,
	"card_id" text NOT NULL,
	"code" text NOT NULL,
	"recipient_name" text NOT NULL,
	"group_key" text,
	"greeting" text,
	"template_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"card_id" text NOT NULL,
	"reason" text NOT NULL,
	"detail" text,
	"reporter_ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rsvps" (
	"id" text PRIMARY KEY NOT NULL,
	"card_id" text NOT NULL,
	"invite_id" text,
	"client_id" text NOT NULL,
	"guest_name" text NOT NULL,
	"headcount" smallint DEFAULT 1 NOT NULL,
	"wish" text,
	"group_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cards_expires_at_idx" ON "cards" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "cards_faculty_id_idx" ON "cards" USING btree ("faculty_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invites_card_code_key" ON "invites" USING btree ("card_id","code");--> statement-breakpoint
CREATE INDEX "invites_card_id_idx" ON "invites" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "reports_card_id_idx" ON "reports" USING btree ("card_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rsvps_card_client_key" ON "rsvps" USING btree ("card_id","client_id");--> statement-breakpoint
CREATE INDEX "rsvps_card_id_idx" ON "rsvps" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "rsvps_invite_id_idx" ON "rsvps" USING btree ("invite_id");