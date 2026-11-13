# Đề xuất DB schema (Supabase / Postgres)

Nguyên tắc:
- Chỉ lưu trong DB những gì **người dùng tạo ra**: thiệp, người nhận, RSVP, báo cáo.
- Dữ liệu tĩnh (khoa, POI, quán ăn, mẫu thiệp, nhóm khách) nằm trong JSON, DB chỉ lưu **id tham chiếu** dạng text.
- Không lưu token quản lý dạng thô, chỉ lưu hash.
- Mọi thời gian là `timestamptz`, server tính theo `Asia/Ho_Chi_Minh`.
- Chỉ server (Next.js) gọi DB qua Drizzle, không có client Supabase ở browser → MVP không cần RLS.

---

## Sơ đồ

```
cards 1 ──< invites 1 ──< rsvps (invite_id tuỳ chọn)
cards 1 ──< rsvps        (RSVP từ link chung không có invite_id)
cards 1 ──< reports
```

Một thiệp = một tân cử nhân = một slug = một link quản lý. Người nhận (`invites`) là bản ghi con,
được tạo hàng loạt từ bảng. Link riêng: `/[slug]/[code]`.

---

## Bảng `cards` – thiệp của tân cử nhân

| Cột | Kiểu | Null | Mặc định | Ghi chú |
|---|---|---|---|---|
| id | text | no | nanoid(12) sinh ở app | PK |
| slug | text | no | | UNIQUE, lowercase kebab, 3–40 ký tự, kiểm tra ngay khi gõ (H1) |
| display_name | text | no | | Tên hiển thị trên thiệp |
| faculty_id | text | no | | id trong `faculties.json` |
| ceremony_at | timestamptz | no | | Tự điền từ khoa, chủ thiệp sửa được |
| venue | text | no | `'Hội trường A5'` | |
| template_id | text | no | | id trong `templates.json` |
| message | text | no | `''` | Lời nhắn chung, tối đa 500 ký tự |
| greetings | jsonb | no | `'{}'` | Override lời chào theo nhóm, ví dụ `{"parents": "Ba mẹ ơi…"}`; thiếu key thì dùng preset (H3) |
| meeting_poi_id | text | yes | | Điểm hẹn, id trong `pois.json` (H4) |
| meeting_time | text | yes | | Giờ hẹn dạng chữ, ví dụ `"16h00"` |
| meeting_note | text | yes | | Ghi chú thêm cho điểm hẹn |
| phone | text | yes | | Số điện thoại cho nút gọi `tel:` (G6) |
| manage_token_hash | text | no | | SHA-256 của token quản lý, UNIQUE (F4) |
| owner_email | text | yes | | Tuỳ chọn, để gửi lại link quản lý (H6) |
| locked | boolean | no | `false` | Admin set khi có báo cáo vi phạm, slug trả 404 (A2) |
| view_count | integer | no | `0` | Tăng mỗi lần mở thiệp công khai (A3) |
| expires_at | timestamptz | no | | = `ceremony_at` + 30 ngày, dùng cho F5 và script dọn dẹp |
| created_at | timestamptz | no | `now()` | |
| updated_at | timestamptz | no | `now()` | App cập nhật khi PATCH |

Index: `cards_slug_key` (unique), `cards_manage_token_hash_key` (unique), `cards_expires_at_idx` (cho cleanup), `cards_faculty_id_idx` (cho stats theo khoa).

## Bảng `invites` – người nhận (tạo hàng loạt)

| Cột | Kiểu | Null | Mặc định | Ghi chú |
|---|---|---|---|---|
| id | text | no | nanoid(12) | PK |
| card_id | text | no | | FK → cards.id, ON DELETE CASCADE |
| code | text | no | | 6 ký tự a–z0–9 (bỏ `0 o 1 l i`), dùng trong URL `/[slug]/[code]`. UNIQUE theo `(card_id, code)` |
| recipient_name | text | no | | Tên hiện trên thiệp: "Cô Hoa", "Ba Mẹ" |
| group_key | text | yes | | `parents / grandparents / family / friends`, để chọn preset lời chào |
| greeting | text | yes | | Lời chào riêng. Null → dùng `card.greetings[group_key]` → preset |
| template_id | text | yes | | Mẫu riêng. Null → dùng `card.template_id` |
| sort_order | integer | no | `0` | Giữ thứ tự như lúc dán vào |
| view_count | integer | no | `0` | Biết người đó đã mở link chưa |
| created_at | timestamptz | no | `now()` | |
| updated_at | timestamptz | no | `now()` | |

