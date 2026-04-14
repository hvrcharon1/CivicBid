import { eq, and, gte, lte, like, inArray, desc, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  auctions,
  watchlist,
  notifications,
  aiAnalysis,
  dataSources,
  bids,
  chatHistory,
  emailPreferences,
  savedSearches,
  auctionImages,
  auditLog,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ AUCTION QUERIES ============

export async function getAuctionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(auctions)
    .where(eq(auctions.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function searchAuctions(filters: {
  query?: string;
  category?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  sortBy?: "endDate" | "price" | "newest";
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [];

  if (filters.query) {
    conditions.push(
      sql`(${auctions.title} LIKE ${`%${filters.query}%`} OR ${auctions.description} LIKE ${`%${filters.query}%`})`
    );
  }

  if (filters.category) {
    conditions.push(eq(auctions.category, filters.category));
  }

  if (filters.state) {
    conditions.push(eq(auctions.state, filters.state));
  }

  if (filters.minPrice !== undefined) {
    conditions.push(gte(auctions.startingBid as any, filters.minPrice));
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(lte(auctions.startingBid as any, filters.maxPrice));
  }

  if (filters.status) {
    conditions.push(eq(auctions.status, filters.status as any));
  }

  const limit = filters.limit || 20;
  const offset = filters.offset || 0;

  // Build query with conditions
  let query: any = db.select().from(auctions);
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  // Apply sorting
  if (filters.sortBy === "endDate") {
    query = query.orderBy(asc(auctions.auctionEndDate));
  } else if (filters.sortBy === "price") {
    query = query.orderBy(asc(auctions.startingBid));
  } else {
    query = query.orderBy(desc(auctions.createdAt));
  }

  // Apply pagination and execute
  return await query.limit(limit).offset(offset);
}

export async function getAuctionsByIds(ids: number[]) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(auctions).where(inArray(auctions.id, ids));
}

// ============ WATCHLIST QUERIES ============

export async function addToWatchlist(userId: number, auctionId: number, notes?: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(watchlist).values({
    userId,
    auctionId,
    notes,
  });

  return result;
}

export async function removeFromWatchlist(userId: number, auctionId: number) {
  const db = await getDb();
  if (!db) return null;

  return await db
    .delete(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.auctionId, auctionId)));
}

export async function getUserWatchlist(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const watchlistItems = await db
    .select()
    .from(watchlist)
    .where(eq(watchlist.userId, userId));

  const auctionIds = watchlistItems.map((w) => w.auctionId);
  if (auctionIds.length === 0) return [];

  const auctionData = await db
    .select()
    .from(auctions)
    .where(inArray(auctions.id, auctionIds));

  return watchlistItems.map((w) => ({
    ...w,
    auction: auctionData.find((a) => a.id === w.auctionId),
  }));
}

export async function isAuctionInWatchlist(userId: number, auctionId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.auctionId, auctionId)))
    .limit(1);

  return result.length > 0;
}

// ============ NOTIFICATION QUERIES ============

export async function createNotification(data: {
  userId: number;
  auctionId?: number;
  type: "auction_ending_soon" | "new_bid" | "auction_won" | "auction_lost" | "new_matching_auction" | "outbid_alert";
  title: string;
  message: string;
  actionUrl?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  return await db.insert(notifications).values([data]);
}

export async function getUserNotifications(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return null;

  return await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}

// ============ AI ANALYSIS QUERIES ============

export async function getAiAnalysis(auctionId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(aiAnalysis)
    .where(eq(aiAnalysis.auctionId, auctionId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createOrUpdateAiAnalysis(auctionId: number, data: any) {
  const db = await getDb();
  if (!db) return null;

  const existing = await getAiAnalysis(auctionId);

  if (existing) {
    return await db
      .update(aiAnalysis)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(aiAnalysis.auctionId, auctionId));
  } else {
    return await db.insert(aiAnalysis).values({
      auctionId,
      ...data,
    });
  }
}

// ============ CHAT HISTORY QUERIES ============

export async function saveChatMessage(
  userId: number,
  auctionId: number,
  role: "user" | "assistant",
  message: string
) {
  const db = await getDb();
  if (!db) return null;

  return await db.insert(chatHistory).values([
    {
      userId,
      auctionId,
      role,
      message,
    },
  ]);
}

export async function getChatHistory(userId: number, auctionId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(chatHistory)
    .where(and(eq(chatHistory.userId, userId), eq(chatHistory.auctionId, auctionId)))
    .orderBy(asc(chatHistory.createdAt));
}

// ============ DATA SOURCE QUERIES ============

export async function getDataSources() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(dataSources).where(eq(dataSources.isActive, true));
}

export async function getDataSourceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(dataSources).where(eq(dataSources.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDataSourceSyncTime(id: number) {
  const db = await getDb();
  if (!db) return null;

  return await db
    .update(dataSources)
    .set({ lastSyncedAt: new Date() })
    .where(eq(dataSources.id, id));
}

// ============ EMAIL PREFERENCES QUERIES ============

export async function getEmailPreferences(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(emailPreferences)
    .where(eq(emailPreferences.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createOrUpdateEmailPreferences(userId: number, prefs: any) {
  const db = await getDb();
  if (!db) return null;

  const existing = await getEmailPreferences(userId);

  if (existing) {
    return await db
      .update(emailPreferences)
      .set(prefs)
      .where(eq(emailPreferences.userId, userId));
  } else {
    return await db.insert(emailPreferences).values({
      userId,
      ...prefs,
    });
  }
}

// ============ AUCTION IMAGES QUERIES ============

export async function getAuctionImages(auctionId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(auctionImages)
    .where(eq(auctionImages.auctionId, auctionId));
}

// ============ AUDIT LOG QUERIES ============

export async function logAuditAction(adminId: number, action: string, details?: string) {
  const db = await getDb();
  if (!db) return null;

  return await db.insert(auditLog).values({
    adminId,
    action,
    details,
  });
}

// TODO: Add more feature queries as your schema grows
