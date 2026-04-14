import { getDb } from "./db";
import { notifications, emailPreferences } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export type NotificationType = 
  | "auction_ending_soon"
  | "outbid_alert"
  | "new_matching_auction"
  | "new_bid"
  | "auction_won"
  | "auction_lost";

/**
 * Create an in-app notification for a user
 */
export async function createNotification(
  userId: number,
  type: NotificationType,
  title: string,
  message: string,
  auctionId?: number,
  actionUrl?: string
): Promise<any> {
  const db = await getDb();
  if (!db) {
    console.warn("[Notifications] Database not available");
    return null;
  }

  try {
    const result = await db.insert(notifications).values({
      userId,
      type,
      title,
      message,
      auctionId: auctionId || null,
      actionUrl: actionUrl || null,
      isRead: false,
      createdAt: new Date(),
    });

    return result;
  } catch (error) {
    console.error("[Notifications] Failed to create notification:", error);
    throw error;
  }
}

/**
 * Send email notification if user has enabled this notification type
 */
export async function sendEmailNotificationIfEnabled(
  userId: number,
  notificationType: NotificationType,
  emailData: {
    to: string;
    subject: string;
    body: string;
  }
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Notifications] Database not available");
    return false;
  }

  try {
    // Get user's email preferences
    const prefs = await db
      .select()
      .from(emailPreferences)
      .where(eq(emailPreferences.userId, userId))
      .limit(1);

    if (!prefs || prefs.length === 0) {
      // Default to enabled if no preferences set
      return (await sendEmail(emailData)) as boolean;
    }

    const userPrefs = prefs[0];

    // Check if this notification type is enabled
    let isEnabled = false;
    switch (notificationType) {
      case "auction_ending_soon":
        isEnabled = userPrefs.auctionEndingSoon ?? true;
        break;
      case "outbid_alert":
        isEnabled = userPrefs.outbidAlerts ?? true;
        break;
      case "new_matching_auction":
      case "new_bid":
        isEnabled = userPrefs.newMatchingAuctions ?? true;
        break;
      case "auction_won":
      case "auction_lost":
        isEnabled = true;
        break;
      default:
        isEnabled = true;
    }

    if (!isEnabled) {
      console.log(`[Notifications] Email notification disabled for user ${userId}, type: ${notificationType}`);
      return false;
    }

    return (await sendEmail(emailData)) as boolean;
  } catch (error) {
    console.error("[Notifications] Failed to check email preferences:", error);
    return false;
  }
}

/**
 * Send email (placeholder - implement with your email service)
 */
async function sendEmail(emailData: {
  to: string;
  subject: string;
  body: string;
}): Promise<boolean> {
  try {
    // TODO: Integrate with email service (SendGrid, AWS SES, Mailgun, etc.)
    console.log(`[Email] Would send email to ${emailData.to}: ${emailData.subject}`);

    // Example implementation with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: emailData.to,
    //   from: 'noreply@civicbid.io',
    //   subject: emailData.subject,
    //   html: emailData.body,
    // });

    return true;
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return false;
  }
}

/**
 * Notify user when an auction is ending soon (within 24 hours)
 */
export async function notifyAuctionEndingSoon(
  userId: number,
  auctionId: number,
  auctionTitle: string,
  userEmail: string
) {
  // Create in-app notification
  await createNotification(
    userId,
    "auction_ending_soon",
    "Auction Ending Soon",
    `${auctionTitle} is ending within 24 hours`,
    auctionId,
    `/auction/${auctionId}`
  );

  // Send email if enabled
  await sendEmailNotificationIfEnabled(userId, "auction_ending_soon", {
    to: userEmail,
    subject: "Auction Ending Soon - CivicBid",
    body: `<p>The auction for <strong>${auctionTitle}</strong> is ending within 24 hours.</p>
           <p><a href="https://civicbid.io/auction/${auctionId}">View Auction</a></p>`,
  });
}

/**
 * Notify user when they are outbid
 */
export async function notifyOutbid(
  userId: number,
  auctionId: number,
  auctionTitle: string,
  newBidAmount: number,
  userEmail: string
) {
  // Create in-app notification
  await createNotification(
    userId,
    "outbid_alert",
    "You've Been Outbid",
    `Someone placed a higher bid on ${auctionTitle}`,
    auctionId,
    `/auction/${auctionId}`
  );

  // Send email if enabled
  await sendEmailNotificationIfEnabled(userId, "outbid_alert", {
    to: userEmail,
    subject: "You've Been Outbid - CivicBid",
    body: `<p>You've been outbid on <strong>${auctionTitle}</strong>.</p>
           <p>New bid: <strong>$${newBidAmount.toLocaleString()}</strong></p>
           <p><a href="https://civicbid.io/auction/${auctionId}">Place a New Bid</a></p>`,
  });
}

/**
 * Notify user of new matching auctions
 */
export async function notifyNewMatchingAuctions(
  userId: number,
  auctionCount: number,
  userEmail: string
) {
  // Create in-app notification
  await createNotification(
    userId,
    "new_matching_auction",
    "New Matching Auctions",
    `${auctionCount} new auction(s) matching your interests`,
    undefined,
    "/auctions"
  );

  // Send email if enabled
  await sendEmailNotificationIfEnabled(userId, "new_matching_auction", {
    to: userEmail,
    subject: `${auctionCount} New Auctions Matching Your Interests - CivicBid`,
    body: `<p>We found <strong>${auctionCount}</strong> new auction(s) matching your interests.</p>
           <p><a href="https://civicbid.io/auctions">Browse New Auctions</a></p>`,
  });
}

/**
 * Send weekly digest email
 */
export async function sendWeeklyDigest(
  userId: number,
  userEmail: string,
  topAuctions: Array<{ id: number; title: string; price: number }>
) {
  const auctionsList = topAuctions
    .map((a) => `<li><a href="https://civicbid.io/auction/${a.id}">${a.title}</a> - $${a.price.toLocaleString()}</li>`)
    .join("");

  await sendEmailNotificationIfEnabled(userId, "new_matching_auction", {
    to: userEmail,
    subject: "Your Weekly CivicBid Digest",
    body: `<h2>Your Weekly Digest</h2>
           <p>Here are this week's top auctions:</p>
           <ul>${auctionsList}</ul>
           <p><a href="https://civicbid.io/auctions">View All Auctions</a></p>`,
  });
}
