# System Architecture - B2B Multi-Tenant Platform

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  System Admin   │    │  Club Admin     │    │  Club Staff     │    │   Customers     │
│    Portal       │    │   Dashboard     │    │     App         │    │    Portal       │
│   (Next.js)     │    │   (Next.js)     │    │   (Next.js)     │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         └───────────────────────┼───────────────────────┼───────────────────────┘
                                 │                       │
                        ┌─────────────────┐             │
                        │   GraphQL API   │             │
                        │   (NestJS)      │             │
                        │  Multi-Tenant   │             │
                        └─────────────────┘             │
                                 │                       │
                        ┌─────────────────┐             │
                        │   Services      │             │
                        │     Layer       │             │
                        │  (Tenant-Aware) │             │
                        └─────────────────┘             │
                                 │                       │
                ┌────────────────┼────────────────┐     │
                │                │                │     │
       ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
       │ PostgreSQL  │  │    Redis    │  │   Payment   ││
       │ Multi-Tenant│  │    Cache    │  │  Processing ││
       │  Database   │  │  (Sessions) │  │  (Stripe)   ││
       └─────────────┘  └─────────────┘  └─────────────┘│
                                                        │
                        ┌─────────────────┐             │
                        │  Mobile Apps    │             │
                        │ (iOS/Android)   │─────────────┘
                        │   Staff QR      │
                        │   Scanner       │
                        └─────────────────┘
```

## Backend Architecture

### Multi-Tenant Service Layer

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Presentation Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   System    │  │    Club     │  │    Club     │  │  Customer  │ │
│  │   Admin     │  │   Admin     │  │    Staff    │  │    API     │ │
│  │  GraphQL    │  │  GraphQL    │  │   GraphQL   │  │  GraphQL   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                      Multi-Tenant Service Layer                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   Tenant    │  │    Auth     │  │  Billing    │  │   QR Code  │ │
│  │  Management │  │   Service   │  │  Service    │  │   Service  │ │
│  │   Service   │  │(Multi-Role) │  │ (Payments)  │  │(Generator) │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  Customer   │  │Subscription │  │   Check-in  │  │  Analytics │ │
│  │  Management │  │   Package   │  │   Service   │  │   Service  │ │
│  │   Service   │  │   Service   │  │  (Logging)  │  │ (Reports)  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                        Repository Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   Prisma    │  │    Redis    │  │   Stripe    │  │   Email    │ │
│  │ Multi-Tenant│  │   Client    │  │     API     │  │  Service   │ │
│  │ Repository  │  │ (Sessions)  │  │ (Payments)  │  │   (SMS)    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                           Data Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ PostgreSQL  │  │    Redis    │  │   Payment   │  │ File Store │ │
│  │ Multi-Tenant│  │    Cache    │  │   Gateway   │  │   (AWS S3  │ │
│  │  Database   │  │ (Sessions)  │  │  (Stripe)   │  │  /MinIO)   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Multi-Tenant Database Design

### Enhanced Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Club     │────▷│    User     │◁────│  Customer   │────▷│Subscription │
│             │     │             │     │             │     │             │
│ - id        │     │ - id        │     │ - id        │     │ - id        │
│ - name      │     │ - email     │     │ - email     │     │ - customerId│
│ - domain    │     │ - username  │     │ - name      │     │ - packageId │
│ - settings  │     │ - role      │     │ - phone     │     │ - startDate │
│ - isActive  │     │ - clubId    │     │ - clubId    │     │ - endDate   │
│ - createdAt │     │ - isActive  │     │ - isActive  │     │ - isActive  │
│ - plan      │     │ - lastLogin │     │ - createdAt │     │ - credits   │
└─────────────┘     └─────────────┘     │ - address   │     │ - usedCredits│
        │                   │           │ - birthDate │     └─────────────┘
        │                   │           └─────────────┘             │
        ▽                   ▽                   │                   │
┌─────────────┐     ┌─────────────┐             │                   ▽
│Subscription │     │   QRCode    │             │           ┌─────────────┐
│   Package   │     │             │             │           │   Payment   │
│             │     │ - id        │             │           │             │
│ - id        │     │ - code      │             │           │ - id        │
│ - name      │     │ - customerId│             │           │ - subId     │
│ - clubId    │     │ - subId     │             │           │ - amount    │
│ - type      │     │ - isActive  │             │           │ - status    │
│ - price     │     │ - expiresAt │             │           │ - createdAt │
│ - credits   │     └─────────────┘             │           │ - method    │
│ - duration  │             │                   │           └─────────────┘
│ - features  │             │                   ▽
│ - isActive  │             │           ┌─────────────┐
└─────────────┘             │           │    Event    │
        │                   │           │             │
        │                   │           │ - id        │
        │                   ▽           │ - name      │
        │           ┌─────────────┐     │ - clubId    │
        │           │ CheckinLog  │     │ - startTime │
        │           │             │     │ - endTime   │
        │           │ - id        │     │ - capacity  │
        │           │ - customerId│     │ - isActive  │
        │           │ - eventId   │     └─────────────┘
        │           │ - qrCodeId  │
        │           │ - type      │
        │           │ - timestamp │
        │           │ - location  │
        │           └─────────────┘
        │
        ▽
┌─────────────┐
│   Invoice   │
│             │
│ - id        │
│ - customerId│
│ - packageId │
│ - amount    │
│ - status    │
│ - dueDate   │
│ - paidAt    │
└─────────────┘
```

