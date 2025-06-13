# QR Check-in Platform - B2B SaaS Solution

A comprehensive multi-tenant B2B SaaS platform that provides QR code-based check-in/check-out services to clubs and organizations. Built with modern technologies and designed for scalability, security, and ease of use.

## 🏢 Business Model

### Service Provider (Our Company)
- **System Admins**: Manage the entire platform, create and manage club accounts
- **Technical Support**: Handle technical issues and system maintenance

### Club Clients (Our Customers)  
- **Club Admins**: Full club management rights, create subscription packages, manage staff
- **Club Staff**: QR scanning for customer check-in/check-out, view logs and reports

### End Customers
- **Club Members**: Purchase subscription packages and use QR codes for facility access

## 🚀 Project Overview

This B2B SaaS platform enables clubs and organizations to offer QR code-based check-in services to their customers. Each club operates in an isolated multi-tenant environment with complete control over their customer base, subscription packages, and pricing.

## 📱 Platform Components

### Backend (NestJS + TypeScript)
- **Status**: ✅ Production Ready
- **API**: GraphQL with REST endpoints
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with role-based access control
- **Multi-tenancy**: Club-based data isolation

### Frontend Web Apps (Next.js + TypeScript)
- **Status**: 🔄 In Development
- **System Admin Portal**: Platform management
- **Club Admin Dashboard**: Club operations management
- **Club Staff App**: Check-in operations interface
- **Customer Portal**: Package purchase and QR access

### iOS Mobile App (Swift + SwiftUI)
- **Status**: 🔄 In Development  
- **Target**: Club staff for QR code scanning
- **Features**: Real-time scanning, offline support, analytics

### Android Mobile App (Kotlin + Compose)
- **Status**: 🔄 In Development
- **Target**: Club staff for QR code scanning  
- **Features**: Real-time scanning, offline support, analytics

## 📁 Project Structure

```
qrCheckin/
├── backend/                 # ✅ NestJS backend (PRODUCTION READY)
│   ├── src/
│   │   ├── auth/           # Authentication and authorization
│   │   ├── clubs/          # Club management (tenants)
│   │   ├── users/          # User management (system, club admin, staff)
│   │   ├── subscription/   # Subscription and package management
│   │   ├── checkin/        # Check-in/check-out logic
│   │   ├── events/         # Event management
│   │   └── common/         # Shared utilities and DTOs
│   ├── prisma/             # Database schema and migrations
│   └── test/               # Unit and integration tests
├── frontend/               # 🔄 Next.js web applications (IN DEVELOPMENT)
│   ├── src/
│   │   ├── pages/          # Next.js pages
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── ios-app/                # 🔄 iOS Swift app (IN DEVELOPMENT)
│   └── qrCheckin/         
│       ├── Models/         # Data models
│       ├── Views/          # SwiftUI views
│       ├── ViewModels/     # View models
│       ├── Services/       # API and business logic
│       └── Utils/          # Utilities
├── android-app/            # 🔄 Android Kotlin app (IN DEVELOPMENT)
│   └── app/src/main/
│       ├── java/           # Kotlin source code
│       ├── res/            # Resources
│       └── AndroidManifest.xml
├── ```

## 🛠 Technology Stack

### Backend (✅ Production Ready)
- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for sessions and performance
- **API**: GraphQL with REST endpoints
- **Authentication**: JWT with role-based access control
- **Multi-tenancy**: Club-based data isolation
- **Container**: Docker with production setup

### Frontend (🔄 In Development)
- **Framework**: Next.js (React + TypeScript)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Apollo Client for GraphQL
- **UI Components**: Custom component library
- **Features**: Admin dashboards, customer portals

### iOS App (🔄 In Development)
- **Language**: Swift + SwiftUI
- **Architecture**: MVVM with Combine
- **API Integration**: GraphQL with Apollo iOS
- **Features**: QR scanning, offline support, real-time updates
- **Target**: iOS 14+

### Android App (🔄 In Development)
- **Language**: Kotlin + Jetpack Compose
- **Architecture**: MVVM with Hilt DI
- **API Integration**: GraphQL with Apollo Android
- **Features**: QR scanning, offline support, material design
- **Target**: Android 7.0+ (API 24)

## 🎯 Key Features

### Multi-Tenant B2B SaaS Architecture
- **Club Isolation**: Each club operates independently with isolated data
- **Role Hierarchy**: System Admin → Club Admin → Club Staff → Customers
- **Scalable Infrastructure**: Supports unlimited clubs on shared infrastructure
- **Custom Branding**: Club-specific configurations and branding

