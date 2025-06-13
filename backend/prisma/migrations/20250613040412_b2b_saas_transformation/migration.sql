/*
  B2B SaaS Transformation Migration
  
  This migration transforms the system from single-tenant to multi-tenant B2B SaaS.
  It preserves existing data by:
  1. Converting existing users to customers
  2. Setting up clubs with proper B2B configuration
  3. Migrating all relationships to the new structure
*/

-- Step 1: Create new enums first
CREATE TYPE "ClubPlanType" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE');
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');
CREATE TYPE "ClubSubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'PAUSED');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELED', 'PAUSED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELED');
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH', 'OTHER');
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELED');

-- Step 2: Add new columns to clubs table with temporary nullable constraints
ALTER TABLE "clubs" 
ADD COLUMN "address" TEXT,
ADD COLUMN "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN "businessType" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
ADD COLUMN "contactEmail" TEXT,
ADD COLUMN "contactPhone" TEXT,
ADD COLUMN "country" TEXT,
ADD COLUMN "logo" TEXT,
ADD COLUMN "maxCustomers" INTEGER,
ADD COLUMN "maxEvents" INTEGER,
ADD COLUMN "maxStaff" INTEGER,
ADD COLUMN "planPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "planType" "ClubPlanType" NOT NULL DEFAULT 'STARTER',
ADD COLUMN "postalCode" TEXT,
ADD COLUMN "primaryColor" TEXT,
ADD COLUMN "secondaryColor" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "stripeCustomerId" TEXT,
ADD COLUMN "stripeSubscriptionId" TEXT,
ADD COLUMN "subdomain" TEXT,
ADD COLUMN "subscriptionEndsAt" TIMESTAMP(3),
ADD COLUMN "subscriptionStatus" "ClubSubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
ADD COLUMN "taxId" TEXT,
ADD COLUMN "trialEndsAt" TIMESTAMP(3);

-- Step 3: Set default values for existing clubs
UPDATE "clubs" SET 
  "contactEmail" = 'admin@' || lower(replace(name, ' ', '')) || '.com',
  "subdomain" = lower(replace(name, ' ', '-')) || '-' || substr(id, 1, 8),
  "trialEndsAt" = CURRENT_TIMESTAMP + INTERVAL '30 days'
WHERE "contactEmail" IS NULL;

-- Step 4: Make contactEmail and subdomain required
ALTER TABLE "clubs" ALTER COLUMN "contactEmail" SET NOT NULL;
ALTER TABLE "clubs" ALTER COLUMN "subdomain" SET NOT NULL;

-- Step 5: Create customers table
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clubId" TEXT NOT NULL,
    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- Step 6: Convert existing users with role 'USER' to customers
-- First, get the first club ID to assign customers to
DO $$
DECLARE
    first_club_id TEXT;
BEGIN
    SELECT id INTO first_club_id FROM "clubs" LIMIT 1;
    
    -- Insert existing USER role users as customers
    INSERT INTO "customers" (
        "id", "email", "firstName", "lastName", "phone", 
        "isActive", "createdAt", "updatedAt", "clubId"
    )
    SELECT 
        "id", "email", "firstName", "lastName", NULL as "phone",
        "isActive", "createdAt", "updatedAt", first_club_id
    FROM "users" 
    WHERE "role" = 'USER';
END $$;

-- Step 7: Update users table for new role system
-- Add clubId column to users
ALTER TABLE "users" ADD COLUMN "clubId" TEXT;

-- Assign existing ADMIN/STAFF users to the first club
DO $$
DECLARE
    first_club_id TEXT;
BEGIN
    SELECT id INTO first_club_id FROM "clubs" LIMIT 1;
    
    UPDATE "users" SET "clubId" = first_club_id 
    WHERE "role" IN ('ADMIN', 'STAFF');
END $$;

-- Step 8: Update Role enum (migrate existing roles)
-- Create new Role enum
CREATE TYPE "Role_new" AS ENUM ('SYSTEM_ADMIN', 'CLUB_ADMIN', 'CLUB_STAFF', 'CUSTOMER');

-- Convert existing roles
UPDATE "users" SET "role" = CASE 
    WHEN "role" = 'ADMIN' THEN 'CLUB_ADMIN'::text
    WHEN "role" = 'STAFF' THEN 'CLUB_STAFF'::text  
    WHEN "role" = 'USER' THEN 'CUSTOMER'::text
    ELSE 'CLUB_STAFF'::text
END;

-- Replace the enum
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CLUB_STAFF';

