# Business Logic & Workflows - B2B QR Check-in Platform

## Overview

This document outlines the core business logic, workflows, and processes for the multi-tenant QR check-in platform. The system serves three main stakeholders: our company (platform provider), clubs (our clients), and customers (club members).

## Core Business Flows

### 1. Club Onboarding Process

#### 1.1 Sales & Registration
```
Prospect Inquiry → Sales Demo → Contract Signing → Account Setup
```

**Stakeholders**: Sales Team, System Admin, Club Owner
**Duration**: 1-7 days

**Process Steps**:

1. **Initial Contact**
   - Prospect submits inquiry form
   - Sales team schedules demo
   - System requirements discussed

2. **Proposal & Contract**
   - Custom pricing based on club size/needs
   - Service level agreement (SLA) defined
   - Contract terms negotiated and signed

3. **Account Provisioning**
   - System Admin creates club account
   - Initial configuration and branding setup
   - Test environment provided

**Business Rules**:
- Each club gets isolated tenant environment
- Pricing tiers: Basic, Premium, Enterprise
- Trial period: 14 days with full features
- Setup fee may apply for custom integrations

#### 1.2 Club Configuration
```
Account Creation → Admin Setup → Staff Training → Package Creation → Go Live
```

**Stakeholders**: System Admin, Club Admin, Club Staff
**Duration**: 2-5 days

**Configuration Steps**:

1. **Basic Setup**
   - Club profile and branding
   - Operating hours and timezone
   - Contact information and address
   - Payment gateway configuration

2. **User Management**
   - Club Admin account creation
   - Staff account provisioning
   - Role assignments and permissions
   - Training materials provided

3. **Service Configuration**
   - Create subscription packages
   - Set pricing and features
   - Define facility rules and restrictions
   - QR code generation settings

**Business Rules**:
- Club Admin has full control over their environment
- Staff accounts limited to operational functions
- Maximum users per plan (Basic: 5, Premium: 20, Enterprise: unlimited)
- Package pricing controlled by club

### 2. Customer Lifecycle Management

#### 2.1 Customer Acquisition
```
Discovery → Registration → Package Selection → Payment → Activation
```

**Stakeholders**: Customer, Club Staff, Payment Gateway
**Duration**: 5-30 minutes

**Acquisition Flow**:

1. **Discovery Phase**
   - Customer visits club or browses online
   - Views available packages and pricing
   - Compares features and benefits

2. **Registration**
   - Customer creates account
   - Provides personal information
   - Email/phone verification
   - Agrees to terms and conditions

3. **Package Selection**
   - Browse available packages
   - Select desired package
   - Review pricing and features
   - Add to cart/proceed to payment

4. **Payment Processing**
   - Choose payment method
   - Process payment through gateway
   - Generate receipt and confirmation
   - Trigger subscription activation

**Business Rules**:
- Email verification required for account activation
- One active subscription per customer per club
- Payment must be completed before activation
- Refund policy: 24-48 hours after purchase
- Failed payments: 3 retry attempts before cancellation

#### 2.2 Subscription Management
```
Active Subscription → Usage Tracking → Renewal/Expiry → Lifecycle End
```

**Key Components**:

1. **Usage Tracking**
   - Check-in/check-out logging
   - Credit consumption monitoring
   - Facility access control
   - Real-time usage updates

2. **Subscription Status**
   - **ACTIVE**: Full access to services
   - **EXPIRED**: Natural expiration after term
   - **CANCELLED**: Customer or staff cancellation
   - **SUSPENDED**: Temporary suspension (violations, etc.)
   - **REFUNDED**: Refunded and terminated

3. **Renewal Process**
   - Automatic renewal notifications (7, 3, 1 days before expiry)
   - Manual renewal by customer
   - Grace period: 24-48 hours after expiry
   - Package upgrade/downgrade options

**Business Rules**:
- Check-in limits enforced in real-time
- Credit-based packages: immediate usage deduction
- Unlimited packages: no usage restrictions
- Expired subscriptions: 30-day grace period for data retention
- Cancelled subscriptions: immediate service termination

### 3. Daily Operations Workflow

#### 3.1 Customer Check-in Process
```
QR Code Scan → Validation → Access Grant → Logging → Facility Access
```

**Stakeholders**: Customer, Club Staff, System
**Duration**: 2-10 seconds

**Check-in Flow**:

