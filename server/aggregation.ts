import { getDb } from "./db";
import { auctions, dataSources } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Auction aggregation engine for fetching from multiple government sources
 * Supports: GSA Auctions, GovPlanet, PropertyRoom, IAAI, and others
 */

export interface AggregatedAuction {
  dataSourceId: number;
  externalId: string;
  title: string;
  description?: string;
  category: string;
  itemType?: string;
  location?: string;
  state?: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  agency?: string;
  startingBid: number;
  estimatedValue?: number;
  auctionStartDate?: Date;
  auctionEndDate: Date;
  sourceUrl: string;
  imageUrls?: string[];
  condition?: string;
}

/**
 * Fetch auctions from GSA Auctions API
 * https://www.gsaauctions.gov/
 */
async function fetchGSAAuctions(): Promise<AggregatedAuction[]> {
  try {
    console.log("[Aggregation] Fetching from GSA Auctions...");
    // TODO: Implement GSA Auctions API integration
    // GSA provides a REST API for auction data
    // Endpoint: https://api.gsaauctions.gov/v1/auctions
    // Requires API key and authentication

    const auctions: AggregatedAuction[] = [];
    // Placeholder: return empty array until API is configured
    return auctions;
  } catch (error) {
    console.error("[Aggregation] GSA Auctions fetch failed:", error);
    return [];
  }
}

/**
 * Fetch auctions from GovPlanet API
 * https://www.govplanet.com/
 */
async function fetchGovPlanetAuctions(): Promise<AggregatedAuction[]> {
  try {
    console.log("[Aggregation] Fetching from GovPlanet...");
    // TODO: Implement GovPlanet API integration
    // GovPlanet provides a REST API for auction data
    // Requires API key and authentication

    const auctions: AggregatedAuction[] = [];
    // Placeholder: return empty array until API is configured
    return auctions;
  } catch (error) {
    console.error("[Aggregation] GovPlanet fetch failed:", error);
    return [];
  }
}

/**
 * Fetch auctions from PropertyRoom API
 * https://www.propertyroom.com/
 */
async function fetchPropertyRoomAuctions(): Promise<AggregatedAuction[]> {
  try {
    console.log("[Aggregation] Fetching from PropertyRoom...");
    // TODO: Implement PropertyRoom API integration
    // PropertyRoom provides auction data via API
    // Requires API key and authentication

    const auctions: AggregatedAuction[] = [];
    // Placeholder: return empty array until API is configured
    return auctions;
  } catch (error) {
    console.error("[Aggregation] PropertyRoom fetch failed:", error);
    return [];
  }
}

/**
 * Fetch auctions from IAAI (Insurance Auto Auctions)
 * https://www.iaai.com/
 */
async function fetchIAAIAuctions(): Promise<AggregatedAuction[]> {
  try {
    console.log("[Aggregation] Fetching from IAAI...");
    // TODO: Implement IAAI API integration
    // IAAI provides auction data for salvage vehicles
    // Requires API key and authentication

    const auctions: AggregatedAuction[] = [];
    // Placeholder: return empty array until API is configured
    return auctions;
  } catch (error) {
    console.error("[Aggregation] IAAI fetch failed:", error);
    return [];
  }
}

/**
 * Main aggregation function - fetches from all configured sources
 */
