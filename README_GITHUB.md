# CivicBid - AI-Powered Government Auction Discovery Platform

CivicBid is an elegant, full-featured platform for discovering and bidding on government surplus and seized property auctions. It aggregates auctions from multiple government sources and uses AI to provide intelligent analysis, fair market value estimates, and personalized bidding recommendations.

## Features

### Core Functionality
- **Auction Aggregation**: Unified access to auctions from GSA Auctions, GovPlanet, PropertyRoom, IAAI, and more
- **Advanced Search & Filtering**: Filter by category, location, price range, end date, and more
- **Real-time Auction Details**: Complete property information, images, bid history, and countdown timers
- **Interactive Maps**: Google Maps integration for location visualization and geographic filtering
- **Watchlist Management**: Save favorite auctions and track their progress

### AI-Powered Features
- **Auction Analysis**: AI-generated summaries, fair market value estimates, risk assessments, and bidding strategies
- **AI Chat Assistant**: Embedded Q&A assistant for auction-specific questions and bidding guidance
- **Property Image Analysis**: AI-driven condition assessments from property photos
- **Personalized Recommendations**: ML-based auction suggestions based on user preferences

### User Dashboard
- **Watchlist Tracking**: Monitor saved auctions with real-time updates
- **Bid History**: View all your bids and auction participation
- **Personalized Recommendations**: AI-curated auction suggestions
- **Notification Preferences**: Customize alerts for ending auctions, outbids, and new matches

### Admin Dashboard
- **Data Source Management**: Configure and monitor auction data sources
- **Aggregation Analytics**: View sync status, error logs, and data quality metrics
- **Platform Analytics**: User activity, auction statistics, and performance metrics
- **Auction Review**: Audit scraped and aggregated listings

### Notifications
- **In-App Alerts**: Real-time notifications for auction events
- **Email Notifications**: Alerts when watched auctions end within 24 hours
- **Outbid Alerts**: Immediate notification when outbid
- **New Matches**: Email digest of new auctions matching your criteria
- **Customizable Preferences**: Control notification frequency and types

### Authentication & Authorization
- **Manus OAuth Integration**: Secure authentication with role-based access control
- **User Roles**: Distinct capabilities for regular users and administrators
- **Protected Routes**: Secure access to sensitive features

## Architecture

### Tech Stack

**Frontend:**
- React 19 with Vite
- TypeScript for type safety
- Tailwind CSS 4 for styling
- shadcn/ui for component library
- tRPC for type-safe API calls
- Google Maps JavaScript API

**Backend:**
- Express.js 4 with Node.js 22
- tRPC 11 for RPC procedures
- Drizzle ORM for database management
- MySQL/TiDB for data persistence
- LLM integration for AI features

**Infrastructure:**
- Docker & Docker Compose for containerization
- AWS ECS, Railway, or Render for deployment
- S3 for file storage
- Manus OAuth for authentication

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- MySQL 8.0+ or TiDB
- Manus OAuth credentials
- Manus API access

### Installation

```bash
# Clone repository
git clone https://github.com/hvrcharon1/CivicBid.git
cd CivicBid

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Setup database
pnpm drizzle-kit generate
pnpm db:push

# Start development server
pnpm dev
```

Visit `http://localhost:3000`

### Docker Deployment

```bash
# Build image
docker build -t civicbid:latest .

# Run with Docker Compose
docker-compose up -d

# Access at http://localhost:3000
```

## Project Structure

```
CivicBid/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities and helpers
│   │   └── App.tsx        # Main app component
│   └── index.html
├── server/                # Express backend
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database queries
│   ├── aggregation.ts     # Auction aggregation engine
│   ├── notifications.ts   # Notification system
│   └── _core/             # Framework internals
├── drizzle/               # Database schema and migrations
├── shared/                # Shared types and constants
├── Dockerfile             # Container configuration
└── docker-compose.yml     # Multi-container setup
```

## Development

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/auth.logout.test.ts

# Watch mode
pnpm test --watch
```

### Building for Production

```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions covering:
- AWS ECS deployment
- Railway deployment
- Render deployment
- Docker Compose setup
- Environment configuration
- Database migrations
- Monitoring and scaling

## Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [Architecture](./CIVICBID_README.md) - Detailed architecture documentation

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, open an issue on GitHub.