1. **QR Code Presentation**
   - Customer opens mobile app or shows printed code
   - QR code contains encrypted subscription data
   - Code includes timestamp and security hash

2. **Staff Scanning**
   - Staff uses mobile app to scan QR code
   - System validates code authenticity
   - Real-time subscription verification

3. **Validation Process**
   - Check subscription status (active/expired)
   - Verify check-in limits not exceeded
   - Confirm sufficient credits available
   - Validate facility access permissions

4. **Access Decision**
   - **Grant Access**: Log check-in, update usage counters
   - **Deny Access**: Display reason, suggest solutions
   - **Manual Override**: Staff can override with reason

5. **Usage Logging**
   - Record check-in timestamp and location
   - Update subscription usage counters
   - Generate real-time occupancy data
   - Trigger notifications if needed

**Business Rules**:
- QR codes expire every 60 seconds (security)
- Maximum 1 active check-in per customer
- Staff can manually check-in customers (emergency)
- Failed scans logged for security monitoring
- Occupancy limits enforced at facility level

#### 3.2 Customer Check-out Process
```
QR Code Scan → Check-out Validation → Duration Calculation → Logging
```

**Check-out Flow**:

1. **Optional Check-out**
   - Customer scans QR code when leaving
   - Staff can manually check-out customers
   - Automatic check-out after configured timeout

2. **Duration Tracking**
   - Calculate total facility usage time
   - Update customer usage statistics
   - Generate session completion record

3. **Billing Adjustments**
   - Credit-based: No additional charges
   - Time-based: Calculate overage charges
   - Update subscription balances

**Business Rules**:
- Check-out not mandatory for most packages
- Auto check-out after 8 hours (configurable)
- Overage charges apply for time-based packages
- No refunds for unused time within session

### 4. Package and Pricing Management

#### 4.1 Package Creation Workflow
```
Market Analysis → Package Design → Pricing Strategy → Approval → Launch
```

**Stakeholders**: Club Admin, Club Manager, Customers
**Duration**: 1-3 days for new packages

**Package Development**:

1. **Market Research**
   - Analyze competitor pricing
   - Survey customer preferences
   - Review usage patterns
   - Identify market gaps

2. **Package Design**
   - Define package features and benefits
   - Set usage limits and restrictions
   - Create marketing materials
   - Design pricing structure

3. **Configuration**
   - Input package details into system
   - Set pricing and discount structures
   - Configure access rules and limitations
   - Define promotional periods

4. **Testing & Launch**
   - Internal testing with staff accounts
   - Soft launch with limited customers
   - Monitor usage and feedback
   - Full launch with marketing campaign

**Business Rules**:
- Minimum package duration: 1 day
- Maximum package duration: 365 days
- Pricing changes: 30-day notice to existing customers
- Package discontinuation: Honor existing subscriptions
- Promotional pricing: Limited time offers only

#### 4.2 Dynamic Pricing Strategy
```
Base Pricing → Demand Analysis → Price Adjustment → Customer Communication
```

**Pricing Factors**:

1. **Peak Time Pricing**
   - Higher prices during peak hours (6-9 AM, 6-9 PM)
   - Weekend premium pricing
   - Holiday and special event pricing

2. **Seasonal Adjustments**
   - Summer fitness packages
   - New Year resolution specials
   - Back-to-school promotions

3. **Demand-Based Pricing**
   - Capacity-based pricing tiers
   - Early bird discounts
   - Last-minute availability pricing

**Business Rules**:
- Price changes maximum once per month
- Existing customers: Honored at original price
- New customers: Current pricing applies
- Promotional codes: Club Admin discretion
- Bulk discounts: Family and corporate packages

### 5. Financial Management

#### 5.1 Revenue Tracking
```
Sale Transaction → Revenue Recognition → Commission Calculation → Payout Processing
```

**Revenue Streams**:

1. **Customer Subscriptions**
   - Primary revenue from package sales
   - Automatic recurring billing
   - Upgrade/downgrade revenue adjustments
   - Refund and chargeback handling

2. **Platform Commission Structure**
   - **Basic Plan**: 5% transaction fee
   - **Premium Plan**: 3% transaction fee
   - **Enterprise Plan**: Fixed monthly fee + 1%
   - Additional service fees: Setup, training, support

3. **Payment Processing**
   - Credit card processing fees: 2.9% + 30¢
   - Bank transfer fees: 1% (minimum $5)
   - E-wallet fees: 2.5%
   - Cash payments: No processing fee

