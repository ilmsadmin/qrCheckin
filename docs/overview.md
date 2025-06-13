# QR Check-in System Overview - B2B Service Platform

## Project Description

The QR Check-in System is a comprehensive B2B SaaS solution that provides QR code-based check-in/check-out services to clubs and organizations. Each club that subscribes to our service gets their own dedicated environment with role-based user management and customer subscription management.

## Business Model

### Service Provider (Our Company)
- **System Admin**: Manages the entire platform, creates and manages club accounts
- **Technical Support**: Handles technical issues and system maintenance

### Club Clients (Our Customers)
- **Club Admin**: Full club management rights, creates subscription packages, manages staff
- **Club Staff**: QR scanning for customer check-in/check-out, view logs and reports
- **Club Customers**: End users who purchase subscription packages to access club services

## Key Features

### 1. Multi-Tenant Club Management
- Each club operates in isolated environment
- Club-specific branding and configuration
- Independent user management per club
- Subscription-based service billing

### 2. Role-Based Access Control
- **System Admin**: Platform-wide management
- **Club Admin**: Club-specific administration
- **Club Staff**: Operational QR scanning and logging
- **Customers**: Service usage and subscription management

### 3. Customer Subscription Management
- Customers purchase subscription packages from clubs
- Automated billing and payment tracking
- Package expiration management
- Usage limits and tracking

### 4. QR Code Service
- Unique QR codes for each customer subscription
- Real-time check-in/check-out processing
- Offline capability for staff mobile apps
- Comprehensive activity logging

### 5. Financial Management
- Club revenue tracking
- Customer payment history
- Package pricing management
- Automated billing notifications

## System Components

### Backend (NestJS)
- **Technology**: NestJS, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **API**: GraphQL
- **Authentication**: JWT with multi-tenant support
- **Billing**: Subscription and payment processing
- **Containerization**: Docker

### Frontend Applications
- **System Admin Panel**: Platform management (Next.js)
- **Club Admin Dashboard**: Club management interface (Next.js)
- **Club Staff App**: QR scanning and customer management (Next.js)
- **Customer Portal**: Subscription management and QR access (Next.js)

### Mobile Applications
- **Staff Mobile App**: iOS/Android for QR scanning
- **Customer Mobile App**: QR code display and usage tracking

## User Roles & Permissions

### 1. System Admin (Our Staff)
- **Full Platform Access**
  - Create and manage club accounts
  - Platform configuration and maintenance
  - Global analytics and reporting
  - Billing and subscription management
  - Technical support and troubleshooting

### 2. Club Admin (Club Owner/Manager)
- **Full Club Management**
  - Create and manage club staff accounts
  - Create and manage subscription packages
  - Set pricing and package features
  - Customer management and support
  - Club analytics and financial reports
  - Club branding and configuration

### 3. Club Staff (Club Employees)
- **Operational Access**
  - QR code scanning for check-in/check-out
  - Customer lookup and verification
  - View customer subscription status
  - Generate activity reports
  - Handle customer service issues

### 4. Customers (End Users)
- **Service Access**
  - Browse and purchase subscription packages
  - Manage personal subscription
  - Access QR codes for check-in/check-out
  - View usage history and remaining credits
  - Update payment information

## Workflow

### Club Onboarding
1. **Service Registration**: Club contacts us for QR service
2. **Account Creation**: System Admin creates club account
3. **Setup**: Club Admin configures club settings and branding
4. **Staff Setup**: Club Admin creates staff accounts
5. **Package Creation**: Club Admin creates subscription packages
6. **Go Live**: Club starts accepting customers

### Customer Journey
1. **Discovery**: Customer visits club and learns about subscription packages
2. **Registration**: Customer creates account and selects package
3. **Payment**: Customer pays for subscription package
4. **QR Generation**: System generates unique QR code for customer
5. **Service Usage**: Customer uses QR code for check-in/check-out
6. **Tracking**: System tracks usage and manages subscription expiration

### Daily Operations
1. **Check-in**: Staff scans customer QR codes for entry
2. **Check-out**: Staff scans QR codes for exit (if required)
3. **Monitoring**: Real-time tracking of facility usage
4. **Reporting**: Daily/weekly/monthly reports for club management

## Technology Stack Benefits

- **Multi-Tenancy**: Isolated club environments with shared infrastructure
- **Scalability**: Microservices architecture supporting multiple clubs
- **Security**: Role-based access with tenant isolation
- **Billing Integration**: Automated subscription and payment processing
- **Real-time Updates**: Live facility occupancy and usage tracking
- **Mobile-First**: Native apps for optimal staff and customer experience
- **Analytics**: Comprehensive reporting for business insights
- **Reliability**: High availability with Redis caching and PostgreSQL