### Multi-Tenant Data Isolation

**Tenant Identification Strategy:**
- Each Club acts as a tenant
- All data is partitioned by `clubId`
- Row-level security for data isolation
- Tenant-aware services and repositories

**Database Schema Principles:**
```sql
-- Every customer-related table includes clubId for isolation
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id),
  email VARCHAR UNIQUE,
  name VARCHAR NOT NULL,
  -- ... other fields
  CONSTRAINT unique_customer_per_club UNIQUE(club_id, email)
);

-- Automatic tenant filtering in all queries
CREATE POLICY customer_isolation ON customers
  USING (club_id = current_setting('app.current_club_id')::UUID);
```

## Role-Based Access Control (RBAC)

### Permission Matrix

| Resource | System Admin | Club Admin | Club Staff | Customer |
|----------|-------------|------------|------------|----------|
| Manage Clubs | ✅ | ❌ | ❌ | ❌ |
| Create Users | ✅ | ✅* | ❌ | ❌ |
| Manage Packages | ✅ | ✅* | ❌ | ❌ |
| Scan QR Codes | ✅ | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅* | ✅* | ✅* |
| Manage Customers | ✅ | ✅* | ✅* | ❌ |
| Purchase Packages | ❌ | ❌ | ❌ | ✅ |
| View Own Data | ✅ | ✅ | ✅ | ✅ |

*\* = Only within their club*

### Authentication & Authorization Flow

```
1. Login Request → JWT Token Generation
2. Token includes: userId, clubId, role, permissions
3. Each API request validates:
   - Token validity
   - User role permissions
   - Tenant (club) isolation
   - Resource access rights
```

## Security Architecture

### Authentication Flow
```
Client → GraphQL API → JWT Validation → Service Layer → Database
```

### Authorization Levels
- **Admin**: Full system access
- **Staff**: QR scanning, event monitoring
- **User**: Profile management, QR code access

### Data Protection
- JWT tokens for session management
- Role-based access control (RBAC)
- Input validation and sanitization
- Encrypted password storage
- HTTPS/TLS encryption

## Frontend Architecture

### Multi-Application Structure

```
frontend/
├── apps/
│   ├── system-admin/     # System admin portal
│   │   ├── pages/
│   │   │   ├── clubs/    # Club management
│   │   │   ├── billing/  # Platform billing
│   │   │   └── analytics/# Platform analytics
│   │   └── components/
│   ├── club-admin/       # Club admin dashboard
│   │   ├── pages/
│   │   │   ├── staff/    # Staff management
│   │   │   ├── packages/ # Package management
│   │   │   ├── customers/# Customer management
│   │   │   └── reports/  # Club analytics
│   │   └── components/
│   ├── club-staff/       # Staff operational app
│   │   ├── pages/
│   │   │   ├── scanner/  # QR scanning
│   │   │   ├── customers/# Customer lookup
│   │   │   └── logs/     # Activity logs
│   │   └── components/
│   └── customer/         # Customer portal
│       ├── pages/
│       │   ├── packages/ # Browse packages
│       │   ├── subscription/# Manage subscription
│       │   └── profile/  # Profile management
│       └── components/
├── shared/
│   ├── components/       # Shared UI components
│   ├── utils/           # Common utilities
│   ├── types/           # TypeScript definitions
│   └── graphql/         # Shared GraphQL queries
└── packages/
    ├── ui/              # Design system
    └── config/          # Shared configurations
```

## Mobile App Architecture

### Staff Mobile App (React Native/Flutter)
```
StaffApp/
├── src/
│   ├── screens/
│   │   ├── Scanner/      # QR code scanning
│   │   ├── CustomerInfo/ # Customer details
│   │   ├── Reports/      # Activity reports
│   │   └── Settings/     # App settings
│   ├── components/
│   │   ├── QRScanner/    # QR scanning component
│   │   ├── CustomerCard/ # Customer display
│   │   └── StatusBadge/  # Status indicators
│   ├── services/
│   │   ├── api/          # Backend API calls
│   │   ├── storage/      # Local storage
│   │   └── sync/         # Offline sync
│   └── utils/
│       ├── validation/   # QR code validation
│       └── permissions/  # Camera permissions
```

