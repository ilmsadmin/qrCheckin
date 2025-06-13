# Database Design - Multi-Tenant B2B Platform

## Overview

The QR Check-in system uses a multi-tenant architecture where each club operates as an isolated tenant. The database is designed to ensure complete data separation between clubs while maintaining efficient queries and scalability.

## Core Design Principles

1. **Tenant Isolation**: Every customer-related table includes `clubId` for data separation
2. **Performance**: Optimized indexes and query patterns for multi-tenant scenarios
3. **Scalability**: Designed for horizontal scaling with proper partitioning
4. **Security**: Row-level security policies for automatic tenant filtering
5. **Audit Trail**: Comprehensive logging for all business operations

## Entity Definitions

### 1. Club (Tenant)

**Purpose**: Represents each client organization that subscribes to our QR service

```sql
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly identifier
  domain VARCHAR(255), -- Custom domain if provided
  logo_url TEXT,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  address TEXT,
  
  -- Business Settings
  timezone VARCHAR(50) DEFAULT 'UTC',
  currency VARCHAR(3) DEFAULT 'VND',
  business_hours JSONB, -- Operating hours config
  
  -- Platform Settings
  subscription_plan VARCHAR(50) NOT NULL DEFAULT 'BASIC', -- BASIC, PREMIUM, ENTERPRISE
  features JSONB DEFAULT '[]'::jsonb, -- Enabled features array
  settings JSONB DEFAULT '{}'::jsonb, -- Club-specific configurations
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  trial_ends_at TIMESTAMP,
  suspended_at TIMESTAMP,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_clubs_slug ON clubs(slug);
CREATE INDEX idx_clubs_active ON clubs(is_active) WHERE is_active = true;
CREATE INDEX idx_clubs_plan ON clubs(subscription_plan);
```

### 2. Users (System & Club Users)

**Purpose**: All system users including our staff, club admins, and club staff

```sql
CREATE TYPE user_role AS ENUM (
  'SYSTEM_ADMIN',    -- Our platform administrators
  'CLUB_ADMIN',      -- Club owners/managers
  'CLUB_STAFF'       -- Club employees
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  
  -- Role and Permissions
  role user_role NOT NULL,
  club_id UUID REFERENCES clubs(id), -- NULL for SYSTEM_ADMIN
  permissions JSONB DEFAULT '[]'::jsonb, -- Custom permissions array
  
  -- Profile Information
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  avatar_url TEXT,
  
  -- Settings
  language VARCHAR(10) DEFAULT 'vi',
  timezone VARCHAR(50),
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Security
  email_verified_at TIMESTAMP,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255),
  last_login_at TIMESTAMP,
  last_login_ip INET,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  locked_at TIMESTAMP,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_club_role ON users(club_id, role) WHERE club_id IS NOT NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Constraints
ALTER TABLE users ADD CONSTRAINT check_club_user_has_club 
  CHECK (role = 'SYSTEM_ADMIN' OR club_id IS NOT NULL);
```

### 3. Customers (End Users)

**Purpose**: People who purchase subscription packages from clubs

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id),
  
  -- Identity
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10), -- MALE, FEMALE, OTHER
  
  -- Contact Information
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Vietnam',
  
  -- Preferences
  language VARCHAR(10) DEFAULT 'vi',
  marketing_consent BOOLEAN DEFAULT false,
  sms_consent BOOLEAN DEFAULT false,
  
  -- Verification
  email_verified_at TIMESTAMP,
  phone_verified_at TIMESTAMP,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  banned_at TIMESTAMP,
  ban_reason TEXT,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id), -- Staff member who created
  
  -- Constraints
  CONSTRAINT unique_customer_email_per_club UNIQUE(club_id, email),
  CONSTRAINT unique_customer_phone_per_club UNIQUE(club_id, phone)
);

