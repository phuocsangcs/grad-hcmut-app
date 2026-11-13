import { and, asc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { invites, rsvps, type Invite, type NewInvite } from '@/db/schema';

export const inviteRepo = {
  insertMany: async (rows: NewInvite[]): Promise<Invite[]> => {
    if (rows.length === 0) return [];
    return db.insert(invites).values(rows).returning();
  },

  listByCard: (cardId: string): Promise<Invite[]> =>
    db.query.invites.findMany({ where: eq(invites.cardId, cardId), orderBy: [asc(invites.sortOrder), asc(invites.createdAt)] }),

  /** Danh sách kèm RSVP (nếu có) cho trang quản lý và CSV. */
  listWithRsvp: (cardId: string) =>
    db
      .select({
        invite: invites,
        rsvp: { id: rsvps.id, guestName: rsvps.guestName, headcount: rsvps.headcount, wish: rsvps.wish, createdAt: rsvps.createdAt },
      })
      .from(invites)
      .leftJoin(rsvps, eq(rsvps.inviteId, invites.id))
      .where(eq(invites.cardId, cardId))
      .orderBy(asc(invites.sortOrder), asc(invites.createdAt)),

  findByCode: (cardId: string, code: string) =>
    db.query.invites.findFirst({ where: and(eq(invites.cardId, cardId), eq(invites.code, code)) }),

  findById: (cardId: string, id: string) =>
    db.query.invites.findFirst({ where: and(eq(invites.cardId, cardId), eq(invites.id, id)) }),

  codesOf: async (cardId: string): Promise<Set<string>> => {
    const rows = await db.select({ code: invites.code }).from(invites).where(eq(invites.cardId, cardId));
    return new Set(rows.map((r) => r.code));
  },

  countByCard: async (cardId: string): Promise<number> => {
    const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(invites).where(eq(invites.cardId, cardId));
    return r.n;
  },

  maxSortOrder: async (cardId: string): Promise<number> => {
    const [r] = await db.select({ m: sql<number>`coalesce(max(${invites.sortOrder}), 0)::int` }).from(invites).where(eq(invites.cardId, cardId));
    return r.m;
  },

  update: async (cardId: string, id: string, patch: Partial<NewInvite>): Promise<Invite | undefined> => {
    const [row] = await db
      .update(invites)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(invites.cardId, cardId), eq(invites.id, id)))
      .returning();
    return row;
  },

  delete: async (cardId: string, id: string): Promise<boolean> => {
    const rows = await db.delete(invites).where(and(eq(invites.cardId, cardId), eq(invites.id, id))).returning({ id: invites.id });
    return rows.length > 0;
  },

  incrementView: (id: string) => db.update(invites).set({ viewCount: sql`${invites.viewCount} + 1` }).where(eq(invites.id, id)),
};