### Customer & Subscription Management
- **B2B Model**: Clubs are paying clients, customers are end users
- **Package-Based Subscriptions**: Flexible subscription packages with pricing tiers
- **Financial Tracking**: Revenue analytics, commission management, automated billing
- **Payment Integration**: Stripe integration with webhook support

### QR Code Check-in System
- **Secure QR Codes**: Encrypted codes with expiration and usage limits
- **Real-Time Validation**: Instant check-in/check-out processing
- **Offline Support**: Mobile apps work offline with sync capability
- **Complete Audit Trail**: All check-in activities logged and tracked

### Cross-Platform Mobile Apps
- **Staff Mobile Apps**: QR scanning, customer management, analytics
- **Real-time Sync**: Instant data synchronization across all platforms
- **Offline Capability**: Continue operations without internet connectivity
- **Push Notifications**: Real-time alerts and updates

## 🚀 Development Status & Roadmap

### ✅ Completed (Backend)
- Multi-tenant database schema with full B2B SaaS structure
- Authentication system with role-based access control
- GraphQL API with comprehensive queries and mutations
- Customer and subscription management
- QR code generation and validation
- Check-in/check-out processing
- Event management system
- Unit tests with 100% coverage

### 🔄 In Development

#### Frontend Web Applications
- **Admin Dashboard**: System admin portal for platform management
- **Club Dashboard**: Club admin interface for business management
- **Staff Interface**: Operational interface for club staff
- **Customer Portal**: Self-service portal for customers

#### iOS Mobile App
- **QR Scanner**: Camera-based QR code scanning
- **Dashboard**: Real-time analytics and recent activity
- **Event Management**: Select and manage events for check-ins
- **Offline Support**: Queue operations when offline