-- Indexes
CREATE INDEX idx_customers_club ON customers(club_id);
CREATE INDEX idx_customers_email ON customers(club_id, email);
CREATE INDEX idx_customers_phone ON customers(club_id, phone);
CREATE INDEX idx_customers_active ON customers(club_id, is_active) WHERE is_active = true;
CREATE INDEX idx_customers_created ON customers(club_id, created_at);

-- Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_club_isolation ON customers
  USING (club_id = current_setting('app.current_club_id')::UUID);
```

### 4. Subscription Packages

**Purpose**: Predefined service packages that clubs offer to customers

```sql
CREATE TYPE package_type AS ENUM (
  'DAILY',           -- Day passes
  'WEEKLY',          -- Weekly memberships
  'MONTHLY',         -- Monthly memberships
  'YEARLY',          -- Annual memberships
  'EVENT_SPECIFIC',  -- Event-based access
  'CREDITS'          -- Credit-based system
);

CREATE TABLE subscription_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id),
  
  -- Package Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type package_type NOT NULL,
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'VND',
  
  -- Duration and Limits
  duration_days INTEGER NOT NULL, -- Package validity in days
  max_checkins INTEGER, -- NULL for unlimited
  credits INTEGER, -- For credit-based packages
  
  -- Features and Rules
  features JSONB DEFAULT '[]'::jsonb, -- Array of feature descriptions
  rules JSONB DEFAULT '{}'::jsonb, -- Usage rules and restrictions
  
  -- Marketing
  is_popular BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  image_url TEXT,
  
  -- Availability
  is_active BOOLEAN DEFAULT true,
  available_from TIMESTAMP,
  available_until TIMESTAMP,
  max_purchases_per_customer INTEGER, -- Purchase limits
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_packages_club ON subscription_packages(club_id);
CREATE INDEX idx_packages_active ON subscription_packages(club_id, is_active) WHERE is_active = true;
CREATE INDEX idx_packages_type ON subscription_packages(club_id, type);
CREATE INDEX idx_packages_popular ON subscription_packages(club_id, is_popular) WHERE is_popular = true;
CREATE INDEX idx_packages_display_order ON subscription_packages(club_id, display_order);

-- Row Level Security
ALTER TABLE subscription_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY package_club_isolation ON subscription_packages
  USING (club_id = current_setting('app.current_club_id')::UUID);
