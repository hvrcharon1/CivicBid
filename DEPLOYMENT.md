# CivicBid Deployment Guide

This guide covers deploying CivicBid to production environments.

## Prerequisites

- Node.js 22.x or higher
- MySQL 8.0+ or TiDB
- Docker and Docker Compose (for containerized deployment)
- Manus OAuth credentials
- Manus API access

## Local Development

### 1. Setup Environment

```bash
# Clone repository
git clone https://github.com/hvrcharon1/CivicBid.git
cd CivicBid

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration
```

### 2. Database Setup

```bash
# Generate migrations
pnpm drizzle-kit generate

# Apply migrations
pnpm db:push
```

### 3. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`

## Docker Deployment

### 1. Build Docker Image

```bash
docker build -t civicbid:latest .
```

### 2. Run with Docker Compose

```bash
# Create .env file with required variables
docker-compose up -d
```

### 3. Access Application

```bash
# Check logs
docker-compose logs -f app

# Access at http://localhost:3000
```

## Production Deployment

### AWS ECS Deployment

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name civicbid
   ```

2. **Build and Push Image**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com
   
   docker build -t civicbid:latest .
   docker tag civicbid:latest [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/civicbid:latest
   docker push [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/civicbid:latest
   ```

3. **Create ECS Task Definition**
   - Reference the ECR image
   - Set environment variables
   - Configure logging to CloudWatch
   - Set resource limits (CPU: 512, Memory: 1024)

4. **Create ECS Service**
   - Use Application Load Balancer
   - Configure health checks
   - Set auto-scaling policies

### Railway Deployment

1. **Connect Repository**
   - Link GitHub repository to Railway

2. **Configure Environment**
   - Set environment variables in Railway dashboard
   - Configure MySQL database

3. **Deploy**
   - Push to main branch
   - Railway automatically deploys

### Render Deployment

1. **Create New Service**
   - Select "Docker" as environment
   - Connect GitHub repository

2. **Configure**
   - Set environment variables
   - Configure PostgreSQL database (or use external MySQL)

3. **Deploy**
   - Render automatically builds and deploys

## Environment Variables

### Required
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Session signing secret
- `VITE_APP_ID` - Manus OAuth app ID
- `OAUTH_SERVER_URL` - Manus OAuth server URL
- `BUILT_IN_FORGE_API_KEY` - Manus API key

### Optional
- `NODE_ENV` - Set to "production"
- `AGGREGATION_INTERVAL_MINUTES` - Auction sync frequency (default: 60)
- `MAX_AUCTIONS_PER_SOURCE` - Max auctions per source (default: 5000)
- `SENDGRID_API_KEY` - For email notifications
- `ENABLE_EMAIL_NOTIFICATIONS` - Enable email alerts (default: true)

## Database Migrations

### Manual Migration

```bash
# Generate migration from schema changes
pnpm drizzle-kit generate

# Review generated SQL
cat drizzle/[timestamp]_*.sql

# Apply migration
pnpm db:push
```

### Backup Before Migration

```bash
# MySQL backup
mysqldump -u user -p database > backup.sql

# Restore if needed
mysql -u user -p database < backup.sql
```

## Monitoring & Logging

### Application Logs

```bash
# Docker logs
docker-compose logs -f app

# ECS logs (CloudWatch)
aws logs tail /ecs/civicbid --follow

# Render logs
# View in Render dashboard
```

### Health Checks

```bash
# Check application health
curl http://localhost:3000/health

# Check database connection
curl http://localhost:3000/api/health/db
```

### Metrics

- Monitor CPU and memory usage
- Track database connection pool
- Monitor API response times
- Track error rates

## Scaling

### Horizontal Scaling

1. **Load Balancer**
   - Use AWS ALB or similar
   - Route traffic across multiple instances

2. **Database Optimization**
   - Add indexes for frequently queried columns
   - Use read replicas for scaling reads
   - Monitor slow queries

3. **Caching**
   - Implement Redis for session caching
   - Cache AI analysis results
   - Cache auction data

### Vertical Scaling

- Increase CPU and memory allocation
- Upgrade database instance type
- Use faster storage (SSD)

## Security

### SSL/TLS

```bash
# Use Let's Encrypt with nginx
# Or configure in load balancer
```

### Secrets Management

- Use AWS Secrets Manager or similar
- Rotate API keys regularly
- Never commit secrets to repository

### Database Security

- Enable SSL connections
- Use strong passwords
- Restrict database access to application only
- Enable audit logging

## Backup & Recovery

### Automated Backups

- Enable automated MySQL backups
- Set retention period (e.g., 30 days)
- Test restore procedures

### Disaster Recovery

1. **RTO (Recovery Time Objective)**: 1 hour
2. **RPO (Recovery Point Objective)**: 1 hour
3. **Backup Strategy**:
   - Daily full backups
   - Hourly incremental backups
   - Cross-region replication

## Performance Optimization

### Frontend

- Enable gzip compression
- Minify CSS/JS
- Use CDN for static assets
- Implement lazy loading

### Backend

- Use connection pooling
- Implement caching
- Optimize database queries
- Use async/await for I/O operations

### Database

- Add appropriate indexes
- Partition large tables
- Analyze query performance
- Monitor slow query log

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Verify environment variables
docker-compose config

# Check database connection
docker-compose exec app npm run check
```

### Database Connection Issues

```bash
# Test connection
mysql -h host -u user -p database

# Check connection string format
# mysql://user:password@host:port/database
```

### High Memory Usage

```bash
# Check Node.js memory
node --max-old-space-size=2048 dist/index.js

# Profile memory usage
node --inspect dist/index.js
```

## Support

For deployment issues:
- Check logs in `.manus-logs/` directory
- Review environment variables
- Verify database connectivity
- Contact support at support@civicbid.io