-- Step 9: Delete USER role users from users table (they're now customers)
DELETE FROM "users" WHERE "role" = 'CUSTOMER';

-- Step 10: Add new columns to other tables
ALTER TABLE "events" 
ADD COLUMN "allowWalkIns" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "coverImage" TEXT,
ADD COLUMN "currentCapacity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "gallery" TEXT[],
ADD COLUMN "requiresSubscription" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "walkInPrice" DOUBLE PRECISION;

ALTER TABLE "subscription_packages" 
ADD COLUMN "color" TEXT,
ADD COLUMN "image" TEXT,
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "refundPolicy" TEXT,
ADD COLUMN "terms" TEXT;

-- Step 11: Transform subscriptions table
-- Add new columns first
ALTER TABLE "subscriptions" 
ADD COLUMN "customerId" TEXT,
ADD COLUMN "finalPrice" DOUBLE PRECISION,
ADD COLUMN "originalPrice" DOUBLE PRECISION,
ADD COLUMN "paymentMethod" TEXT,
ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "stripePaymentIntentId" TEXT,
ADD COLUMN "usedCheckins" INTEGER NOT NULL DEFAULT 0;

-- Migrate subscription data
UPDATE "subscriptions" SET 
    "customerId" = "userId",
    "originalPrice" = "price",
    "finalPrice" = "price"
WHERE "customerId" IS NULL;

-- Drop old columns
ALTER TABLE "subscriptions" 
DROP COLUMN "price",
DROP COLUMN "userId";

-- Make required columns non-null
ALTER TABLE "subscriptions" 
ALTER COLUMN "customerId" SET NOT NULL,
ALTER COLUMN "finalPrice" SET NOT NULL,
ALTER COLUMN "originalPrice" SET NOT NULL;

-- Step 12: Transform qr_codes table
-- Add new columns
ALTER TABLE "qr_codes" 
ADD COLUMN "clubId" TEXT,
ADD COLUMN "customerId" TEXT,
ADD COLUMN "lastUsedAt" TIMESTAMP(3),
ADD COLUMN "usageCount" INTEGER NOT NULL DEFAULT 0;

-- Migrate qr_codes data
UPDATE "qr_codes" SET 
    "customerId" = "userId",
    "clubId" = (SELECT "clubId" FROM "subscriptions" WHERE "subscriptions"."id" = "qr_codes"."subscriptionId" LIMIT 1)
WHERE "customerId" IS NULL;

-- Drop old column
ALTER TABLE "qr_codes" DROP COLUMN "userId";

-- Make required columns non-null
ALTER TABLE "qr_codes" 
ALTER COLUMN "clubId" SET NOT NULL,
ALTER COLUMN "customerId" SET NOT NULL;

-- Step 13: Transform checkin_logs table
-- Add new columns
ALTER TABLE "checkin_logs" 
ADD COLUMN "clubId" TEXT,
ADD COLUMN "customerId" TEXT,
ADD COLUMN "errorMessage" TEXT,
ADD COLUMN "isValid" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "processedBy" TEXT;

-- Migrate checkin_logs data
UPDATE "checkin_logs" SET 
    "customerId" = "userId",
    "clubId" = (SELECT "clubId" FROM "subscriptions" WHERE "subscriptions"."id" = "checkin_logs"."subscriptionId" LIMIT 1)
WHERE "customerId" IS NULL;

-- Drop old column
ALTER TABLE "checkin_logs" DROP COLUMN "userId";

-- Make required columns non-null
ALTER TABLE "checkin_logs" 
ALTER COLUMN "clubId" SET NOT NULL,
ALTER COLUMN "customerId" SET NOT NULL;

-- Step 14: Create new tables for payments and payouts
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "transactionFee" DOUBLE PRECISION,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "refundAmount" DOUBLE PRECISION,
    "refundReason" TEXT,
    "refundedAt" TIMESTAMP(3),
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clubId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "totalRevenue" DOUBLE PRECISION NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "stripeTransferId" TEXT,
    "bankAccount" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "clubId" TEXT NOT NULL,
    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- Step 15: Create indexes and constraints
CREATE UNIQUE INDEX "customers_email_clubId_key" ON "customers"("email", "clubId");
CREATE UNIQUE INDEX "clubs_subdomain_key" ON "clubs"("subdomain");

-- Step 16: Add foreign key constraints
ALTER TABLE "users" ADD CONSTRAINT "users_clubId_fkey" 
    FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "customers" ADD CONSTRAINT "customers_clubId_fkey" 
    FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_clubId_fkey" 
    FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "checkin_logs" ADD CONSTRAINT "checkin_logs_processedBy_fkey" 
    FOREIGN KEY ("processedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "checkin_logs" ADD CONSTRAINT "checkin_logs_clubId_fkey" 
    FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "checkin_logs" ADD CONSTRAINT "checkin_logs_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_clubId_fkey" 
    FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" 
    FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payouts" ADD CONSTRAINT "payouts_clubId_fkey" 
    FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ADD COLUMN     "gallery" TEXT[],
ADD COLUMN     "requiresSubscription" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "walkInPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "qr_codes" DROP COLUMN "userId",
ADD COLUMN     "clubId" TEXT NOT NULL,
ADD COLUMN     "customerId" TEXT NOT NULL,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "subscription_packages" ADD COLUMN     "color" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refundPolicy" TEXT,
ADD COLUMN     "terms" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "price",
DROP COLUMN "userId",
ADD COLUMN     "customerId" TEXT NOT NULL,
ADD COLUMN     "finalPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "originalPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "usedCheckins" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "clubId" TEXT,
ALTER COLUMN "role" SET DEFAULT 'CLUB_STAFF';

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clubId" TEXT NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "transactionFee" DOUBLE PRECISION,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "refundAmount" DOUBLE PRECISION,
    "refundReason" TEXT,
    "refundedAt" TIMESTAMP(3),
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clubId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "subscriptionId" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "totalRevenue" DOUBLE PRECISION NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "stripeTransferId" TEXT,
    "bankAccount" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "clubId" TEXT NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_clubId_key" ON "customers"("email", "clubId");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_subdomain_key" ON "clubs"("subdomain");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin_logs" ADD CONSTRAINT "checkin_logs_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin_logs" ADD CONSTRAINT "checkin_logs_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin_logs" ADD CONSTRAINT "checkin_logs_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
