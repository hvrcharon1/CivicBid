import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  datetime,
  index,
  uniqueIndex,
  foreignKey,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with auction-specific fields.
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }).unique(),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    avatar: text("avatar"),
    bio: text("bio"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Data sources for auction aggregation (GovPlanet, GSA Auctions, PropertyRoom, etc.)
 */
export const dataSources = mysqlTable("data_sources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull().unique(),
  url: text("url").notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  lastSyncedAt: timestamp("lastSyncedAt"),
  syncIntervalMinutes: int("syncIntervalMinutes").default(60),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DataSource = typeof dataSources.$inferSelect;
export type InsertDataSource = typeof dataSources.$inferInsert;

/**
 * Auction listings aggregated from multiple government sources
 */
export const auctions = mysqlTable(
  "auctions",
  {
    id: int("id").autoincrement().primaryKey(),
    externalId: varchar("externalId", { length: 256 }).notNull().unique(),
    dataSourceId: int("dataSourceId").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    category: varchar("category", { length: 64 }).notNull(), // e.g., "vehicles", "real_estate", "equipment"
    itemType: varchar("itemType", { length: 128 }), // e.g., "2020 Ford F-150", "Commercial Building"
    location: varchar("location", { length: 256 }),
    state: varchar("state", { length: 2 }), // US state code
    county: varchar("county", { length: 128 }),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    agency: varchar("agency", { length: 256 }), // e.g., "DEA", "FBI", "GSA"
    startingBid: decimal("startingBid", { precision: 12, scale: 2 }),
    estimatedValue: decimal("estimatedValue", { precision: 12, scale: 2 }),
    auctionStartDate: datetime("auctionStartDate"),
    auctionEndDate: datetime("auctionEndDate").notNull(),
    currentBid: decimal("currentBid", { precision: 12, scale: 2 }),
    bidCount: int("bidCount").default(0),
    status: mysqlEnum("status", ["active", "ended", "cancelled", "sold"]).default("active"),
    sourceUrl: text("sourceUrl").notNull(),
    imageUrls: json("imageUrls"), // Array of image URLs
    condition: varchar("condition", { length: 64 }), // e.g., "excellent", "good", "fair", "poor"
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    dataSourceIdx: index("dataSourceId_idx").on(table.dataSourceId),
    categoryIdx: index("category_idx").on(table.category),
    stateIdx: index("state_idx").on(table.state),
    statusIdx: index("status_idx").on(table.status),
    auctionEndDateIdx: index("auctionEndDate_idx").on(table.auctionEndDate),
    externalIdIdx: uniqueIndex("externalId_idx").on(table.externalId),
  })
);

export type Auction = typeof auctions.$inferSelect;
export type InsertAuction = typeof auctions.$inferInsert;

/**
 * User watchlist for tracked auctions
 */
export const watchlist = mysqlTable(
  "watchlist",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    auctionId: int("auctionId").notNull(),
    notes: text("notes"),
    addedAt: timestamp("addedAt").defaultNow().notNull(),
  },
  (table) => ({
    userAuctionIdx: uniqueIndex("user_auction_idx").on(table.userId, table.auctionId),
    userIdx: index("userId_idx").on(table.userId),
    auctionIdx: index("auctionId_idx").on(table.auctionId),
  })
);

export type Watchlist = typeof watchlist.$inferSelect;
export type InsertWatchlist = typeof watchlist.$inferInsert;

/**
 * Bid history for auctions (for display and tracking)
 */
export const bids = mysqlTable(
  "bids",
  {
    id: int("id").autoincrement().primaryKey(),
    auctionId: int("auctionId").notNull(),
    userId: int("userId"),
    bidAmount: decimal("bidAmount", { precision: 12, scale: 2 }).notNull(),
    bidderName: varchar("bidderName", { length: 256 }), // Anonymous or user name
    bidTime: datetime("bidTime").notNull(),
    isWinningBid: boolean("isWinningBid").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    auctionIdx: index("auctionId_idx").on(table.auctionId),
    userIdx: index("userId_idx").on(table.userId),
  })
);