```

### 5. Customer Subscriptions

**Purpose**: Individual customer subscriptions based on purchased packages

```sql
CREATE TYPE subscription_status AS ENUM (
  'ACTIVE',          -- Currently active
  'EXPIRED',         -- Naturally expired
  'CANCELLED',       -- Cancelled by customer/staff
  'SUSPENDED',       -- Temporarily suspended
  'REFUNDED'         -- Refunded and cancelled
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  package_id UUID NOT NULL REFERENCES subscription_packages(id),
  
  -- Subscription Details
  name VARCHAR(255) NOT NULL, -- Copy from package at time of purchase
  type package_type NOT NULL, -- Copy from package
  status subscription_status DEFAULT 'ACTIVE',
  
  -- Timing
  starts_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  activated_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- Pricing (Snapshot at purchase time)
  original_price DECIMAL(10,2) NOT NULL,
  paid_price DECIMAL(10,2) NOT NULL, -- After discounts
  currency VARCHAR(3) NOT NULL,
  
  -- Usage Tracking
  max_checkins INTEGER, -- NULL for unlimited
  used_checkins INTEGER DEFAULT 0,
  credits INTEGER, -- For credit-based subscriptions
  used_credits INTEGER DEFAULT 0,
  
  -- Features and Rules (Snapshot)
  features JSONB DEFAULT '[]'::jsonb,
  rules JSONB DEFAULT '{}'::jsonb,
  
  -- Cancellation
  cancellation_reason TEXT,
  refund_amount DECIMAL(10,2),
  refund_processed_at TIMESTAMP,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id), -- Staff who created
  cancelled_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_subscriptions_club ON subscriptions(club_id);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_package ON subscriptions(package_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(club_id, status);
CREATE INDEX idx_subscriptions_active ON subscriptions(club_id, customer_id, status) 
  WHERE status = 'ACTIVE';
CREATE INDEX idx_subscriptions_expires ON subscriptions(club_id, expires_at) 
  WHERE status = 'ACTIVE';

-- Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscription_club_isolation ON subscriptions
  USING (club_id = current_setting('app.current_club_id')::UUID);
```

### 6. QR Codes

**Purpose**: Unique QR codes generated for each active subscription

```sql
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  
  -- QR Code Data
  code TEXT NOT NULL UNIQUE, -- The actual QR code content (encrypted)
  hash VARCHAR(255) NOT NULL UNIQUE, -- SHA-256 hash for quick lookup
  
  -- Metadata
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- Individual QR expiry (different from subscription)
  last_used_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  
  -- Security
  is_active BOOLEAN DEFAULT true,
  revoked_at TIMESTAMP,
  revoke_reason TEXT,
  
  -- QR Image
  image_url TEXT, -- Generated QR code image
  image_format VARCHAR(10) DEFAULT 'PNG',
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_qr_codes_club ON qr_codes(club_id);
CREATE INDEX idx_qr_codes_customer ON qr_codes(customer_id);
CREATE INDEX idx_qr_codes_subscription ON qr_codes(subscription_id);
CREATE INDEX idx_qr_codes_hash ON qr_codes(hash);
CREATE INDEX idx_qr_codes_active ON qr_codes(club_id, is_active) WHERE is_active = true;
CREATE INDEX idx_qr_codes_expires ON qr_codes(expires_at) WHERE expires_at IS NOT NULL;

-- Row Level Security
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY qr_code_club_isolation ON qr_codes
  USING (club_id = current_setting('app.current_club_id')::UUID);
```

### 7. Events

**Purpose**: Club events or sessions that customers can check into

```sql
CREATE TYPE event_status AS ENUM (
  'SCHEDULED',       -- Future event
  'ACTIVE',          -- Currently happening
  'COMPLETED',       -- Successfully completed
  'CANCELLED'        -- Cancelled event
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id),
  
  -- Event Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100), -- Class type, session type, etc.
  category VARCHAR(100), -- Fitness, Yoga, Swimming, etc.
  
  -- Scheduling
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  timezone VARCHAR(50),
  
  -- Capacity
  max_capacity INTEGER,
  current_attendance INTEGER DEFAULT 0,
  waitlist_enabled BOOLEAN DEFAULT false,
  
  -- Location
  location VARCHAR(255),
  room VARCHAR(100),
  equipment_needed TEXT[],
  
  -- Instructor
  instructor_id UUID REFERENCES users(id),
  instructor_name VARCHAR(255),
  
  -- Requirements
  required_package_types package_type[], -- Which package types can attend
  min_credits_required INTEGER, -- Minimum credits needed
  
  -- Settings
  checkin_opens_hours INTEGER DEFAULT 2, -- How early checkin opens
  checkin_closes_minutes INTEGER DEFAULT 15, -- How late checkin allows
  auto_checkout_minutes INTEGER DEFAULT 30, -- Auto checkout after class
  
  -- Status
  status event_status DEFAULT 'SCHEDULED',
  cancelled_reason TEXT,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_events_club ON events(club_id);
CREATE INDEX idx_events_status ON events(club_id, status);
CREATE INDEX idx_events_schedule ON events(club_id, starts_at);
CREATE INDEX idx_events_active ON events(club_id, starts_at, ends_at) 
  WHERE status = 'ACTIVE';
CREATE INDEX idx_events_instructor ON events(instructor_id) WHERE instructor_id IS NOT NULL;

-- Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY event_club_isolation ON events
  USING (club_id = current_setting('app.current_club_id')::UUID);