#### Android Mobile App
- **QR Scanner**: Material Design scanning interface
- **Analytics**: Charts and statistics for club operations
- **Event Selection**: Event management for staff operations
- **Offline Sync**: Background synchronization

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Using Docker (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd qrCheckin

# Start all services
docker-compose up -d

# Access the applications
# System Admin: http://localhost:3000
# Club Admin: http://localhost:3001  
# Club Staff: http://localhost:3002
# Customer Portal: http://localhost:3003
# Backend API: http://localhost:4000
# GraphQL Playground: http://localhost:4000/graphql
```

### Manual Setup

#### Backend Setup
## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Docker (optional)

### Backend Setup (Required First)
```bash
cd backend
npm install
cp .env.example .env
# Configure your database and Redis URLs in .env
npx prisma migrate deploy
npx prisma db seed
npm run start:dev  # Runs on port 4000
```

### Frontend Setup (In Development)
```bash
cd frontend
npm install
npm run dev  # Runs on port 3000
```

### iOS App Setup (In Development)
```bash
cd ios-app/qrCheckin
# Open qrCheckin.xcodeproj in Xcode
# Configure API endpoints in Config.swift
# Build and run on iOS Simulator or device
```

### Android App Setup (In Development)
```bash
cd android-app
# Open in Android Studio
# Configure API endpoints in gradle.properties
# Build and run on Android emulator or device
```

### Docker Development Environment
```bash
# Start all services
docker-compose up -d

# Backend will be available on http://localhost:4000
# Frontend will be available on http://localhost:3000
# Database on localhost:5432
# Redis on localhost:6379
```

## 📱 Application Architecture

### Backend API (Production Ready)
- **GraphQL Endpoint**: `http://localhost:4000/graphql`
- **Health Check**: `http://localhost:4000/health`
- **Documentation**: GraphQL Playground available in development
- **Authentication**: JWT tokens with role-based permissions

### Frontend Web Apps (In Development)
- **Main Portal**: `http://localhost:3000`
- **Features**: Multi-role dashboards, real-time updates, responsive design
- **Technology**: Next.js, TypeScript, Tailwind CSS, Apollo Client

### iOS Mobile App (In Development)
- **Target**: iOS 14.0+
- **Architecture**: SwiftUI + MVVM + Combine
- **Features**: 
  - QR code scanning with AVFoundation
  - Offline support with Core Data
  - Real-time updates with GraphQL subscriptions
  - Push notifications

### Android Mobile App (In Development)  
- **Target**: Android 7.0+ (API 24)
- **Architecture**: Jetpack Compose + MVVM + Hilt
- **Features**:
  - QR code scanning with CameraX
  - Offline support with Room database
  - Real-time updates with GraphQL subscriptions
  - Material Design 3

## 🔗 API Integration

### GraphQL Schema
```graphql
type Query {
  # Authentication
  me: User
  
  # Clubs (Multi-tenant)
  clubs: [Club!]!
  club(id: ID!): Club
  
  # Customers
  customers(clubId: ID!): [Customer!]!
  customer(id: ID!): Customer
  
  # Subscriptions
  subscriptions(customerId: ID): [Subscription!]!
  subscriptionPackages(clubId: ID!): [SubscriptionPackage!]!
  
  # Check-ins
  checkinLogs(limit: Int, offset: Int): [CheckinLog!]!
  
  # Events
  events(clubId: ID!): [Event!]!
}

type Mutation {
  # Authentication
  login(email: String!, password: String!): AuthResponse!
  logout: Boolean!
  
  # QR Operations
  checkin(qrCodeId: String!, eventId: String!): CheckinLog!
  checkout(qrCodeId: String!, eventId: String!): CheckinLog!
  
  # Customer Management
  createCustomer(input: CreateCustomerInput!): Customer!
  updateCustomer(id: ID!, input: UpdateCustomerInput!): Customer!
}
```

### Mobile App Integration Points
```typescript
// iOS Swift Integration
class GraphQLService {
    func performCheckin(qrCodeId: String, eventId: String) -> AnyPublisher<CheckinLog, Error>
    func fetchEvents() -> AnyPublisher<[Event], Error>
    func fetchRecentCheckins() -> AnyPublisher<[CheckinLog], Error>
}

// Android Kotlin Integration  
class QRCheckinRepository {
    suspend fun checkin(qrCodeId: String, eventId: String): Result<CheckinLog>
    suspend fun getEvents(): Flow<List<Event>>
    suspend fun getCheckinLogs(): Flow<List<CheckinLog>>
}
```
- **URL**: http://localhost:3003
- **Purpose**: Self-service subscription management
- **Features**: Package browsing, subscription management, QR code access, usage history

### Backend API (NestJS)
- **URL**: http://localhost:4000
- **GraphQL**: http://localhost:4000/graphql
- **Purpose**: Multi-tenant API with role-based access
- **Features**: Authentication, data management, QR generation, payment processing

### Mobile Apps
- **Staff App**: QR scanning and customer management
- **Customer App**: QR code display and subscription tracking
- **Purpose**: Mobile-optimized access for on-the-go usage

## 🏗 System Architecture

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

## 👤 User Roles & Permissions

### System Administrator (Our Staff)
- **Platform Management**: Create and manage club accounts
- **Technical Operations**: System maintenance and troubleshooting
- **Financial Oversight**: Platform billing and commission management
- **Analytics**: Global platform analytics and performance monitoring

### Club Administrator (Club Owner/Manager)
- **Club Management**: Complete control over club settings and branding
- **Staff Management**: Create and manage club staff accounts
- **Package Management**: Create and manage subscription packages
- **Customer Management**: Oversee customer base and provide support
- **Financial Management**: Club revenue tracking and reporting

### Club Staff (Club Employees)
- **QR Operations**: Scan QR codes for customer check-in/check-out
- **Customer Service**: Assist customers with subscriptions and issues
- **Reporting**: Generate and view operational reports
- **Customer Lookup**: Verify customer information and subscription status

### Customers (End Users)
- **Self-Service**: Browse and purchase subscription packages
- **Account Management**: Manage personal profile and preferences
- **QR Access**: Access QR codes for facility check-in/check-out
- **Usage Tracking**: View usage history and remaining credits/visits

## 📖 Documentation

Detailed documentation is available in the `/docs` folder:
- [Overview](./docs/overview.md)
- [Architecture](./docs/architecture.md)
- [Getting Started](./docs/getting-started.md)
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)

## 🎨 Design & Mockups

HTML mockups and design templates are available in the `/mock` folder:
- Admin dashboard mockup
- Subscription package management interface
- Member package selection interface
- QR scanner interface
- Sample data for development

## 🔧 Development

### Backend Development
```bash
cd backend
npm run start:dev    # Start development server
npm run test        # Run tests
npm run lint        # Lint code
```

### Frontend Development
```bash
cd frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # Lint code
```

### Database Management
```bash
cd backend
npm run prisma:studio      # Open Prisma Studio
npm run prisma:migrate     # Run migrations
npm run prisma:generate    # Generate Prisma client
```

## 🚀 Deployment

The project is containerized with Docker for easy deployment:

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For support, please contact the development team or create an issue in the repository.

---

Built with ❤️ using modern web technologies
