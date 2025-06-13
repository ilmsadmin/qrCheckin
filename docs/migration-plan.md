# Migration Plan: From Current System to B2B Multi-Tenant Platform

## Overview

This document outlines the migration strategy from the current QR check-in system to the new B2B multi-tenant SaaS platform. The migration will be executed in phases to minimize disruption and ensure data integrity.

## Current System Analysis

### Current Architecture
- Single-tenant system with basic user roles (Admin, Staff, User)
- Direct user-to-subscription relationship
- Simple package management
- Basic QR code generation and validation
- Limited financial tracking

### Current Database Schema
```sql
-- Simplified current structure
Users (id, email, role, clubId, subscriptionId)
Clubs (id, name, isActive)
Subscriptions (id, userId, packageId, isActive)
SubscriptionPackages (id, clubId, name, price)
QRCodes (id, userId, subscriptionId)
CheckinLogs (id, userId, eventId, timestamp)
```

## Target Architecture

### New B2B Multi-Tenant Architecture
- Multi-tenant isolation with club-based data separation
- Enhanced role system (System Admin, Club Admin, Club Staff, Customers)
- Customer-centric subscription management
- Advanced financial tracking and commission management
- Scalable payment processing

### New Database Schema
```sql
-- Enhanced B2B structure
Clubs (tenant isolation, business settings, subscription plans)
Users (system/club users with enhanced roles)
Customers (end users, tenant-isolated)
Subscriptions (customer-centric with usage tracking)
SubscriptionPackages (enhanced with features and rules)
QRCodes (security-enhanced with tenant isolation)
CheckinLogs (comprehensive audit trail)
Payments (financial transaction tracking)
Events (enhanced event management)
```

## Migration Strategy

### Phase 1: Database Schema Migration (Week 1-2)

#### 1.1 Create New Tables
```sql
-- Create new tables for B2B architecture
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id),
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  -- ... other customer fields
  CONSTRAINT unique_customer_email_per_club UNIQUE(club_id, email)
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  status payment_status DEFAULT 'PENDING',
  -- ... other payment fields
);

-- Additional tables as per database-design.md
```

#### 1.2 Data Migration Scripts
```sql
-- Migrate existing users to customers
INSERT INTO customers (
  club_id, email, first_name, last_name, created_at, created_by
)
SELECT 
  u.club_id,
  u.email,
  COALESCE(u.first_name, 'Unknown'),
  COALESCE(u.last_name, 'User'),
  u.created_at,
  (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1)
FROM users u
WHERE u.role = 'USER' AND u.club_id IS NOT NULL;

-- Migrate subscriptions to new customer-centric model
UPDATE subscriptions s
SET customer_id = (
  SELECT c.id FROM customers c 
  WHERE c.email = (
    SELECT email FROM users u WHERE u.id = s.user_id
  )
  AND c.club_id = s.club_id
);
```

#### 1.3 Update Existing Tables
```sql
-- Add tenant isolation to existing tables
ALTER TABLE subscription_packages ADD COLUMN club_id UUID REFERENCES clubs(id);
ALTER TABLE qr_codes ADD COLUMN club_id UUID REFERENCES clubs(id);
ALTER TABLE checkin_logs ADD COLUMN club_id UUID REFERENCES clubs(id);

-- Update existing data with club associations
UPDATE subscription_packages sp
SET club_id = (
  SELECT club_id FROM users u 
  WHERE u.id = sp.created_by
);
```

### Phase 2: Backend API Migration (Week 3-4)

#### 2.1 Update GraphQL Schema
- Implement new types for Customer, Payment, enhanced Subscription
- Add multi-tenant resolvers with automatic club_id filtering
- Implement role-based access control with new permission matrix
- Add payment processing mutations and queries