```

### 8. Check-in Logs

**Purpose**: Complete audit trail of all customer check-ins and check-outs

```sql
CREATE TYPE checkin_type AS ENUM (
  'CHECK_IN',        -- Customer entering
  'CHECK_OUT',       -- Customer leaving
  'AUTO_CHECKOUT',   -- Automatic checkout
  'MANUAL_CHECKOUT', -- Staff-initiated checkout
  'CANCELLED'        -- Cancelled checkin
);

CREATE TYPE checkin_method AS ENUM (
  'QR_SCAN',         -- QR code scanned
  'MANUAL_ENTRY',    -- Staff manual entry
  'RFID',            -- RFID card (future)
  'BIOMETRIC'        -- Fingerprint/face (future)
);

CREATE TABLE checkin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  qr_code_id UUID REFERENCES qr_codes(id),
  event_id UUID REFERENCES events(id), -- NULL for general facility access
  
  -- Check-in Details
  type checkin_type NOT NULL,
  method checkin_method NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  
  -- Location and Context
  location VARCHAR(255), -- Area/room of checkin
  device_id VARCHAR(255), -- Scanner device ID
  staff_id UUID REFERENCES users(id), -- Staff who processed
  
  -- Validation
  is_valid BOOLEAN DEFAULT true,
  validation_notes TEXT,
  credits_used INTEGER DEFAULT 0, -- Credits deducted
  
  -- Pairing (for check-out tracking)
  paired_checkin_id UUID REFERENCES checkin_logs(id), -- For checkout records
  duration_minutes INTEGER, -- Calculated stay duration
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional context data
  ip_address INET,
  user_agent TEXT,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_checkin_logs_club ON checkin_logs(club_id);
CREATE INDEX idx_checkin_logs_customer ON checkin_logs(customer_id);
CREATE INDEX idx_checkin_logs_subscription ON checkin_logs(subscription_id);
CREATE INDEX idx_checkin_logs_event ON checkin_logs(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX idx_checkin_logs_timestamp ON checkin_logs(club_id, timestamp);
CREATE INDEX idx_checkin_logs_staff ON checkin_logs(staff_id) WHERE staff_id IS NOT NULL;
CREATE INDEX idx_checkin_logs_type ON checkin_logs(club_id, type, timestamp);

-- Row Level Security
ALTER TABLE checkin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY checkin_log_club_isolation ON checkin_logs
  USING (club_id = current_setting('app.current_club_id')::UUID);
```

### 9. Payments and Invoices

**Purpose**: Financial tracking for customer purchases and club billing

```sql
CREATE TYPE payment_status AS ENUM (
  'PENDING',         -- Payment initiated
  'PROCESSING',      -- Being processed
  'COMPLETED',       -- Successfully paid
  'FAILED',          -- Payment failed
  'CANCELLED',       -- Payment cancelled
  'REFUNDED',        -- Payment refunded
  'PARTIALLY_REFUNDED' -- Partial refund
);

CREATE TYPE payment_method AS ENUM (
  'CREDIT_CARD',     -- Credit/debit card
  'BANK_TRANSFER',   -- Bank transfer
  'E_WALLET',        -- MoMo, ZaloPay, etc.
  'CASH',            -- Cash payment
  'COMP'             -- Complimentary (free)
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  subscription_id UUID REFERENCES subscriptions(id),
  
  -- Payment Details
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'VND',
  method payment_method NOT NULL,
  status payment_status DEFAULT 'PENDING',
  
  -- External Payment Gateway
  gateway_provider VARCHAR(50), -- stripe, momo, zalopay
  gateway_transaction_id VARCHAR(255),
  gateway_response JSONB,
  
  -- Processing
  processed_at TIMESTAMP,
  failed_at TIMESTAMP,
  failure_reason TEXT,
  
  -- Refunds
  refunded_amount DECIMAL(10,2) DEFAULT 0,
  refunded_at TIMESTAMP,
  refund_reason TEXT,
  
  -- Metadata
  description TEXT,
  receipt_url TEXT,
  invoice_number VARCHAR(100),
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id) -- Staff who processed cash payments
);

