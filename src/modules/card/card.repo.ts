import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/db';
import { cards, type Card, type NewCard } from '@/db/schema';

/** Chỉ truy vấn DB, không có nghiệp vụ. */
export const cardRepo = {
  insert: async (data: NewCard): Promise<Card> => {
    const [row] = await db.insert(cards).values(data).returning();
    return row;
  },

  findBySlug: (slug: string) => db.query.cards.findFirst({ where: eq(cards.slug, slug) }),

  findById: (id: string) => db.query.cards.findFirst({ where: eq(cards.id, id) }),

  findByTokenHash: (hash: string) => db.query.cards.findFirst({ where: eq(cards.manageTokenHash, hash) }),

  slugExists: async (slug: string): Promise<boolean> => {
    const row = await db.select({ id: cards.id }).from(cards).where(eq(cards.slug, slug)).limit(1);
    return row.length > 0;
  },

  /** Trả về tập slug đã tồn tại trong danh sách, để lọc gợi ý. */
  existingSlugs: async (slugs: string[]): Promise<Set<string>> => {
    if (slugs.length === 0) return new Set();
    const rows = await db.select({ slug: cards.slug }).from(cards).where(inArray(cards.slug, slugs));
    return new Set(rows.map((r) => r.slug));
  },

  incrementView: (id: string) =>
    db.update(cards).set({ viewCount: sql`${cards.viewCount} + 1` }).where(eq(cards.id, id)),

  update: async (id: string, patch: Partial<NewCard>): Promise<Card | undefined> => {
    const [row] = await db
      .update(cards)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(cards.id, id))
      .returning();
    return row;
  },

  delete: async (id: string): Promise<boolean> => {
    const rows = await db.delete(cards).where(eq(cards.id, id)).returning({ id: cards.id });
    return rows.length > 0;
  },

  setLocked: (id: string, locked: boolean) => db.update(cards).set({ locked }).where(eq(cards.id, id)),

  deleteExpired: async (now: Date): Promise<number> => {
    const rows = await db
      .delete(cards)
      .where(and(sql`${cards.expiresAt} < ${now}`))
      .returning({ id: cards.id });
    return rows.length;
  },
};
