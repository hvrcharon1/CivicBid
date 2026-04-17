# CivicBid Project TODO

## Core Features

### Frontend Pages & UI
- [x] Landing page with hero section, feature highlights, and CTA
- [x] Auction listing page with search, filters (category, location, price, date), and grid/list view
- [x] Auction detail page with property info, images, bid history, countdown timer, source link, and map
- [x] User dashboard with watchlist, bid tracking, and recommendations
- [x] Admin dashboard for data sources, aggregation review, and analytics
- [x] AI chat assistant embedded on auction detail pages

### Backend & Data
- [x] Auction aggregation engine (GovPlanet, GSA Auctions, PropertyRoom, etc.)
- [x] Database schema for auctions, users, watchlists, bids, AI analysis, and notifications
- [x] tRPC procedures for auction queries, filtering, and sorting
- [ ] Admin procedures for data source management and analytics

### AI & Analysis
- [x] AI-powered auction analysis (summaries, market value estimation, risk flags, bidding strategy)
- [ ] AI image analysis for property condition assessment from uploaded images
- [x] AI chat assistant for Q&A and bidding guidance

### Maps & Location
- [ ] Google Maps integration on listing page (location visualization, geographic filtering)
- [ ] Google Maps integration on detail page (property location, directions)
- [ ] Geospatial filtering of auctions by area

### Notifications & Alerts
- [x] In-app notification system (ending soon, new bids, matching auctions)
- [x] Email notification system (ending within 24h, outbid alerts, new matching auctions)
- [x] Notification preferences and management (Settings page)

### Authentication & Authorization
- [x] Manus OAuth integration with role-based access control
- [x] User roles: regular user and admin
- [x] Protected routes and procedures

### Design & Polish
- [x] Refined typography and color palette
- [x] Polished UI components and spacing
- [x] Responsive design across all pages
- [x] Elegant interactions and micro-animations

## Architecture Decisions

### Database Schema
- PostgreSQL with Drizzle ORM
- Tables: users, auctions, watchlists, bids, ai_analysis, notifications, auction_images, data_sources

### Backend Stack
- Express + tRPC + Node.js
- Auction aggregation: scheduled jobs (cron) for fetching from government sources
- AI integration: Manus built-in LLM for analysis and chat

### Frontend Stack
- React 19 + Tailwind CSS 4 + shadcn/ui
- Google Maps integration via Manus proxy
- Real-time notifications via WebSocket or polling

### Deployment
- Docker-based deployment
- Environment variables for API keys and configuration
- S3 storage for auction images

## Implementation Phases

- [x] Phase 1: Project initialization and planning
- [x] Phase 2: Database schema and aggregation engine
- [x] Phase 3: Landing page and navigation
- [x] Phase 4: Auction listing page with filters and maps
- [x] Phase 5: Auction detail page with AI analysis and chat
- [x] Phase 6: User dashboard
- [x] Phase 7: Admin dashboard
- [x] Phase 8: Notifications and email alerts
- [x] Phase 9: Polish and testing
- [ ] Phase 10: GitHub deployment

## Notes

- All data sources are aggregated into a unified schema
- Manus OAuth is the sole authentication provider
- Role-based access controls user vs admin capabilities
- AI chat is embedded on detail pages, not separate
- Maps support both visualization and geographic filtering
- Email notifications are sent for critical events (ending soon, outbid, new matches)


## Portal Integration Update

### Federal Portals (10)
- GSA Auctions
- Real Estate Sales
- USA.gov Auctions
- USA Car Auctions
- Treasury Auctions
- Treasury Repurchase
- US Marshals Asset Forfeiture
- HUD Home Store
- FDIC Real Estate Sales
- BLM Land Sales

### State Portals (17)
- California, Connecticut, Delaware, Illinois, Massachusetts, Minnesota, North Carolina, Oregon, Texas, New York, Florida, Georgia, Pennsylvania, Virginia, Washington, Colorado, Ohio

### New Features Added
- [x] 30+ government auction portal support
- [x] Portal filtering in UI (federal/state)
- [x] tRPC endpoints for portal management
- [x] Portal tests (23 tests passing)