export async function aggregateAuctions(): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Aggregation] Database not available");
    return 0;
  }

  try {
    console.log("[Aggregation] Starting auction aggregation...");
    const startTime = Date.now();

    // Fetch from all sources in parallel
    const [gsaAuctions, govPlanetAuctions, propertyRoomAuctions, iaaiAuctions] =
      await Promise.all([
        fetchGSAAuctions(),
        fetchGovPlanetAuctions(),
        fetchPropertyRoomAuctions(),
        fetchIAAIAuctions(),
      ]);

    // Combine all auctions
    const allAuctions = [
      ...gsaAuctions,
      ...govPlanetAuctions,
      ...propertyRoomAuctions,
      ...iaaiAuctions,
    ];

    console.log(`[Aggregation] Fetched ${allAuctions.length} auctions from all sources`);

    // Store in database
    let insertedCount = 0;
    for (const auction of allAuctions) {
      try {
        // Check if auction already exists
        const existing = await db
          .select()
          .from(auctions)
          .where(eq(auctions.externalId, auction.externalId))
          .limit(1);

        if (existing.length === 0) {
          // Insert new auction
          await db.insert(auctions).values({
            externalId: auction.externalId,
            dataSourceId: auction.dataSourceId,
            title: auction.title,
            description: auction.description || null,
            category: auction.category,
            itemType: auction.itemType || null,
            location: auction.location || null,
            state: auction.state || null,
            county: auction.county || null,
            latitude: auction.latitude ? String(auction.latitude) : null,
            longitude: auction.longitude ? String(auction.longitude) : null,
            agency: auction.agency || null,
            startingBid: String(auction.startingBid),
            estimatedValue: auction.estimatedValue ? String(auction.estimatedValue) : null,
            auctionStartDate: auction.auctionStartDate || null,
            auctionEndDate: auction.auctionEndDate,
            sourceUrl: auction.sourceUrl,
            imageUrls: auction.imageUrls || null,
            condition: auction.condition || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          insertedCount++;
        } else {
          // Update existing auction
          await db
            .update(auctions)
            .set({
              updatedAt: new Date(),
            })
            .where(eq(auctions.externalId, auction.externalId));
        }
      } catch (error) {
        console.error(`[Aggregation] Failed to store auction ${auction.externalId}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(
      `[Aggregation] Completed in ${duration}ms. Inserted: ${insertedCount}, Total: ${allAuctions.length}`
    );

    return insertedCount;
  } catch (error) {
    console.error("[Aggregation] Aggregation failed:", error);
    throw error;
  }
}

/**
 * Schedule periodic aggregation (e.g., every hour)
 * This should be called from a cron job or scheduled task
 */
export async function scheduleAggregation(intervalMinutes: number = 60): Promise<void> {
  console.log(`[Aggregation] Scheduled to run every ${intervalMinutes} minutes`);

  // Initial run
  await aggregateAuctions();

  // Schedule recurring runs
  setInterval(async () => {
    try {
      await aggregateAuctions();
    } catch (error) {
      console.error("[Aggregation] Scheduled aggregation failed:", error);
    }
  }, intervalMinutes * 60 * 1000);
}

/**
 * Get data source by ID
 */
export async function getDataSource(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Aggregation] Database not available");
    return null;
  }

  const result = await db
    .select()
    .from(dataSources)
    .where(eq(dataSources.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * List all data sources
 */
export async function listDataSources() {
  const db = await getDb();
  if (!db) {
    console.warn("[Aggregation] Database not available");
    return [];
  }

  return await db.select().from(dataSources);
}

/**
 * Add a new data source
 */
export async function addDataSource(
  name: string,
  url: string,
  description?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Aggregation] Database not available");
    return null;
  }

  try {
    const result = await db.insert(dataSources).values({
      name,
      url,
      description: description || null,
      isActive: true,
      lastSyncedAt: new Date(),
      syncIntervalMinutes: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result;
  } catch (error) {
    console.error("[Aggregation] Failed to add data source:", error);
    throw error;
  }
}

/**
 * Update data source
 */
export async function updateDataSource(
  id: number,
  updates: {
    name?: string;
    url?: string;
    description?: string;
    isActive?: boolean;
    syncIntervalMinutes?: number;
  }
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Aggregation] Database not available");
    return null;
  }

  try {
    const result = await db
      .update(dataSources)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(dataSources.id, id));

    return result;
  } catch (error) {
    console.error("[Aggregation] Failed to update data source:", error);
    throw error;
  }
}

/**
 * Delete data source
 */
export async function deleteDataSource(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Aggregation] Database not available");
    return null;
  }

  try {
    const result = await db.delete(dataSources).where(eq(dataSources.id, id));
    return result;
  } catch (error) {
    console.error("[Aggregation] Failed to delete data source:", error);
    throw error;
  }
}