### Customer Mobile App (React Native/Flutter)
```
CustomerApp/
├── src/
│   ├── screens/
│   │   ├── QRDisplay/    # Show QR code
│   │   ├── Packages/     # Browse packages
│   │   ├── History/      # Usage history
│   │   └── Profile/      # User profile
│   ├── components/
│   │   ├── QRCode/       # QR code display
│   │   ├── PackageCard/  # Package display
│   │   └── PaymentForm/  # Payment processing
│   └── services/
│       ├── payment/      # Payment integration
│       └── notifications/# Push notifications
```

## Security Architecture

### Multi-Tenant Security Model

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                     │
├─────────────────────────────────────────────────────────┤
│ 1. Network Security (HTTPS/TLS, Firewall)              │
├─────────────────────────────────────────────────────────┤
│ 2. Authentication (JWT, Multi-Factor)                  │
├─────────────────────────────────────────────────────────┤
│ 3. Authorization (RBAC, Resource-based)                │
├─────────────────────────────────────────────────────────┤
│ 4. Tenant Isolation (Row-level Security)               │
├─────────────────────────────────────────────────────────┤
│ 5. Data Encryption (At-rest, In-transit)               │
├─────────────────────────────────────────────────────────┤
│ 6. Audit Logging (Activity Tracking)                   │
└─────────────────────────────────────────────────────────┘
```

### Authentication Flow
```
1. User Login → Validate credentials → Generate JWT
2. JWT contains: { userId, clubId, role, permissions }
3. Each request validates:
   - Token signature and expiry
   - User role and permissions
   - Tenant (club) isolation
   - Resource access rights
```

## Payment Integration Architecture

### Subscription Billing Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Customer   │───▷│   Payment   │───▷│   Stripe    │───▷│  Webhook    │
│   Portal    │    │  Processing │    │    API      │    │  Handler    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▽                   ▽                   ▽                   ▽
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Package   │    │   Invoice   │    │   Payment   │    │Subscription │
│  Selection  │    │ Generation  │    │   Record    │    │ Activation  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Payment Events
- **subscription.created**: New subscription purchased
- **payment.succeeded**: Successful payment processed
- **payment.failed**: Payment failure handling
- **subscription.expired**: Auto-disable expired subscriptions

## Deployment Architecture

### Multi-Environment Setup

```
┌─────────────────────────────────────────────────────────┐
│                    Production                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │     CDN     │  │Load Balancer│  │  Auto Scaling   │ │
│  │ (CloudFlare)│  │   (Nginx)   │  │     Group       │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
│         │                │                   │         │
│         ▽                ▽                   ▽         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Frontend  │  │   Backend   │  │    Database     │ │
│  │Applications │  │   Services  │  │    Cluster      │ │
│  │(Next.js x4) │  │  (NestJS)   │  │ (PostgreSQL)    │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Container Orchestration

```yaml
# docker-compose.production.yml
version: '3.8'
services:
  # System Admin Portal
  system-admin:
    build: ./frontend/apps/system-admin
    environment:
      - NEXT_PUBLIC_API_URL=https://api.qrcheckin.com
      - NEXT_PUBLIC_APP_ENV=production
    networks: [web]

  # Club Admin Dashboard
  club-admin:
    build: ./frontend/apps/club-admin
    environment:
      - NEXT_PUBLIC_API_URL=https://api.qrcheckin.com
    networks: [web]

  # Club Staff App
  club-staff:
    build: ./frontend/apps/club-staff
    environment:
      - NEXT_PUBLIC_API_URL=https://api.qrcheckin.com
    networks: [web]

  # Customer Portal
  customer:
    build: ./frontend/apps/customer
    environment:
      - NEXT_PUBLIC_API_URL=https://api.qrcheckin.com
      - NEXT_PUBLIC_STRIPE_KEY=${STRIPE_PUBLIC_KEY}
    networks: [web]

  # Backend API
  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    networks: [web, db]
    depends_on: [postgres, redis]

  # Database
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=qrcheckin
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks: [db]

  # Cache
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks: [db]

  # Load Balancer
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    networks: [web]
    depends_on: [system-admin, club-admin, club-staff, customer, backend]

networks:
  web:
  db:

volumes:
  postgres_data:
  redis_data:
```

## Scalability Considerations

### Horizontal Scaling Strategy

1. **Frontend Applications**: Deploy multiple instances behind CDN
2. **Backend Services**: Auto-scaling backend instances with load balancing
3. **Database**: Read replicas for improved query performance
4. **Caching**: Distributed Redis cluster for session management
5. **File Storage**: CDN for static assets and QR code images
6. **Monitoring**: Comprehensive logging and metrics collection

### Performance Optimization

- **Database**: Connection pooling, query optimization, indexing
- **Caching**: Redis for sessions, frequently accessed data
- **CDN**: Global content delivery for static assets
- **API**: GraphQL query optimization, data loader patterns
- **Mobile**: Offline-first architecture with sync capabilities