-- Indexes
CREATE INDEX idx_payments_club ON payments(club_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_subscription ON payments(subscription_id) WHERE subscription_id IS NOT NULL;
CREATE INDEX idx_payments_status ON payments(club_id, status);
CREATE INDEX idx_payments_gateway ON payments(gateway_provider, gateway_transaction_id) 
  WHERE gateway_transaction_id IS NOT NULL;
CREATE INDEX idx_payments_created ON payments(club_id, created_at);

-- Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payment_club_isolation ON payments
  USING (club_id = current_setting('app.current_club_id')::UUID);
```

## Database Functions and Triggers

### 1. Automatic Subscription Status Updates

```sql
-- Function to update subscription status based on expiry
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if subscription has expired
  IF NEW.expires_at <= NOW() AND NEW.status = 'ACTIVE' THEN
    NEW.status = 'EXPIRED';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update status
CREATE TRIGGER trigger_subscription_status_update
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_status();
```

### 2. Credit Usage Tracking

```sql
-- Function to update used credits on checkin
CREATE OR REPLACE FUNCTION update_subscription_credits()
RETURNS TRIGGER AS $$
DECLARE
  subscription_record subscriptions%ROWTYPE;
BEGIN
  -- Only process if it's a new CHECK_IN with credits used
  IF TG_OP = 'INSERT' AND NEW.type = 'CHECK_IN' AND NEW.credits_used > 0 THEN
    -- Get subscription details
    SELECT * INTO subscription_record 
    FROM subscriptions 
    WHERE id = NEW.subscription_id;
    
    -- Update used credits and checkins
    UPDATE subscriptions 
    SET 
      used_credits = COALESCE(used_credits, 0) + NEW.credits_used,
      used_checkins = COALESCE(used_checkins, 0) + 1,
      updated_at = NOW()
    WHERE id = NEW.subscription_id;
    
    -- Check if subscription should be suspended due to no credits
    IF subscription_record.credits IS NOT NULL THEN
      UPDATE subscriptions 
      SET status = 'EXPIRED'
      WHERE id = NEW.subscription_id 
        AND (used_credits + NEW.credits_used) >= credits
        AND status = 'ACTIVE';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for credit tracking
CREATE TRIGGER trigger_update_subscription_credits
  AFTER INSERT ON checkin_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_credits();
```

### 3. QR Code Validation

```sql
-- Function to validate QR code before checkin
CREATE OR REPLACE FUNCTION validate_qr_checkin(
  p_qr_hash VARCHAR(255),
  p_club_id UUID
) RETURNS JSONB AS $$
DECLARE
  qr_record qr_codes%ROWTYPE;
  subscription_record subscriptions%ROWTYPE;
  customer_record customers%ROWTYPE;
  result JSONB;
BEGIN
  -- Find QR code
  SELECT * INTO qr_record 
  FROM qr_codes 
  WHERE hash = p_qr_hash AND club_id = p_club_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'QR code not found or inactive');
  END IF;
  
  -- Check QR expiry
  IF qr_record.expires_at IS NOT NULL AND qr_record.expires_at <= NOW() THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'QR code expired');
  END IF;
  
  -- Get subscription
  SELECT * INTO subscription_record 
  FROM subscriptions 
  WHERE id = qr_record.subscription_id;
  
  -- Check subscription status
  IF subscription_record.status != 'ACTIVE' THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Subscription not active');
  END IF;
  
  -- Check subscription expiry
  IF subscription_record.expires_at <= NOW() THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Subscription expired');
  END IF;
  
  -- Check checkin limits
  IF subscription_record.max_checkins IS NOT NULL 
     AND subscription_record.used_checkins >= subscription_record.max_checkins THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Checkin limit reached');
  END IF;
  
  -- Check credit limits
  IF subscription_record.credits IS NOT NULL 
     AND subscription_record.used_credits >= subscription_record.credits THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'No credits remaining');
  END IF;
  
  -- Get customer details
  SELECT * INTO customer_record 
  FROM customers 
  WHERE id = qr_record.customer_id;
  
  -- Check customer status
  IF NOT customer_record.is_active THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Customer account inactive');
  END IF;
  
  -- Return success with customer and subscription info
  RETURN jsonb_build_object(
    'valid', true,
    'customer', jsonb_build_object(
      'id', customer_record.id,
      'name', customer_record.first_name || ' ' || customer_record.last_name,
      'email', customer_record.email
    ),
    'subscription', jsonb_build_object(
      'id', subscription_record.id,
      'name', subscription_record.name,
      'type', subscription_record.type,
      'expires_at', subscription_record.expires_at,
      'remaining_checkins', CASE 
        WHEN subscription_record.max_checkins IS NULL THEN NULL
        ELSE subscription_record.max_checkins - subscription_record.used_checkins
      END,
      'remaining_credits', CASE 
        WHEN subscription_record.credits IS NULL THEN NULL
        ELSE subscription_record.credits - subscription_record.used_credits
      END
    )
  );
