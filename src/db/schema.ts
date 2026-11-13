import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

const ts = (name: string) => timestamp(name, { withTimezone: true });

/** Thiệp của một tân cử nhân. Một người = một thiệp = một slug = một link quản lý. */
export const cards = pgTable(
  'cards',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    displayName: text('display_name').notNull(),
    facultyId: text('faculty_id').notNull(),
    ceremonyAt: ts('ceremony_at').notNull(),
    venue: text('venue').notNull().default('Hội trường A5'),
    templateId: text('template_id').notNull(),
    message: text('message').notNull().default(''),
    /** Override lời chào theo nhóm: { parents: "...", friends: "..." } */
    greetings: jsonb('greetings').$type<Record<string, string>>().notNull().default({}),
    meetingPoiId: text('meeting_poi_id'),
    meetingTime: text('meeting_time'),
    meetingNote: text('meeting_note'),
    phone: text('phone'),
    manageTokenHash: text('manage_token_hash').notNull().unique(),
    ownerEmail: text('owner_email'),
    locked: boolean('locked').notNull().default(false),
    viewCount: integer('view_count').notNull().default(0),
    expiresAt: ts('expires_at').notNull(),
    createdAt: ts('created_at').notNull().defaultNow(),
    updatedAt: ts('updated_at').notNull().defaultNow(),
  },
  (t) => [index('cards_expires_at_idx').on(t.expiresAt), index('cards_faculty_id_idx').on(t.facultyId)],
);

/** Người nhận riêng của một thiệp, tạo hàng loạt. Link: /[slug]/[code] */
export const invites = pgTable(
  'invites',
  {
    id: text('id').primaryKey(),
    cardId: text('card_id')
      .notNull()
      .references(() => cards.id, { onDelete: 'cascade' }),
    code: text('code').notNull(),
    recipientName: text('recipient_name').notNull(),
    groupKey: text('group_key'),
    greeting: text('greeting'),
    templateId: text('template_id'),
    sortOrder: integer('sort_order').notNull().default(0),
    viewCount: integer('view_count').notNull().default(0),
    createdAt: ts('created_at').notNull().defaultNow(),
    updatedAt: ts('updated_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('invites_card_code_key').on(t.cardId, t.code), index('invites_card_id_idx').on(t.cardId)],
);

/** RSVP + lời chúc. Unique theo (card, client) để khách mở lại không bị hỏi lại. */
export const rsvps = pgTable(
  'rsvps',
  {
    id: text('id').primaryKey(),
    cardId: text('card_id')
      .notNull()
      .references(() => cards.id, { onDelete: 'cascade' }),
    inviteId: text('invite_id').references(() => invites.id, { onDelete: 'set null' }),
    clientId: text('client_id').notNull(),
    guestName: text('guest_name').notNull(),
    headcount: smallint('headcount').notNull().default(1),
    wish: text('wish'),
    groupKey: text('group_key'),
    createdAt: ts('created_at').notNull().defaultNow(),
    updatedAt: ts('updated_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('rsvps_card_client_key').on(t.cardId, t.clientId),
    index('rsvps_card_id_idx').on(t.cardId),
    index('rsvps_invite_id_idx').on(t.inviteId),
  ],
);

/** Báo cáo vi phạm. */
export const reports = pgTable(
  'reports',
  {
    id: text('id').primaryKey(),
    cardId: text('card_id')
      .notNull()
      .references(() => cards.id, { onDelete: 'cascade' }),
    reason: text('reason').notNull(),
    detail: text('detail'),
    reporterIpHash: text('reporter_ip_hash'),
    createdAt: ts('created_at').notNull().defaultNow(),
  },
  (t) => [index('reports_card_id_idx').on(t.cardId)],
);

export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
export type Invite = typeof invites.$inferSelect;
export type NewInvite = typeof invites.$inferInsert;
export type Rsvp = typeof rsvps.$inferSelect;
export type NewRsvp = typeof rsvps.$inferInsert;
export type Report = typeof reports.$inferSelect;