Index: `invites_card_code_key` UNIQUE `(card_id, code)`, `invites_card_id_idx`.
Giới hạn ở app: tối đa 200 người nhận / thiệp.

## Bảng `rsvps` – xác nhận tham dự và lời chúc

| Cột | Kiểu | Null | Mặc định | Ghi chú |
|---|---|---|---|---|
| id | text | no | nanoid(12) | PK |
| card_id | text | no | | FK → cards.id, ON DELETE CASCADE |
| invite_id | text | yes | | FK → invites.id, ON DELETE SET NULL. Có khi RSVP từ link riêng, null khi từ link chung |
| client_id | text | no | | Random id lưu trong localStorage của khách, dùng để upsert và hiện "Đã xác nhận ✓" |
| guest_name | text | no | | Điền sẵn từ `invites.recipient_name` nếu có, khách sửa được |
| headcount | smallint | no | `1` | 1–20 |
| wish | text | yes | | Lời chúc, tối đa 300 ký tự |
| group_key | text | yes | | `parents / grandparents / family / friends`, lấy từ `?to=` |
| created_at | timestamptz | no | `now()` | |
| updated_at | timestamptz | no | `now()` | |

Index: `rsvps_card_client_key` UNIQUE `(card_id, client_id)`, `rsvps_card_id_idx`, `rsvps_invite_id_idx`.

Tại sao unique theo `client_id` chứ không theo `invite_id`: một link riêng "Ba Mẹ" có thể được 2 người (ba và mẹ) cùng mở trên 2 máy, mỗi người RSVP riêng vẫn hợp lệ.

## Bảng `reports` – báo cáo vi phạm

| Cột | Kiểu | Null | Mặc định | Ghi chú |
|---|---|---|---|---|
| id | text | no | nanoid(12) | PK |
| card_id | text | no | | FK → cards.id, ON DELETE CASCADE |
| reason | text | no | | enum ở app: `spam / offensive / impersonation / other` |
| detail | text | yes | | Tối đa 500 ký tự |
| reporter_ip_hash | text | yes | | Hash IP để chống spam báo cáo, không lưu IP thô |
| created_at | timestamptz | no | `now()` | |

Index: `reports_card_id_idx`.

---

## SQL tương ứng (migration đầu tiên)

```sql
create table cards (
  id                text primary key,
  slug              text not null unique,
  display_name      text not null,
  faculty_id        text not null,
  ceremony_at       timestamptz not null,
  venue             text not null default 'Hội trường A5',
  template_id       text not null,
  message           text not null default '',
  greetings         jsonb not null default '{}'::jsonb,
  meeting_poi_id    text,
  meeting_time      text,
  meeting_note      text,
  phone             text,
  manage_token_hash text not null unique,
  owner_email       text,
  locked            boolean not null default false,
  view_count        integer not null default 0,
  expires_at        timestamptz not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index cards_expires_at_idx on cards (expires_at);
create index cards_faculty_id_idx on cards (faculty_id);

create table invites (
  id             text primary key,
  card_id        text not null references cards(id) on delete cascade,
  code           text not null,
  recipient_name text not null,
  group_key      text,
  greeting       text,
  template_id    text,
  sort_order     integer not null default 0,
  view_count     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (card_id, code)
);
create index invites_card_id_idx on invites (card_id);

create table rsvps (
  id          text primary key,
  card_id     text not null references cards(id) on delete cascade,
  invite_id   text references invites(id) on delete set null,
  client_id   text not null,
  guest_name  text not null,
  headcount   smallint not null default 1 check (headcount between 1 and 20),
  wish        text,
  group_key   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (card_id, client_id)
);
create index rsvps_card_id_idx on rsvps (card_id);
create index rsvps_invite_id_idx on rsvps (invite_id);

create table reports (
  id               text primary key,
  card_id          text not null references cards(id) on delete cascade,
  reason           text not null,
  detail           text,
  reporter_ip_hash text,
  created_at       timestamptz not null default now()
);
create index reports_card_id_idx on reports (card_id);
```