#### 2.2 Service Layer Updates
```typescript
// Enhanced SubscriptionService with customer focus
@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService
  ) {}

  async createCustomerSubscription(
    customerId: string,
    packageId: string,
    clubId: string,
    paymentData: PaymentInput
  ): Promise<SubscriptionResult> {
    // Process payment first
    const payment = await this.paymentService.processPayment(paymentData);
    
    // Create subscription after successful payment
    const subscription = await this.prisma.subscription.create({
      data: {
        customerId,
        packageId,
        clubId,
        // ... other fields
      }
    });

    // Generate QR code
    const qrCode = await this.generateQRCode(subscription.id, customerId);

    return { subscription, payment, qrCode };
  }
}
```

#### 2.3 Authentication & Authorization
```typescript
// Enhanced JWT strategy with tenant context
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: any) {
    const user = await this.userService.findById(payload.sub);
    
    // Set tenant context for multi-tenant queries
    if (user.clubId) {
      await this.prisma.$executeRaw`
        SET app.current_club_id = ${user.clubId}
      `;
    }
    
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      clubId: user.clubId,
      permissions: user.permissions
    };
  }
}
```

### Phase 3: Frontend Application Migration (Week 5-6)

#### 3.1 Restructure Frontend Applications
```bash
# Create new application structure
mkdir -p frontend/apps/system-admin
mkdir -p frontend/apps/club-admin  
mkdir -p frontend/apps/club-staff
mkdir -p frontend/apps/customer
mkdir -p frontend/shared

# Move existing components to appropriate apps
# Existing admin components → club-admin
# Create new system-admin components
# Create customer portal components
```

#### 3.2 Update GraphQL Queries
```typescript
// Update existing queries for new schema
const GET_CLUB_CUSTOMERS = gql`
  query GetClubCustomers($pagination: PaginationInput, $filter: CustomerFilterInput) {
    customers(pagination: $pagination, filter: $filter) {
      customers {
        id
        firstName
        lastName
        email
        activeSubscription {
          id
          name
          expiresAt
          remainingCredits
        }
      }
      totalCount
    }
  }
`;

// New customer portal queries
const GET_AVAILABLE_PACKAGES = gql`
  query GetAvailablePackages {
    subscriptionPackages(includeInactive: false) {
      id
      name
      description
      price
      discountPrice
      features
      isPopular
    }
  }
`;
```

#### 3.3 Role-Based UI Components
```typescript
// Enhanced role-based component
export const Navigation: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <nav>
      {user.role === 'SYSTEM_ADMIN' && (
        <SystemAdminNav />
      )}
      {user.role === 'CLUB_ADMIN' && (
        <ClubAdminNav />
      )}
      {user.role === 'CLUB_STAFF' && (
        <ClubStaffNav />
      )}
    </nav>
  );
};
```

### Phase 4: Payment Integration (Week 7)

#### 4.1 Stripe Integration
```typescript
// Payment service with Stripe
@Injectable()
export class PaymentService {
  constructor(private stripe: Stripe) {}

  async processPayment(paymentData: PaymentInput): Promise<Payment> {
    // Create Stripe payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: paymentData.amount * 100, // Convert to cents
      currency: paymentData.currency.toLowerCase(),
      customer: await this.getOrCreateStripeCustomer(paymentData.customerId),
      metadata: {
        clubId: paymentData.clubId,
        subscriptionId: paymentData.subscriptionId
      }
    });

    // Save payment record
    return await this.prisma.payment.create({
      data: {
        ...paymentData,
        gatewayProvider: 'stripe',
        gatewayTransactionId: paymentIntent.id,
        status: 'PENDING'
      }
    });
  }
}
```

#### 4.2 Webhook Handling
```typescript
// Stripe webhook handler
@Controller('webhooks')
export class WebhookController {
  @Post('stripe')
  async handleStripeWebhook(@Body() body: any, @Headers() headers: any) {
    const event = this.stripe.webhooks.constructEvent(
      body,
      headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.paymentService.handleSuccessfulPayment(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.paymentService.handleFailedPayment(event.data.object);
        break;
    }
  }
}
```