export type Bid = typeof bids.$inferSelect;
export type InsertBid = typeof bids.$inferInsert;

/**
 * AI-generated analysis for auctions (summaries, valuations, risk flags, bidding strategies)
 */
export const aiAnalysis = mysqlTable(
  "ai_analysis",
  {
    id: int("id").autoincrement().primaryKey(),
    auctionId: int("auctionId").notNull().unique(),
    summary: text("summary"), // AI-generated summary of the auction item
    estimatedFairValue: decimal("estimatedFairValue", { precision: 12, scale: 2 }),
    riskFlags: json("riskFlags"), // Array of risk assessments
    biddingStrategy: text("biddingStrategy"), // Recommended bidding approach
    conditionAssessment: text("conditionAssessment"), // From image analysis
    marketComparables: json("marketComparables"), // Similar items and prices
    generatedAt: timestamp("generatedAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    auctionIdx: index("auctionId_idx").on(table.auctionId),
  })
);

export type AiAnalysis = typeof aiAnalysis.$inferSelect;
export type InsertAiAnalysis = typeof aiAnalysis.$inferInsert;

/**
 * Auction images with AI analysis metadata
 */
export const auctionImages = mysqlTable(
  "auction_images",
  {
    id: int("id").autoincrement().primaryKey(),
    auctionId: int("auctionId").notNull(),
    imageUrl: text("imageUrl").notNull(),
    caption: text("caption"),
    aiDescription: text("aiDescription"), // AI-generated description from image analysis
    uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  },
  (table) => ({
    auctionIdx: index("auctionId_idx").on(table.auctionId),
  })
);

export type AuctionImage = typeof auctionImages.$inferSelect;
export type InsertAuctionImage = typeof auctionImages.$inferInsert;

/**
 * User notifications (in-app alerts for ending auctions, new bids, etc.)
 */
export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    auctionId: int("auctionId"),
    type: mysqlEnum("type", [
      "auction_ending_soon",
      "new_bid",
      "auction_won",
      "auction_lost",
      "new_matching_auction",
      "outbid_alert",
    ]).notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("isRead").default(false),
    actionUrl: text("actionUrl"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userId_idx").on(table.userId),
    auctionIdx: index("auctionId_idx").on(table.auctionId),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Email notification preferences per user
 */
export const emailPreferences = mysqlTable("email_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  auctionEndingSoon: boolean("auctionEndingSoon").default(true),
  outbidAlerts: boolean("outbidAlerts").default(true),
  newMatchingAuctions: boolean("newMatchingAuctions").default(true),
  weeklyDigest: boolean("weeklyDigest").default(false),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailPreferences = typeof emailPreferences.$inferSelect;
export type InsertEmailPreferences = typeof emailPreferences.$inferInsert;

/**
 * User search preferences and saved searches
 */
export const savedSearches = mysqlTable(
  "saved_searches",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    filters: json("filters").notNull(), // Serialized filter object
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userId_idx").on(table.userId),
  })
);

export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = typeof savedSearches.$inferInsert;

/**
 * Chat history for AI assistant interactions
 */
export const chatHistory = mysqlTable(
  "chat_history",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    auctionId: int("auctionId").notNull(),
    role: mysqlEnum("role", ["user", "assistant"]).notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userId_idx").on(table.userId),
    auctionIdx: index("auctionId_idx").on(table.auctionId),
  })
);

export type ChatHistory = typeof chatHistory.$inferSelect;
export type InsertChatHistory = typeof chatHistory.$inferInsert;

/**
 * Admin audit log for data source syncs and platform changes
 */
export const auditLog = mysqlTable(
  "audit_log",
  {
    id: int("id").autoincrement().primaryKey(),
    adminId: int("adminId").notNull(),
    action: varchar("action", { length: 256 }).notNull(),
    details: text("details"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    adminIdx: index("adminId_idx").on(table.adminId),
  })
);

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;
