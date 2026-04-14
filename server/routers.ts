import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getAuctionById,
  searchAuctions,
  getAuctionsByIds,
  addToWatchlist,
  removeFromWatchlist,
  getUserWatchlist,
  isAuctionInWatchlist,
  getUserNotifications,
  markNotificationAsRead,
  getAiAnalysis,
  createOrUpdateAiAnalysis,
  getChatHistory,
  saveChatMessage,
  getAuctionImages,
  getDataSources,
  createOrUpdateEmailPreferences,
  getEmailPreferences,
  getUserById,
} from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ AUCTION QUERIES ============
  auctions: router({
    // Get single auction by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const auction = await getAuctionById(input.id);
        if (!auction) {
          throw new Error("Auction not found");
        }
        return auction;
      }),

    // Search and filter auctions
    search: publicProcedure
      .input(
        z.object({
          query: z.string().optional(),
          category: z.string().optional(),
          state: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          status: z.string().optional(),
          sortBy: z.enum(["endDate", "price", "newest"]).optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return await searchAuctions(input);
      }),

    // Get multiple auctions by IDs
    getByIds: publicProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .query(async ({ input }) => {
        return await getAuctionsByIds(input.ids);
      }),

    // Get auction images
    getImages: publicProcedure
      .input(z.object({ auctionId: z.number() }))
      .query(async ({ input }) => {
        return await getAuctionImages(input.auctionId);
      }),
  }),

  // ============ WATCHLIST ============
  watchlist: router({
    // Get user's watchlist
    getList: protectedProcedure.query(async ({ ctx }) => {
      return await getUserWatchlist(ctx.user.id);
    }),

    // Add to watchlist
    add: protectedProcedure
      .input(
        z.object({
          auctionId: z.number(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await addToWatchlist(ctx.user.id, input.auctionId, input.notes);
      }),

    // Remove from watchlist
    remove: protectedProcedure
      .input(z.object({ auctionId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await removeFromWatchlist(ctx.user.id, input.auctionId);
      }),

    // Check if auction is in watchlist
    isInWatchlist: protectedProcedure
      .input(z.object({ auctionId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await isAuctionInWatchlist(ctx.user.id, input.auctionId);
      }),
  }),

  // ============ NOTIFICATIONS ============
  notifications: router({
    // Get user's notifications
    getList: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await getUserNotifications(ctx.user.id, input.limit);
      }),

    // Mark notification as read
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await markNotificationAsRead(input.id);
      }),
  }),

  // ============ AI ANALYSIS ============
  aiAnalysis: router({
    // Get AI analysis for an auction
    getAnalysis: publicProcedure
      .input(z.object({ auctionId: z.number() }))
      .query(async ({ input }) => {
        return await getAiAnalysis(input.auctionId);
      }),

    // Generate or update AI analysis
    generateAnalysis: publicProcedure
      .input(
        z.object({
          auctionId: z.number(),
          title: z.string(),
          description: z.string(),
          category: z.string(),
          startingBid: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Call LLM to generate analysis
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content:
                  "You are an expert auction analyst. Provide detailed analysis of auction items including fair market value estimation, risk assessment, and bidding strategy.",
              },
              {
                role: "user",
                content: `Analyze this auction item:\n\nTitle: ${input.title}\nDescription: ${input.description}\nCategory: ${input.category}\nStarting Bid: $${input.startingBid || "N/A"}\n\nProvide a JSON response with: summary, estimatedFairValue (number), riskFlags (array), and biddingStrategy (string).`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "auction_analysis",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    summary: { type: "string" },
                    estimatedFairValue: { type: "number" },
                    riskFlags: { type: "array", items: { type: "string" } },
                    biddingStrategy: { type: "string" },
                  },
                  required: ["summary", "estimatedFairValue", "riskFlags", "biddingStrategy"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message.content;
          if (!content) throw new Error("No response from LLM");

          const contentStr = typeof content === "string" ? content : JSON.stringify(content);
          const analysis = JSON.parse(contentStr);
          await createOrUpdateAiAnalysis(input.auctionId, analysis);

          return analysis;
        } catch (error) {
          console.error("AI analysis generation failed:", error);
          throw error;
        }
      }),
  }),

  // ============ AI CHAT ============
  chat: router({
    // Get chat history for an auction
    getHistory: protectedProcedure
      .input(z.object({ auctionId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await getChatHistory(ctx.user.id, input.auctionId);
      }),

    // Send message to AI chat
    sendMessage: protectedProcedure
      .input(
        z.object({
          auctionId: z.number(),
          message: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Get auction details for context
          const auction = await getAuctionById(input.auctionId);
          if (!auction) throw new Error("Auction not found");

          // Get chat history
          const history = await getChatHistory(ctx.user.id, input.auctionId);

          // Save user message
          await saveChatMessage(ctx.user.id, input.auctionId, "user", input.message);

          // Build context for LLM
          const auctionContext = `\n\nAuction Context:\nTitle: ${auction.title}\nCategory: ${auction.category}\nStarting Bid: $${auction.startingBid}\nLocation: ${auction.location}\nEnd Date: ${auction.auctionEndDate}`;
          const systemMessage = `You are a helpful auction assistant. Answer questions about the auction item, provide bidding advice, and help users make informed decisions. Be concise and professional.${auctionContext}`;

          const messages: any[] = [
            {
              role: "system",
              content: systemMessage,
            },
            ...history.map((h) => ({
              role: h.role,
              content: h.message,
            })),
            {
              role: "user",
              content: input.message,
            },
          ];

          // Call LLM
          const response = await invokeLLM({
            messages: messages as any,
          });

          const messageContent = response.choices[0]?.message.content;
          const assistantMessage = typeof messageContent === "string" ? messageContent : JSON.stringify(messageContent) || "I couldn't generate a response.";

          // Save assistant message
          await saveChatMessage(ctx.user.id, input.auctionId, "assistant", assistantMessage as string);

          return {
            message: assistantMessage,
          };
        } catch (error) {
          console.error("Chat error:", error);
          throw error;
        }
      }),
  }),

  // ============ USER PREFERENCES ============
  preferences: router({
    // Get email preferences
    getEmailPreferences: protectedProcedure.query(async ({ ctx }) => {
      return await getEmailPreferences(ctx.user.id);
    }),

    // Update email preferences
    updateEmailPreferences: protectedProcedure
      .input(
        z.object({
          auctionEndingSoon: z.boolean().optional(),
          outbidAlerts: z.boolean().optional(),
          newMatchingAuctions: z.boolean().optional(),
          weeklyDigest: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createOrUpdateEmailPreferences(ctx.user.id, input);
      }),
  }),

  // ============ USER PROFILE ============
  user: router({
    // Get user profile
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return await getUserById(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