### Phase 5: Testing & Validation (Week 8)

#### 5.1 Data Integrity Testing
```typescript
// Migration validation tests
describe('Data Migration Validation', () => {
  it('should preserve all customer data', async () => {
    const originalUserCount = await prisma.user.count({ where: { role: 'USER' } });
    const newCustomerCount = await prisma.customer.count();
    expect(newCustomerCount).toBe(originalUserCount);
  });

  it('should maintain subscription relationships', async () => {
    const subscriptions = await prisma.subscription.findMany({
      include: { customer: true, package: true }
    });
    
    for (const sub of subscriptions) {
      expect(sub.customer).toBeDefined();
      expect(sub.package).toBeDefined();
      expect(sub.customer.clubId).toBe(sub.clubId);
    }
  });
});
```

#### 5.2 Integration Testing
```typescript
// End-to-end testing scenarios
describe('Customer Journey', () => {
  it('should complete full subscription purchase flow', async () => {
    // 1. Customer browses packages
    const packages = await request(app)
      .post('/graphql')
      .send({ query: GET_AVAILABLE_PACKAGES });

    // 2. Customer creates subscription
    const subscription = await request(app)
      .post('/graphql')
      .send({ 
        query: CREATE_CUSTOMER_SUBSCRIPTION,
        variables: { packageId, paymentData }
      });

    // 3. Verify QR code generation
    expect(subscription.data.createCustomerSubscription.qrCode).toBeDefined();

    // 4. Test QR code validation
    const validation = await request(app)
      .post('/graphql')
      .send({
        query: VALIDATE_QR_CODE,
        variables: { hash: subscription.data.qrCode.hash }
      });

    expect(validation.data.validateQRCode.isValid).toBe(true);
  });
});
```

### Phase 6: Deployment & Cutover (Week 9)

#### 6.1 Production Migration
```bash
# Production deployment sequence
1. Deploy new backend with migration scripts
2. Run database migrations during maintenance window
3. Deploy frontend applications
4. Update DNS/load balancer configuration
5. Monitor system health and performance
```

#### 6.2 Rollback Plan
```sql
-- Rollback scripts (if needed)
-- Restore original table structure
-- Migrate data back to original format
-- Deploy previous application version
```

## Post-Migration Tasks

### 1. User Training
- System Admin: Platform management training
- Club Admin: New dashboard and features training  
- Club Staff: Updated QR scanning procedures
- Customer: Self-service portal introduction

### 2. Documentation Updates
- Update API documentation
- Create user guides for each role
- Update deployment procedures
- Create troubleshooting guides

### 3. Performance Optimization
- Database query optimization for multi-tenant queries
- Index optimization for tenant-aware operations
- Caching strategy implementation
- Load testing and capacity planning

### 4. Security Audit
- Multi-tenant isolation verification
- Role-based access control testing
- Payment security validation
- Penetration testing

## Timeline Summary

| Phase | Duration | Tasks | Deliverables |
|-------|----------|-------|--------------|
| Phase 1 | Week 1-2 | Database migration | New schema, data migration |
| Phase 2 | Week 3-4 | Backend API updates | Enhanced GraphQL API |
| Phase 3 | Week 5-6 | Frontend restructure | Multi-app frontend |
| Phase 4 | Week 7 | Payment integration | Stripe integration |
| Phase 5 | Week 8 | Testing & validation | Test coverage, bug fixes |
| Phase 6 | Week 9 | Deployment | Production cutover |

## Risk Mitigation

### Data Loss Prevention
- Complete database backups before migration
- Incremental migration with validation steps
- Rollback procedures tested in staging

### Business Continuity
- Phased migration approach
- Minimal downtime deployment strategy
- Parallel system operation during transition

### Performance Impact
- Load testing at each phase
- Database optimization before cutover
- Monitoring and alerting setup

This migration plan ensures a smooth transition from the current system to the new B2B multi-tenant platform while maintaining data integrity and minimizing business disruption.
