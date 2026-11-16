import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { rsvps, type NewRsvp, type Rsvp } from '@/db/schema';

export const rsvpRepo = {
  /** Upsert theo (card_id, client_id): khách gửi lại thì cập nhật, không tạo dòng mới. */
  upsert: async (data: NewRsvp): Promise<Rsvp> => {
    const [row] = await db
      .insert(rsvps)
      .values(data)
      .onConflictDoUpdate({
        target: [rsvps.cardId, rsvps.clientId],
        set: {
          guestName: data.guestName,
          headcount: data.headcount,
          wish: data.wish ?? null,
          inviteId: data.inviteId ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();
    return row;
  },

  findByClient: (cardId: string, clientId: string) =>
    db.query.rsvps.findFirst({ where: and(eq(rsvps.cardId, cardId), eq(rsvps.clientId, clientId)) }),

  listByCard: (cardId: string): Promise<Rsvp[]> =>
    db.query.rsvps.findMany({ where: eq(rsvps.cardId, cardId), orderBy: desc(rsvps.createdAt) }),

  summary: async (cardId: string) => {
    const [row] = await db
      .select({
        responses: sql<number>`count(*)::int`,
        guests: sql<number>`coalesce(sum(${rsvps.headcount}), 0)::int`,
        wishes: sql<number>`count(*) filter (where ${rsvps.wish} is not null and ${rsvps.wish} <> '')::int`,
      })
      .from(rsvps)
      .where(eq(rsvps.cardId, cardId));
    return row;
  },

  /** Lời chúc hiện công khai (lưu bút): chưa bị ẩn, có nội dung, mới nhất trước. */
  listWishes: (cardId: string, limit = 30) =>
    db
      .select({ id: rsvps.id, name: rsvps.guestName, wish: rsvps.wish })
      .from(rsvps)
      .where(and(eq(rsvps.cardId, cardId), eq(rsvps.hidden, false), sql`${rsvps.wish} is not null and ${rsvps.wish} <> ''`))
      .orderBy(desc(rsvps.createdAt))
      .limit(limit),

  setHidden: async (cardId: string, rsvpId: string, hidden: boolean): Promise<boolean> => {
    const rows = await db
      .update(rsvps)
      .set({ hidden, updatedAt: new Date() })
      .where(and(eq(rsvps.cardId, cardId), eq(rsvps.id, rsvpId)))
      .returning({ id: rsvps.id });
    return rows.length > 0;
  },

  delete: async (cardId: string, rsvpId: string): Promise<boolean> => {
    const rows = await db
      .delete(rsvps)
      .where(and(eq(rsvps.cardId, cardId), eq(rsvps.id, rsvpId)))
      .returning({ id: rsvps.id });
    return rows.length > 0;
  },
};