END;
$$ LANGUAGE plpgsql;
```

## Data Migration and Seeding

### 1. Initial Setup Script

```sql
-- Create initial system admin user
INSERT INTO users (email, password_hash, role, first_name, last_name)
VALUES 
  ('admin@qrcheckin.com', '$2b$10$...', 'SYSTEM_ADMIN', 'System', 'Administrator');

-- Create sample club for testing
INSERT INTO clubs (name, slug, contact_email, subscription_plan)
VALUES 
  ('Demo Fitness Club', 'demo-fitness', 'demo@fitness.com', 'PREMIUM');

-- Get the club ID for further inserts
DO $$
DECLARE
  demo_club_id UUID;
  admin_user_id UUID;
BEGIN
  SELECT id INTO demo_club_id FROM clubs WHERE slug = 'demo-fitness';
  SELECT id INTO admin_user_id FROM users WHERE role = 'SYSTEM_ADMIN' LIMIT 1;
  
  -- Create club admin
  INSERT INTO users (email, password_hash, role, club_id, first_name, last_name, created_by)
  VALUES ('admin@fitness.com', '$2b$10$...', 'CLUB_ADMIN', demo_club_id, 'Club', 'Admin', admin_user_id);
  
  -- Create sample packages
  INSERT INTO subscription_packages (club_id, name, type, price, duration_days, max_checkins, created_by)
  VALUES 
    (demo_club_id, 'Day Pass', 'DAILY', 50000, 1, 1, admin_user_id),
    (demo_club_id, 'Weekly Membership', 'WEEKLY', 300000, 7, 10, admin_user_id),
    (demo_club_id, 'Monthly Unlimited', 'MONTHLY', 1000000, 30, NULL, admin_user_id);
END $$;
```

## Performance Considerations

### 1. Indexing Strategy

- **Tenant-aware indexes**: All indexes include `club_id` as the first column
- **Composite indexes**: For common query patterns (club_id + status, club_id + created_at)
- **Partial indexes**: For frequently filtered conditions (active records only)

### 2. Query Optimization

- **Tenant context**: Use `SET app.current_club_id = ?` for automatic row-level security
- **Connection pooling**: Separate pools per tenant for better isolation
- **Read replicas**: For reporting and analytics queries

### 3. Archival Strategy

```sql
-- Archive old checkin logs (older than 2 years)
CREATE TABLE checkin_logs_archive (LIKE checkin_logs);

-- Move old data
INSERT INTO checkin_logs_archive 
SELECT * FROM checkin_logs 
WHERE created_at < NOW() - INTERVAL '2 years';

DELETE FROM checkin_logs 
WHERE created_at < NOW() - INTERVAL '2 years';
```

This database design provides a robust foundation for the multi-tenant B2B QR check-in platform, ensuring data isolation, performance, and scalability while maintaining comprehensive audit trails and business intelligence capabilities.
