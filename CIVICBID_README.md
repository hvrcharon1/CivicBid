# CivicBid - AI-Powered Government Auction Discovery Platform

CivicBid is an elegant, production-ready platform for discovering and analyzing government surplus and seized property auctions. It aggregates auction data from multiple government sources and uses AI to provide intelligent analysis, fair market value estimates, and bidding strategies.

## Features

### Core Functionality
- **Unified Auction Aggregation**: Aggregates auctions from GSA, GovPlanet, PropertyRoom, IAAI, and other government sources
- **Advanced Search & Filtering**: Search by category, location, price range, and auction end date
- **Real-Time Auction Details**: Live countdown timers, bid tracking, and property information
- **Interactive Maps**: Google Maps integration for property location visualization and geographic filtering
- **Watchlist Management**: Save auctions and track them with real-time notifications

### AI-Powered Features
- **Auction Analysis**: AI-generated summaries, fair market value estimation, risk assessment, and bidding strategies
- **AI Chat Assistant**: Embedded Q&A assistant for questions about specific auctions
- **Property Image Analysis**: AI vision capabilities for condition assessment from property photos
- **Smart Recommendations**: Personalized auction suggestions based on user preferences and watchlist

### User Experience
- **User Dashboard**: Manage watchlist, track bids, view recommendations, and receive alerts
- **Admin Dashboard**: Monitor data sources, review aggregations, and view platform analytics
- **Email Notifications**: Alerts for auctions ending soon, outbid events, and new matching listings
- **Settings & Preferences**: Customize notification preferences and account settings
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile devices

### Authentication & Authorization
- **Manus OAuth**: Secure authentication via Manus OAuth provider
- **Role-Based Access Control**: Separate user and admin capabilities
- **Protected Routes**: Authenticated access to dashboard, settings, and admin features

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **shadcn/ui** for component library
- **Wouter** for routing
- **tRPC** for type-safe API calls
- **Streamdown** for markdown rendering

### Backend
- **Express.js** for HTTP server
- **tRPC** for RPC procedures
- **Drizzle ORM** for database access
- **MySQL/TiDB** for data persistence
- **Node.js** runtime

### AI & External Services
- **Manus LLM API** for AI analysis and chat
- **Google Maps API** (via Manus proxy) for location services
- **S3 Storage** for auction images and media

### Database Schema
- `users` - User accounts and profiles
- `auctions` - Aggregated auction listings
- `watchlists` - User watchlist items
- `bids` - Bid history and tracking
- `ai_analysis` - Cached AI analysis results
- `chat_messages` - AI chat conversation history
- `notifications` - In-app notifications
- `auction_images` - Property images and media
- `data_sources` - Configured auction data sources
- `email_preferences` - User notification preferences

## Getting Started

### Prerequisites
- Node.js 22.x or higher
- pnpm package manager
- MySQL/TiDB database
- Manus OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hvrcharon1/CivicBid.git
   cd CivicBid
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Configure the following variables:
   - `DATABASE_URL` - MySQL/TiDB connection string
   - `JWT_SECRET` - Session signing secret
   - `VITE_APP_ID` - Manus OAuth app ID
   - `OAUTH_SERVER_URL` - Manus OAuth server URL
   - `VITE_OAUTH_PORTAL_URL` - Manus login portal URL
   - `BUILT_IN_FORGE_API_URL` - Manus API base URL
   - `BUILT_IN_FORGE_API_KEY` - Manus API key (server-side)
   - `VITE_FRONTEND_FORGE_API_KEY` - Manus API key (client-side)

4. **Initialize the database**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

## Development

### Project Structure
```
CivicBid/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and helpers
│   │   ├── contexts/      # React contexts
│   │   └── App.tsx        # Main app component
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routers.ts         # tRPC procedures
│   ├── db.ts              # Database helpers
│   └── _core/             # Core infrastructure
├── drizzle/               # Database schema and migrations
└── shared/                # Shared types and constants
```

### Key Commands

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm check            # TypeScript type checking
pnpm format           # Format code with Prettier

# Database
pnpm drizzle-kit generate  # Generate migrations
pnpm db:push              # Apply migrations

# Testing
pnpm test             # Run Vitest suite
pnpm test:watch       # Run tests in watch mode