**Business Rules**:
- Revenue recognized at service delivery
- Commission deducted from gross revenue
- Monthly invoicing for platform fees
- Payment terms: Net 15 for clubs
- Chargebacks: Club responsibility

#### 5.2 Billing and Invoicing
```
Service Usage → Invoice Generation → Payment Processing → Collection Management
```

**Billing Cycles**:

1. **Customer Billing**
   - Prepaid model: Pay before service
   - Automatic renewal: 3 days before expiry
   - Failed payment handling: Grace period + retry
   - Invoice delivery: Email + SMS notification

2. **Club Billing**
   - Monthly platform fee billing
   - Commission-based transaction fees
   - Usage-based pricing for additional services
   - Annual contracts: Discount opportunities

**Collection Process**:
1. **Payment Due**: Automatic payment attempt
2. **Day 1 Overdue**: Email reminder sent
3. **Day 7 Overdue**: Service suspension warning
4. **Day 15 Overdue**: Service suspension
5. **Day 30 Overdue**: Account termination proceedings

### 6. Customer Support Workflows

#### 6.1 Issue Resolution Process
```
Issue Report → Triage → Investigation → Resolution → Follow-up
```

**Support Channels**:

1. **Customer Support**
   - In-app help desk
   - Email support
   - Live chat during business hours
   - Phone support for urgent issues

2. **Club Support**
   - Dedicated account manager
   - Technical support hotline
   - Training and onboarding assistance
   - Regular check-in calls

**Issue Categories**:

1. **Technical Issues**
   - QR code scanning problems
   - App crashes or bugs
   - Payment processing errors
   - System downtime

2. **Account Issues**
   - Login problems
   - Subscription questions
   - Billing inquiries
   - Account modifications

3. **Policy Issues**
   - Refund requests
   - Package changes
   - Access disputes
   - Terms and conditions questions

**SLA Commitments**:
- **Urgent Issues**: 2 hours response time
- **High Priority**: 4 hours response time
- **Normal Issues**: 24 hours response time
- **Low Priority**: 72 hours response time

#### 6.2 Dispute Resolution
```
Dispute Filed → Investigation → Evidence Review → Decision → Implementation
```

**Common Disputes**:

1. **Billing Disputes**
   - Incorrect charges
   - Double billing
   - Unauthorized transactions
   - Refund requests

2. **Service Disputes**
   - Access denial issues
   - Equipment problems
   - Staff behavior complaints
   - Facility condition issues

**Resolution Process**:

1. **Initial Response** (24 hours)
   - Acknowledge dispute receipt
   - Gather preliminary information
   - Assign case manager

2. **Investigation** (3-5 business days)
   - Review transaction history
   - Check system logs
   - Interview relevant parties
   - Gather supporting evidence

3. **Resolution** (1-2 business days)
   - Make final decision
   - Communicate resolution to all parties
   - Process refunds or adjustments
   - Document case for future reference

### 7. Analytics and Reporting

#### 7.1 Real-time Dashboards
```
Data Collection → Processing → Visualization → Decision Making
```

**System Admin Dashboard**:
- Platform-wide usage statistics
- Revenue and commission tracking
- Club performance metrics
- System health monitoring

**Club Admin Dashboard**:
- Daily/weekly/monthly revenue
- Customer acquisition and retention
- Facility utilization rates
- Popular package performance

**Staff Dashboard**:
- Current facility occupancy
- Today's check-ins/check-outs
- Customer lookup tools
- Issue reporting interface

#### 7.2 Business Intelligence
```
Data Aggregation → Analysis → Insights → Recommendations
```

**Key Metrics**:

1. **Financial KPIs**
   - Monthly Recurring Revenue (MRR)
   - Customer Lifetime Value (CLV)
   - Average Revenue Per User (ARPU)
   - Churn rate and retention

2. **Operational KPIs**
   - Facility utilization rates
   - Peak hour analysis
   - Equipment usage patterns
   - Staff efficiency metrics

3. **Customer KPIs**
   - Acquisition cost (CAC)
   - Satisfaction scores
   - Usage frequency
   - Package conversion rates

**Reporting Schedule**:
- **Daily**: Operational reports
- **Weekly**: Performance summaries
- **Monthly**: Financial statements
- **Quarterly**: Strategic reviews

This comprehensive business logic framework ensures smooth operations across all aspects of the B2B QR check-in platform, from customer acquisition to ongoing service delivery and support.