## Drizzle schema (phác thảo `src/db/schema.ts`)

```ts
import { pgTable, text, boolean, integer, smallint, timestamp, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const cards = pgTable('cards', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  displayName: text('display_name').notNull(),
  facultyId: text('faculty_id').notNull(),
  ceremonyAt: timestamp('ceremony_at', { withTimezone: true }).notNull(),
  venue: text('venue').notNull().default('Hội trường A5'),
  templateId: text('template_id').notNull(),
  message: text('message').notNull().default(''),
  greetings: jsonb('greetings').$type<Record<string, string>>().notNull().default({}),
  meetingPoiId: text('meeting_poi_id'),
  meetingTime: text('meeting_time'),
  meetingNote: text('meeting_note'),
  phone: text('phone'),
  manageTokenHash: text('manage_token_hash').notNull().unique(),
  ownerEmail: text('owner_email'),
  locked: boolean('locked').notNull().default(false),
  viewCount: integer('view_count').notNull().default(0),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('cards_expires_at_idx').on(t.expiresAt),
  index('cards_faculty_id_idx').on(t.facultyId),
]);

export const invites = pgTable('invites', {
  id: text('id').primaryKey(),
  cardId: text('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  recipientName: text('recipient_name').notNull(),
  groupKey: text('group_key'),
  greeting: text('greeting'),
  templateId: text('template_id'),
  sortOrder: integer('sort_order').notNull().default(0),
  viewCount: integer('view_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('invites_card_code_key').on(t.cardId, t.code),
  index('invites_card_id_idx').on(t.cardId),
]);

export const rsvps = pgTable('rsvps', {
  id: text('id').primaryKey(),
  cardId: text('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  inviteId: text('invite_id').references(() => invites.id, { onDelete: 'set null' }),
  clientId: text('client_id').notNull(),
  guestName: text('guest_name').notNull(),
  headcount: smallint('headcount').notNull().default(1),
  wish: text('wish'),
  groupKey: text('group_key'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('rsvps_card_client_key').on(t.cardId, t.clientId),
  index('rsvps_card_id_idx').on(t.cardId),
  index('rsvps_invite_id_idx').on(t.inviteId),
]);

export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  cardId: text('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  detail: text('detail'),
  reporterIpHash: text('reporter_ip_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('reports_card_id_idx').on(t.cardId)]);
```

## Query thống kê cho admin (A3) – `scripts/stats.sql`

```sql
select
  (select count(*) from cards)                         as total_cards,
  (select count(*) from cards where locked)            as locked_cards,
  (select coalesce(sum(view_count), 0) from cards)     as total_views,
  (select count(*) from invites)                       as total_invites,
  (select count(*) from rsvps)                         as total_rsvps,
  (select coalesce(sum(headcount), 0) from rsvps)      as total_guests;

select faculty_id, count(*) as cards
from cards group by faculty_id order by cards desc;
```

## Query trang quản lý: ai đã mời, ai đã mở, ai đã xác nhận

```sql
select i.recipient_name, i.group_key, i.code, i.view_count,
       r.headcount, r.wish, r.created_at as rsvp_at
from invites i
left join rsvps r on r.invite_id = i.id
where i.card_id = $1
order by i.sort_order;
```

## Câu hỏi còn mở (bạn quyết)
1. `expires_at` = ceremony + 30 ngày có hợp lý không, hay để 60 ngày cho mùa tốt nghiệp kéo dài?
2. Có cần lưu `view_count` theo ngày (bảng riêng) để vẽ biểu đồ không? MVP tôi đề xuất chỉ 1 số tổng.
3. `phone` có muốn mã hoá không? Hiện tôi để text thường vì chủ thiệp tự chọn hiển thị công khai cho khách gọi.
4. Người nhận có được **đổi mẫu riêng** không (cột `invites.template_id`)? Tôi để có vì bạn hỏi, nhưng nếu muốn đơn giản thì bỏ cột này, tất cả người nhận dùng chung mẫu thiệp.
5. Giới hạn 200 người nhận / thiệp có đủ không?
