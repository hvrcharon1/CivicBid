CREATE TABLE `ai_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`auctionId` int NOT NULL,
	`summary` text,
	`estimatedFairValue` decimal(12,2),
	`riskFlags` json,
	`biddingStrategy` text,
	`conditionAssessment` text,
	`marketComparables` json,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_analysis_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_analysis_auctionId_unique` UNIQUE(`auctionId`)
);
--> statement-breakpoint
CREATE TABLE `auction_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`auctionId` int NOT NULL,
	`imageUrl` text NOT NULL,
	`caption` text,
	`aiDescription` text,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auction_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auctions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` varchar(256) NOT NULL,
	`dataSourceId` int NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` varchar(64) NOT NULL,
	`itemType` varchar(128),
	`location` varchar(256),
	`state` varchar(2),
	`county` varchar(128),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`agency` varchar(256),
	`startingBid` decimal(12,2),
	`estimatedValue` decimal(12,2),
	`auctionStartDate` datetime,
	`auctionEndDate` datetime NOT NULL,
	`currentBid` decimal(12,2),
	`bidCount` int DEFAULT 0,
	`status` enum('active','ended','cancelled','sold') DEFAULT 'active',
	`sourceUrl` text NOT NULL,
	`imageUrls` json,
	`condition` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auctions_id` PRIMARY KEY(`id`),
	CONSTRAINT `auctions_externalId_unique` UNIQUE(`externalId`),
	CONSTRAINT `externalId_idx` UNIQUE(`externalId`)
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(256) NOT NULL,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bids` (
	`id` int AUTO_INCREMENT NOT NULL,
	`auctionId` int NOT NULL,
	`userId` int,
	`bidAmount` decimal(12,2) NOT NULL,
	`bidderName` varchar(256),
	`bidTime` datetime NOT NULL,
	`isWinningBid` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bids_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`auctionId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`url` text NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncedAt` timestamp,
	`syncIntervalMinutes` int DEFAULT 60,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `data_sources_id` PRIMARY KEY(`id`),
	CONSTRAINT `data_sources_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `email_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`auctionEndingSoon` boolean DEFAULT true,
	`outbidAlerts` boolean DEFAULT true,
	`newMatchingAuctions` boolean DEFAULT true,
	`weeklyDigest` boolean DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`auctionId` int,
	`type` enum('auction_ending_soon','new_bid','auction_won','auction_lost','new_matching_auction','outbid_alert') NOT NULL,
	`title` varchar(256) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean DEFAULT false,
	`actionUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_searches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`filters` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_searches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `watchlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`auctionId` int NOT NULL,
	`notes` text,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watchlist_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_auction_idx` UNIQUE(`userId`,`auctionId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `auctionId_idx` ON `ai_analysis` (`auctionId`);--> statement-breakpoint
CREATE INDEX `auctionId_idx` ON `auction_images` (`auctionId`);--> statement-breakpoint
CREATE INDEX `dataSourceId_idx` ON `auctions` (`dataSourceId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `auctions` (`category`);--> statement-breakpoint
CREATE INDEX `state_idx` ON `auctions` (`state`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `auctions` (`status`);--> statement-breakpoint
CREATE INDEX `auctionEndDate_idx` ON `auctions` (`auctionEndDate`);--> statement-breakpoint
CREATE INDEX `adminId_idx` ON `audit_log` (`adminId`);--> statement-breakpoint
CREATE INDEX `auctionId_idx` ON `bids` (`auctionId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `bids` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `chat_history` (`userId`);--> statement-breakpoint
CREATE INDEX `auctionId_idx` ON `chat_history` (`auctionId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `auctionId_idx` ON `notifications` (`auctionId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `saved_searches` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `watchlist` (`userId`);--> statement-breakpoint
CREATE INDEX `auctionId_idx` ON `watchlist` (`auctionId`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);