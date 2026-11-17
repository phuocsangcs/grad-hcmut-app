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
    /** bachelor | engineer | master | phd (xem modules/content/program.ts). */
    degree: text('degree').notNull().default('bachelor'),
    /** Chương trình OISP: dự lễ OISP chung thay vì lễ của khoa. */
    oisp: boolean('oisp').notNull().default(false),
    ceremonyAt: ts('ceremony_at').notNull(),
    venue: text('venue').notNull().default('Hội trường A5'),
    templateId: text('template_id').notNull(),
    message: text('message').notNull().default(''),
    /** Lời mời trên thiệp: "<inviteLead>: <inviteeName>", ví dụ "Thương mời: Ba Mẹ". Trống → mặc định trong greetings.json. */
    inviteLead: text('invite_lead'),
    inviteeName: text('invitee_name'),
    /** @deprecated Lời chào theo nhóm (đã bỏ). Giữ cột cho dữ liệu cũ, không còn đọc/ghi. */
    greetings: jsonb('greetings').$type<Record<string, string>>().notNull().default({}),
    meetingPoiId: text('meeting_poi_id'),
    meetingTime: text('meeting_time'),
    meetingNote: text('meeting_note'),
    phone: text('phone'),
    /** Khoá file ảnh trên R2 (cards/<id>/...), phần tử đầu là ảnh bìa. */
    photos: jsonb('photos').$type<string[]>().notNull().default([]),
    /** Giờ đón khách (trước lễ) và giờ gặp sau lễ, chữ tự do như "07h00 – 07h30". Tuỳ chọn. */
    beforeTime: text('before_time'),
    afterTime: text('after_time'),
    /** Id bài nhạc nền trong src/content/music.json. */
    musicId: text('music_id'),
    rsvpEnabled: boolean('rsvp_enabled').notNull().default(true),
    rsvpDeadline: ts('rsvp_deadline'),
    /** Số người tối đa khách được báo trong một lần xác nhận. */
    rsvpMaxHeadcount: smallint('rsvp_max_headcount').notNull().default(20),
    /** Hiện lời chúc của khách công khai trên thiệp (lưu bút). */
    guestbookEnabled: boolean('guestbook_enabled').notNull().default(false),
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
    /** @deprecated Nhóm khách (đã bỏ). Giữ cột cho dữ liệu cũ. */
    groupKey: text('group_key'),
    /** Câu mời riêng cho người này (vd. "Kính mời"); trống → câu mời của thiệp. */
    greeting: text('greeting'),
    /** Lời nhắn riêng cho người này; trống → lời nhắn chung của thiệp. */
    message: text('message'),
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
    /** @deprecated Nhóm khách (đã bỏ). Giữ cột cho dữ liệu cũ. */
    groupKey: text('group_key'),
    /** Chủ thiệp ẩn lời chúc này khỏi lưu bút công khai. */
    hidden: boolean('hidden').notNull().default(false),
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

/**
 * Nhật ký đồng ý điều khoản khi tạo thiệp (bằng chứng người tạo đã đọc và chấp nhận).
 * Xoá thiệp → card_id thành null, dòng log vẫn còn nhưng không còn dữ liệu cá nhân; cron xoá sau 12 tháng.
 */
export const consentLogs = pgTable(
  'consent_logs',
  {
    id: text('id').primaryKey(),
    cardId: text('card_id').references(() => cards.id, { onDelete: 'set null' }),
    /** Phiên bản điều khoản đã đồng ý (TERMS_VERSION trong modules/legal/terms.ts). */
    termsVersion: text('terms_version').notNull(),
    /** IP băm một chiều, không lưu IP thô. */
    ipHash: text('ip_hash'),
    /** Trình duyệt (cắt ngắn), để đối chiếu khi có tranh chấp. */
    userAgent: text('user_agent'),
    acceptedAt: ts('accepted_at').notNull().defaultNow(),
  },
  (t) => [index('consent_logs_card_id_idx').on(t.cardId), index('consent_logs_accepted_at_idx').on(t.acceptedAt)],
);

/** Tin nhắn gửi qua trang Liên hệ. Chủ dự án đọc ở /admin/inbox (và qua email nếu bật Resend). */
export const contactMessages = pgTable(
  'contact_messages',
  {
    id: text('id').primaryKey(),
    name: text('name'),
    /** Cách liên lạc lại do người gửi tự nhập (email, Zalo, Facebook…). Tuỳ chọn. */
    replyTo: text('reply_to'),
    /** feedback | bug | content | other (xem contact.validators.ts). */
    topic: text('topic').notNull(),
    message: text('message').notNull(),
    /** Thiệp liên quan (slug), nếu người gửi điền. */
    cardSlug: text('card_slug'),
    ipHash: text('ip_hash'),
    readAt: ts('read_at'),
    createdAt: ts('created_at').notNull().defaultNow(),
  },
  (t) => [index('contact_messages_created_at_idx').on(t.createdAt)],
);

export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
export type Invite = typeof invites.$inferSelect;
export type NewInvite = typeof invites.$inferInsert;
export type Rsvp = typeof rsvps.$inferSelect;
export type NewRsvp = typeof rsvps.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type ConsentLog = typeof consentLogs.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