# Production
pnpm build            # Build for production
pnpm start            # Start production server
```

### Adding Features

1. **Update Database Schema**
   - Edit `drizzle/schema.ts`
   - Run `pnpm drizzle-kit generate`
   - Apply migration: `pnpm db:push`

2. **Add Backend Procedures**
   - Create helper functions in `server/db.ts`
   - Add tRPC procedures in `server/routers.ts`
   - Write tests in `server/*.test.ts`

3. **Build Frontend Pages**
   - Create component in `client/src/pages/`
   - Register route in `client/src/App.tsx`
   - Use tRPC hooks for data fetching

4. **Style with Tailwind**
   - Use Tailwind utilities in JSX
   - Customize theme in `client/src/index.css`
   - Reference design tokens for consistency

## Deployment

### Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t civicbid:latest .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="mysql://..." \
     -e JWT_SECRET="..." \
     civicbid:latest
   ```

### Environment Variables for Production
- Set all required variables in your deployment platform
- Use secure secret management (AWS Secrets Manager, Vault, etc.)
- Never commit `.env` files to version control

### Database Backup
- Regular backups of MySQL/TiDB database
- Consider point-in-time recovery capabilities
- Monitor database performance and growth

## API Documentation

### Authentication
All protected endpoints require a valid session cookie set by `/api/oauth/callback`.

### tRPC Procedures

#### Auctions
- `auctions.search` - Search and filter auctions
- `auctions.getById` - Get single auction details
- `auctions.getByIds` - Get multiple auctions
- `auctions.getImages` - Get auction images

#### Watchlist
- `watchlist.getList` - Get user's watchlist
- `watchlist.add` - Add auction to watchlist
- `watchlist.remove` - Remove from watchlist
- `watchlist.isInWatchlist` - Check if in watchlist

#### AI Analysis
- `aiAnalysis.getAnalysis` - Get cached analysis
- `aiAnalysis.generateAnalysis` - Generate new analysis

#### Chat
- `chat.getHistory` - Get chat conversation history
- `chat.sendMessage` - Send message to AI assistant

#### Notifications
- `notifications.getList` - Get user notifications
- `notifications.markAsRead` - Mark notification as read

#### Preferences
- `preferences.getEmailPreferences` - Get email settings
- `preferences.updateEmailPreferences` - Update email settings

## Testing

### Unit Tests
```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
```

### Test Coverage
- Database helpers in `server/db.test.ts`
- tRPC procedures in `server/routers.test.ts`
- UI components in `client/src/components/*.test.tsx`

### Example Test
```typescript
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("auctions.search", () => {
  it("returns auctions matching search criteria", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auctions.search({
      query: "car",
      limit: 10,
    });
    expect(result).toHaveLength(10);
  });
});
```

## Performance Optimization

### Frontend
- Code splitting with React lazy loading
- Image optimization and lazy loading
- CSS minification with Tailwind
- Bundle analysis with Vite

### Backend
- Database query optimization with Drizzle
- Caching of AI analysis results
- Connection pooling for database
- Rate limiting on public endpoints

### Database
- Indexes on frequently queried columns
- Partitioning for large tables
- Query optimization and monitoring

## Security

### Authentication
- Manus OAuth for secure authentication
- Session cookies with secure flags
- CSRF protection on state-changing operations

### Data Protection
- HTTPS/TLS for all communications
- SQL injection prevention via Drizzle ORM
- XSS protection with React's built-in escaping
- Rate limiting on API endpoints

### Privacy
- User data encryption at rest
- GDPR-compliant data handling
- Clear privacy policy and terms of service
- User consent for data collection

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
mysql -h <host> -u <user> -p <database>

# Check DATABASE_URL format
# mysql://user:password@host:port/database
```

### OAuth Configuration
- Verify VITE_APP_ID matches Manus OAuth app
- Check OAUTH_SERVER_URL is accessible
- Ensure redirect URI is configured in Manus console

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check TypeScript
pnpm check
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: support@civicbid.io
- Documentation: https://docs.civicbid.io

## Roadmap

### Phase 2 (Future)
- [ ] Mobile app (iOS/Android) with React Native
- [ ] Advanced analytics dashboard
- [ ] Automated bidding strategies
- [ ] Integration with payment processors
- [ ] Multi-language support
- [ ] Real-time auction updates via WebSocket
- [ ] Auction price prediction model
- [ ] Community forums and discussion

### Phase 3 (Future)
- [ ] Blockchain-based auction verification
- [ ] API for third-party integrations
- [ ] Advanced reporting and export
- [ ] Machine learning recommendations
- [ ] Auction aggregation from international sources

## Acknowledgments

- Built with React, Express, and TypeScript
- UI components from shadcn/ui
- Maps powered by Google Maps API
- AI analysis via Manus LLM
- Auction data from government sources

---

**CivicBid** - Discover Government Auctions with Intelligence
