# QR Check-in B2B SaaS Backend

## ✅ Production Status: Ready for Enterprise Deployment

This is the **production-ready** backend service for the QR Check-in B2B SaaS platform, built with NestJS, GraphQL, Prisma, and PostgreSQL. The backend has been successfully transformed from a single-tenant system to a comprehensive multi-tenant B2B SaaS solution.

## 🏢 B2B SaaS Features

### Multi-Tenant Architecture
- **Organization Management**: Complete multi-tenant organization structure
- **Venue Management**: Multiple venues per organization with independent operations
- **Role-based Access Control**: Platform Admin, Organization Admin, Venue Manager, Staff roles
- **Data Isolation**: Secure tenant data separation and privacy
- **Subscription Management**: Flexible subscription tiers and billing integration

### Enterprise Capabilities
- **Scalable Architecture**: Designed for thousands of organizations and venues
- **High Performance**: Optimized queries and caching for enterprise workloads
- **Security**: JWT authentication, role-based permissions, and data encryption
- **Monitoring**: Comprehensive logging and error tracking
- **API Rate Limiting**: Protection against abuse and ensuring fair usage

## Features

### ✅ Production-Ready Features
- **Multi-tenant Authentication**: JWT-based auth with organization and role context
- **Comprehensive RBAC**: Platform Admin, Organization Admin, Venue Manager, Staff permissions
- **Organization Management**: Complete multi-tenant organization lifecycle
- **Venue Management**: Multiple venues per organization with independent settings
- **Advanced Event Management**: Recurring events, capacity management, and waitlists
- **Subscription System**: Flexible B2B subscription packages and billing
- **Member Management**: Enhanced member profiles with organization context
- **QR Code Generation**: Secure QR codes with organization and venue specificity
- **Check-in Tracking**: Comprehensive logging with multi-tenant data isolation
- **Analytics & Reporting**: Organization and venue-level analytics
- **Redis Caching**: High-performance caching for scalability
- **GraphQL API**: Type-safe, efficient API with real-time subscriptions
- **Database Migrations**: Production-ready schema with B2B transformations
- **Error Handling**: Comprehensive error tracking and logging
- **Performance Monitoring**: Built-in APM and metrics collection

### 🔒 Enterprise Security
- **Data Isolation**: Complete tenant data separation
- **JWT Security**: Secure token handling with role and organization context
- **Rate Limiting**: API protection and fair usage enforcement
- **Input Validation**: Comprehensive request validation and sanitization
- **Audit Logging**: Complete audit trail for compliance requirements

## Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL
- Redis (optional for development)
- Docker and Docker Compose (for containerized deployment)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory with the following content (adjust as needed):

```
# Database Configuration
DATABASE_URL="postgresql://qr_user:qr_password@localhost:5433/qr_checkin_db"

# JWT Configuration
JWT_SECRET="your-development-jwt-secret-key-change-this-in-production"
JWT_EXPIRATION="1d"

# Redis Configuration (optional for development)
REDIS_URL="redis://localhost:6380"

# Application Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
ADMIN_URL="http://localhost:3001"

# Debug (optional)
DEBUG=prisma:*,app:*
```

### 3. Start Database Services

Start PostgreSQL and Redis using Docker Compose:

```bash
cd ..
docker-compose up -d postgres redis
```

### 4. Database Setup

Generate the Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Seed the Database (Optional)

Populate the database with initial data:

```bash
npm run prisma:seed
```

### 6. Start the Server

For development with auto-reload:

```bash
npm run start:dev
```

For production:

```bash
npm run build
npm run start:prod
```

## API Documentation

### GraphQL Playground
Once the server is running, access the GraphQL playground at:
**http://localhost:4000/graphql**

### B2B API Examples

#### Authentication
```graphql
# Login with organization context
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    refreshToken
    user {
      id
      email
      role
      organizations {
        id
        name
        role
        venues {
          id
          name
        }
      }
    }
  }
}
```

#### Multi-tenant Operations
```graphql
# Get organization events
query GetOrganizationEvents($organizationId: ID!) {
  organization(id: $organizationId) {
    name
    venues {
      id
      name
      events {
        id
        name
        startTime
        attendeeCount
        capacity
      }
    }
  }
}

# Create venue (requires ORG_ADMIN or PLATFORM_ADMIN role)
mutation CreateVenue($input: CreateVenueInput!) {
  createVenue(input: $input) {
    id
    name
    organization {
      id
      name
    }
  }
}
```

## Default B2B SaaS Users

After running the seed script, the following test accounts are available:

### Platform Level
- **Platform Admin**: `platform@qrcheckin.com` / `platform123`
  - Full system access across all organizations

### Organization Level  
- **Organization Admin**: `admin@acmefitness.com` / `admin123`
  - Full access within ACME Fitness organization
- **Venue Manager**: `manager@acmefitness.com` / `manager123`
  - Access to assigned venues within organization
- **Staff Member**: `staff@acmefitness.com` / `staff123`
  - Day-to-day operations access

### Test Organizations
- **ACME Fitness**: Multi-venue fitness chain with 3 locations
- **TechCorp**: Corporate office with conference rooms and events
- **Community Center**: Public facility with various programs

*Note: These are development credentials for testing the B2B multi-tenant functionality.*

## B2B SaaS Project Structure

- `/src` - Main source code
  - `/auth` - Multi-tenant authentication and JWT handling
  - `/users` - User management with organization context
  - `/organizations` - Organization lifecycle management
  - `/venues` - Venue management within organizations
  - `/events` - Advanced event management with capacity controls
  - `/subscription` - B2B subscription packages and billing
  - `/checkin` - Check-in functionality with multi-tenant logging
  - `/analytics` - Organization and venue-level reporting
  - `/common` - Shared resources (DTOs, enums, mappers, validators)
  - `/config` - Application configuration with environment support
  - `/prisma` - Prisma service with multi-tenant query optimization
  - `/redis` - Caching service with tenant-aware keys
  - `/graphql` - GraphQL schema and resolvers
- `/prisma` - Database schema with B2B transformations and migrations
- `/test` - Comprehensive test suite including multi-tenant scenarios

## Production Deployment Features

### Docker Support
The backend is containerized and production-ready:

```bash
# Full stack deployment
cd ..
docker-compose up -d

# Backend only
docker-compose up -d backend postgres redis
```

### Environment Configuration
Supports multiple environments with proper configuration management:
- Development
- Staging  
- Production

### Database Management
- **Migrations**: Complete migration history with B2B transformations
- **Seeding**: Production-ready seed data for testing
- **Backup**: Database backup and restore procedures
- **Monitoring**: Query performance monitoring and optimization

### Scalability Features
- **Connection Pooling**: Optimized database connections
- **Caching Strategy**: Redis-based caching for high performance
- **Load Balancing**: Ready for horizontal scaling
- **Rate Limiting**: API protection and fair usage policies

## License

MIT
