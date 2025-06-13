# API Design & GraphQL Schema - B2B QR Check-in Platform

## Overview

This document outlines the GraphQL API design for the multi-tenant QR check-in platform. The API is designed with role-based access control, tenant isolation, and scalability in mind.

## GraphQL Schema Design Principles

1. **Multi-Tenant Architecture**: All queries/mutations include tenant context
2. **Role-Based Access**: Different resolvers for different user roles
3. **Type Safety**: Strongly typed schema with comprehensive validation
4. **Performance**: Optimized for real-time operations and batch processing
5. **Security**: Input validation, rate limiting, and audit logging

## Core Types

### 1. Enums

```graphql
enum UserRole {
  SYSTEM_ADMIN
  CLUB_ADMIN
  CLUB_STAFF
}

enum CustomerStatus {
  ACTIVE
  INACTIVE
  BANNED
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  SUSPENDED
  REFUNDED
}

enum PackageType {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
  EVENT_SPECIFIC
  CREDITS
}

enum CheckinType {
  CHECK_IN
  CHECK_OUT
  AUTO_CHECKOUT
  MANUAL_CHECKOUT
  CANCELLED
}

enum CheckinMethod {
  QR_SCAN
  MANUAL_ENTRY
  RFID
  BIOMETRIC
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
  REFUNDED
  PARTIALLY_REFUNDED
}

enum PaymentMethod {
  CREDIT_CARD
  BANK_TRANSFER
  E_WALLET
  CASH
  COMP
}

enum EventStatus {
  SCHEDULED
  ACTIVE
  COMPLETED
  CANCELLED
}
```

### 2. Core Business Types

```graphql
type Club {
  id: ID!
  name: String!
  slug: String!
  domain: String
  logoUrl: String
  contactEmail: String!
  contactPhone: String
  address: String
  
  # Business Settings
  timezone: String!
  currency: String!
  businessHours: JSON
  
  # Platform Settings
  subscriptionPlan: String!
  features: [String!]!
  settings: JSON!
  
  # Status
  isActive: Boolean!
  trialEndsAt: DateTime
  suspendedAt: DateTime
  
  # Relations
  users: [User!]!
  customers: [Customer!]!
  packages: [SubscriptionPackage!]!
  events: [Event!]!
  
  # Computed Fields
  totalCustomers: Int!
  activeSubscriptions: Int!
  monthlyRevenue: Float!
  
  # Audit
  createdAt: DateTime!
  updatedAt: DateTime!
  createdBy: User
}

type User {
  id: ID!
  email: String!
  username: String
  role: UserRole!
  clubId: ID
  
  # Profile
  firstName: String
  lastName: String
  fullName: String # Computed
  phone: String
  avatarUrl: String
  
  # Settings
  language: String!
  timezone: String
  notificationPreferences: JSON!
  
  # Security
  emailVerifiedAt: DateTime
  twoFactorEnabled: Boolean!
  lastLoginAt: DateTime
  lastLoginIp: String
  
  # Status
  isActive: Boolean!
  lockedAt: DateTime
  
  # Relations
  club: Club
  createdCustomers: [Customer!]!
  processedCheckins: [CheckinLog!]!
  
  # Audit
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Customer {
  id: ID!
  clubId: ID!
  
  # Identity
  email: String!
  phone: String
  firstName: String!
  lastName: String!
  fullName: String! # Computed
  dateOfBirth: Date
  gender: String
  
  # Contact
  address: String
  city: String
  state: String
  postalCode: String
  country: String!
  
  # Preferences
  language: String!
  marketingConsent: Boolean!
  smsConsent: Boolean!
  
  # Verification
  emailVerifiedAt: DateTime
  phoneVerifiedAt: DateTime
  
  # Status
  isActive: Boolean!
  bannedAt: DateTime
  banReason: String
  
  # Relations
  club: Club!
  subscriptions: [Subscription!]!
  qrCodes: [QRCode!]!
  checkinLogs: [CheckinLog!]!
  payments: [Payment!]!
  
  # Computed Fields
  activeSubscription: Subscription
  totalSpent: Float!
  totalVisits: Int!
  lastVisit: DateTime
  
  # Audit
  createdAt: DateTime!
  updatedAt: DateTime!
  createdBy: User
}

type SubscriptionPackage {
  id: ID!
  clubId: ID!
  
  # Package Details
  name: String!
  description: String
  type: PackageType!
  
  # Pricing
  price: Float!
  discountPrice: Float
  currency: String!
  
  # Duration and Limits
  durationDays: Int!
  maxCheckins: Int
  credits: Int
  
  # Features and Rules
  features: [String!]!
  rules: JSON!
  
  # Marketing
  isPopular: Boolean!
  displayOrder: Int!
  imageUrl: String
  
  # Availability
  isActive: Boolean!
  availableFrom: DateTime
  availableUntil: DateTime
  maxPurchasesPerCustomer: Int
  
  # Relations
  club: Club!
  subscriptions: [Subscription!]!
  
  # Computed Fields
  totalSubscriptions: Int!
  activeSubscriptions: Int!
  revenue: Float!
  
  # Audit
  createdAt: DateTime!
  updatedAt: DateTime!
  createdBy: User!
}

type Subscription {
  id: ID!
  clubId: ID!
  customerId: ID!
  packageId: ID!
  
  # Subscription Details
  name: String!
  type: PackageType!
  status: SubscriptionStatus!
  
  # Timing
  startsAt: DateTime!
  expiresAt: DateTime!
  activatedAt: DateTime
  cancelledAt: DateTime
  
  # Pricing (Snapshot)
  originalPrice: Float!
  paidPrice: Float!
  currency: String!
  
  # Usage Tracking
  maxCheckins: Int
  usedCheckins: Int!
  credits: Int
  usedCredits: Int!
  
  # Features (Snapshot)
  features: [String!]!
  rules: JSON!
  
  # Cancellation
  cancellationReason: String
  refundAmount: Float
  refundProcessedAt: DateTime
  
  # Relations
  club: Club!
  customer: Customer!
  package: SubscriptionPackage!
  qrCodes: [QRCode!]!
  checkinLogs: [CheckinLog!]!
  payments: [Payment!]!
  
  # Computed Fields
  isExpired: Boolean!
  isExpiringSoon: Boolean! # Within 7 days
  remainingDays: Int!
  remainingCheckins: Int
  remainingCredits: Int
  usagePercentage: Float!
  
  # Audit
  createdAt: DateTime!
  updatedAt: DateTime!
  createdBy: User
  cancelledBy: User
}

type QRCode {
  id: ID!
  clubId: ID!
  customerId: ID!
  subscriptionId: ID!
  
  # QR Code Data (Sensitive - limited access)
  hash: String! # Public identifier
  # code: String! # Hidden from GraphQL for security
  
  # Metadata
  generatedAt: DateTime!
  expiresAt: DateTime
  lastUsedAt: DateTime
  usageCount: Int!
  
  # Security
  isActive: Boolean!
  revokedAt: DateTime
  revokeReason: String
  
  # QR Image
  imageUrl: String!
  imageFormat: String!
  
  # Relations
  club: Club!
  customer: Customer!
  subscription: Subscription!
  checkinLogs: [CheckinLog!]!
  
  # Audit
  createdAt: DateTime!
  updatedAt: DateTime!
  createdBy: User
}

type CheckinLog {
  id: ID!
  clubId: ID!
  customerId: ID!
  subscriptionId: ID!
  qrCodeId: ID
  eventId: ID
  
  # Check-in Details
  type: CheckinType!
  method: CheckinMethod!
  timestamp: DateTime!
  
  # Location and Context
  location: String
  deviceId: String
  
  # Validation
  isValid: Boolean!
  validationNotes: String
  creditsUsed: Int!
  
  # Pairing (for check-out tracking)
  pairedCheckinId: ID
  durationMinutes: Int
  
  # Metadata
  metadata: JSON!
  ipAddress: String
  userAgent: String
  
  # Relations
  club: Club!
  customer: Customer!
  subscription: Subscription!
  qrCode: QRCode
  event: Event
  staff: User
  pairedCheckin: CheckinLog
  
  # Audit
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Event {
  id: ID!
  clubId: ID!
  
  # Event Details
  name: String!
  description: String
  type: String
  category: String
  
  # Scheduling
  startsAt: DateTime!
  endsAt: DateTime!
  timezone: String!
  
  # Capacity
  maxCapacity: Int
  currentAttendance: Int!
  waitlistEnabled: Boolean!
  
  # Location
  location: String
  room: String
  equipmentNeeded: [String!]!
  
  # Instructor
  instructorId: ID
  instructorName: String
  
  # Requirements
  requiredPackageTypes: [PackageType!]!
  minCreditsRequired: Int
  
  # Settings
  checkinOpensHours: Int!
  checkinClosesMinutes: Int!
  autoCheckoutMinutes: Int!
  
  # Status
  status: EventStatus!
  cancelledReason: String
  
  # Relations
  club: Club!
  instructor: User
  checkinLogs: [CheckinLog!]!
  
  # Computed Fields
  isCheckinOpen: Boolean!
  availableSpots: Int!
  attendees: [Customer!]!
  
  # Audit
  createdAt: DateTime!
  updatedAt: DateTime!
  createdBy: User!
}

type Payment {
  id: ID!
  clubId: ID!
  customerId: ID!
  subscriptionId: ID
  
  # Payment Details
  amount: Float!
  currency: String!
  method: PaymentMethod!
  status: PaymentStatus!
  
  # External Gateway
  gatewayProvider: String
  gatewayTransactionId: String
  gatewayResponse: JSON
  
  # Processing
  processedAt: DateTime
  failedAt: DateTime
  failureReason: String
  
  # Refunds
  refundedAmount: Float!
  refundedAt: DateTime
  refundReason: String
  
  # Metadata
  description: String
  receiptUrl: String
  invoiceNumber: String
  
  # Relations
  club: Club!
  customer: Customer!
  subscription: Subscription
  
  # Audit
  createdAt: DateTime!
  updatedAt: DateTime!
  createdBy: User
}
```

### 3. Input Types

```graphql
input ClubInput {
  name: String!
  slug: String!
  domain: String
  logoUrl: String
  contactEmail: String!
  contactPhone: String
  address: String
  timezone: String
  currency: String
  businessHours: JSON
  subscriptionPlan: String
  features: [String!]
  settings: JSON
}

input CustomerInput {
  email: String!
  phone: String
  firstName: String!
  lastName: String!
  dateOfBirth: Date
  gender: String
  address: String
  city: String
  state: String
  postalCode: String
  country: String
  language: String
  marketingConsent: Boolean
  smsConsent: Boolean
}

input SubscriptionPackageInput {
  name: String!
  description: String
  type: PackageType!
  price: Float!
  discountPrice: Float
  currency: String
  durationDays: Int!
  maxCheckins: Int
  credits: Int
  features: [String!]
  rules: JSON
  isPopular: Boolean
  displayOrder: Int
  imageUrl: String
  availableFrom: DateTime
  availableUntil: DateTime
  maxPurchasesPerCustomer: Int
}

input EventInput {
  name: String!
  description: String
  type: String
  category: String
  startsAt: DateTime!
  endsAt: DateTime!
  timezone: String
  maxCapacity: Int
  waitlistEnabled: Boolean
  location: String
  room: String
  equipmentNeeded: [String!]
  instructorId: ID
  instructorName: String
  requiredPackageTypes: [PackageType!]
  minCreditsRequired: Int
  checkinOpensHours: Int
  checkinClosesMinutes: Int
  autoCheckoutMinutes: Int
}

input CheckinInput {
  qrHash: String!
  type: CheckinType!
  method: CheckinMethod!
  location: String
  deviceId: String
  eventId: ID
  metadata: JSON
}

input PaymentInput {
  customerId: ID!
  subscriptionId: ID
  amount: Float!
  currency: String!
  method: PaymentMethod!
  gatewayProvider: String
  description: String
}
```

### 4. Filter and Pagination Types

```graphql
input PaginationInput {
  offset: Int = 0
  limit: Int = 20
}

input DateRangeInput {
  from: DateTime!
  to: DateTime!
}

input CustomerFilterInput {
  search: String # Search in name, email, phone
  isActive: Boolean
  hasActiveSubscription: Boolean
  createdAfter: DateTime
  createdBefore: DateTime
}

input SubscriptionFilterInput {
  status: SubscriptionStatus
  type: PackageType
  expiresAfter: DateTime
  expiresBefore: DateTime
  customerId: ID
  packageId: ID
}

input CheckinLogFilterInput {
  type: CheckinType
  method: CheckinMethod
  customerId: ID
  eventId: ID
  dateRange: DateRangeInput
  location: String
}

type PaginatedCustomers {
  customers: [Customer!]!
  totalCount: Int!
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}

type PaginatedSubscriptions {
  subscriptions: [Subscription!]!
  totalCount: Int!
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}

type PaginatedCheckinLogs {
  checkinLogs: [CheckinLog!]!
  totalCount: Int!
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
```

## Query Definitions

### 1. System Admin Queries

```graphql
type Query {
  # Platform Management
  clubs(
    pagination: PaginationInput
    isActive: Boolean
    subscriptionPlan: String
  ): [Club!]! @auth(role: SYSTEM_ADMIN)
  
  club(id: ID!): Club @auth(role: SYSTEM_ADMIN)
  
  platformStats: PlatformStats! @auth(role: SYSTEM_ADMIN)
  
  # User Management
  systemUsers(
    pagination: PaginationInput
    role: UserRole
    clubId: ID
  ): [User!]! @auth(role: SYSTEM_ADMIN)
  
  # Financial Overview
  platformRevenue(
    dateRange: DateRangeInput!
    groupBy: RevenueGroupBy = MONTH
  ): [RevenueData!]! @auth(role: SYSTEM_ADMIN)
}

type PlatformStats {
  totalClubs: Int!
  activeClubs: Int!
  totalCustomers: Int!
  totalRevenue: Float!
  monthlyRecurringRevenue: Float!
  averageRevenuePerClub: Float!
  topPerformingClubs: [Club!]!
}

type RevenueData {
  period: String!
  revenue: Float!
  commissions: Float!
  transactions: Int!
}
```

### 2. Club Admin Queries

```graphql
extend type Query {
  # Club Management
  myClub: Club! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  # Customer Management
  customers(
    pagination: PaginationInput
    filter: CustomerFilterInput
  ): PaginatedCustomers! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  customer(id: ID!): Customer @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  # Subscription Management
  subscriptions(
    pagination: PaginationInput
    filter: SubscriptionFilterInput
  ): PaginatedSubscriptions! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  subscription(id: ID!): Subscription @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  # Package Management
  subscriptionPackages(
    includeInactive: Boolean = false
  ): [SubscriptionPackage!]! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  subscriptionPackage(id: ID!): SubscriptionPackage @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  # Event Management
  events(
    pagination: PaginationInput
    status: EventStatus
    dateRange: DateRangeInput
  ): [Event!]! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  event(id: ID!): Event @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  # Check-in Management
  checkinLogs(
    pagination: PaginationInput
    filter: CheckinLogFilterInput
  ): PaginatedCheckinLogs! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  # Analytics
  clubAnalytics(
    dateRange: DateRangeInput!
  ): ClubAnalytics! @auth(role: [CLUB_ADMIN])
  
  # Real-time Data
  currentOccupancy: Int! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  todayStats: DailyStats! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
}

type ClubAnalytics {
  revenue: RevenueAnalytics!
  customers: CustomerAnalytics!
  usage: UsageAnalytics!
  packages: PackageAnalytics!
}

type RevenueAnalytics {
  total: Float!
  byPeriod: [PeriodRevenue!]!
  byPackage: [PackageRevenue!]!
  growth: Float! # Percentage
}

type CustomerAnalytics {
  total: Int!
  newCustomers: Int!
  activeCustomers: Int!
  retentionRate: Float!
  churnRate: Float!
}

type UsageAnalytics {
  totalCheckins: Int!
  averageVisitsPerCustomer: Float!
  peakHours: [HourlyUsage!]!
  facilityUtilization: Float!
}

type PackageAnalytics {
  totalPackages: Int!
  popularPackages: [PackagePerformance!]!
  conversionRates: [PackageConversion!]!
}

type DailyStats {
  checkins: Int!
  checkouts: Int!
  currentOccupancy: Int!
  revenue: Float!
  newCustomers: Int!
  newSubscriptions: Int!
}
```

### 3. QR Code Validation Query

```graphql
extend type Query {
  # QR Code Validation (Real-time)
  validateQRCode(
    hash: String!
    location: String
  ): QRValidationResult! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
}

type QRValidationResult {
  isValid: Boolean!
  reason: String
  customer: Customer
  subscription: Subscription
  warnings: [String!]!
  allowedActions: [CheckinType!]!
}
```

## Mutation Definitions

### 1. System Admin Mutations

```graphql
type Mutation {
  # Club Management
  createClub(input: ClubInput!): Club! @auth(role: SYSTEM_ADMIN)
  
  updateClub(id: ID!, input: ClubInput!): Club! @auth(role: SYSTEM_ADMIN)
  
  suspendClub(id: ID!, reason: String!): Club! @auth(role: SYSTEM_ADMIN)
  
  reactivateClub(id: ID!): Club! @auth(role: SYSTEM_ADMIN)
  
  # User Management
  createSystemUser(
    email: String!
    password: String!
    role: UserRole!
    clubId: ID
    profile: UserProfileInput
  ): User! @auth(role: SYSTEM_ADMIN)
  
  updateUserRole(
    userId: ID!
    role: UserRole!
    clubId: ID
  ): User! @auth(role: SYSTEM_ADMIN)
}
```

### 2. Club Admin Mutations

```graphql
extend type Mutation {
  # Club Settings
  updateClubSettings(
    settings: JSON!
  ): Club! @auth(role: CLUB_ADMIN)
  
  # Staff Management
  createStaffUser(
    email: String!
    password: String!
    profile: UserProfileInput!
    permissions: [String!]
  ): User! @auth(role: CLUB_ADMIN)
  
  updateStaffUser(
    userId: ID!
    profile: UserProfileInput
    permissions: [String!]
  ): User! @auth(role: CLUB_ADMIN)
  
  deactivateStaffUser(userId: ID!): User! @auth(role: CLUB_ADMIN)
  
  # Customer Management
  createCustomer(input: CustomerInput!): Customer! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  updateCustomer(id: ID!, input: CustomerInput!): Customer! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  banCustomer(id: ID!, reason: String!): Customer! @auth(role: CLUB_ADMIN)
  
  unbanCustomer(id: ID!): Customer! @auth(role: CLUB_ADMIN)
  
  # Package Management
  createSubscriptionPackage(
    input: SubscriptionPackageInput!
  ): SubscriptionPackage! @auth(role: CLUB_ADMIN)
  
  updateSubscriptionPackage(
    id: ID!
    input: SubscriptionPackageInput!
  ): SubscriptionPackage! @auth(role: CLUB_ADMIN)
  
  togglePackageStatus(id: ID!): SubscriptionPackage! @auth(role: CLUB_ADMIN)
  
  deleteSubscriptionPackage(id: ID!): Boolean! @auth(role: CLUB_ADMIN)
  
  # Subscription Management
  createCustomerSubscription(
    customerId: ID!
    packageId: ID!
    paymentMethod: PaymentMethod!
    gatewayData: JSON
  ): SubscriptionResult! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  cancelSubscription(
    id: ID!
    reason: String!
    refundAmount: Float
  ): Subscription! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  suspendSubscription(
    id: ID!
    reason: String!
    duration: Int # Days
  ): Subscription! @auth(role: CLUB_ADMIN)
  
  reactivateSubscription(id: ID!): Subscription! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  # Event Management
  createEvent(input: EventInput!): Event! @auth(role: CLUB_ADMIN)
  
  updateEvent(id: ID!, input: EventInput!): Event! @auth(role: CLUB_ADMIN)
  
  cancelEvent(id: ID!, reason: String!): Event! @auth(role: CLUB_ADMIN)
}

type SubscriptionResult {
  subscription: Subscription!
  payment: Payment!
  qrCode: QRCode!
}
```

### 3. Check-in/Check-out Mutations

```graphql
extend type Mutation {
  # QR Code Operations
  processQRScan(input: CheckinInput!): CheckinResult! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  manualCheckin(
    customerId: ID!
    location: String
    eventId: ID
    notes: String
  ): CheckinResult! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  manualCheckout(
    customerId: ID!
    location: String
    notes: String
  ): CheckinResult! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  # QR Code Management
  regenerateQRCode(subscriptionId: ID!): QRCode! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  revokeQRCode(
    id: ID!
    reason: String!
  ): QRCode! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
}

type CheckinResult {
  success: Boolean!
  message: String!
  checkinLog: CheckinLog
  customer: Customer
  subscription: Subscription
  warnings: [String!]!
}
```

### 4. Payment Mutations

```graphql
extend type Mutation {
  # Payment Processing
  processPayment(input: PaymentInput!): PaymentResult! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  refundPayment(
    paymentId: ID!
    amount: Float!
    reason: String!
  ): Payment! @auth(role: CLUB_ADMIN)
  
  # Webhook Handling (Internal)
  handlePaymentWebhook(
    provider: String!
    data: JSON!
  ): Boolean! @internal
}

type PaymentResult {
  success: Boolean!
  payment: Payment
  error: String
  redirectUrl: String # For 3D Secure, etc.
}
```

## Subscription (Real-time)

```graphql
type Subscription {
  # Real-time occupancy updates
  occupancyUpdated(clubId: ID!): Int! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  # Check-in notifications
  checkinProcessed(clubId: ID!): CheckinNotification! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  # Customer updates
  customerUpdated(customerId: ID!): Customer! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  # Subscription status changes
  subscriptionStatusChanged(customerId: ID!): Subscription! @auth(role: [CLUB_ADMIN, CLUB_STAFF])
  
  # Payment notifications
  paymentProcessed(clubId: ID!): PaymentNotification! @auth(role: CLUB_ADMIN)
}

type CheckinNotification {
  checkinLog: CheckinLog!
  customer: Customer!
  action: CheckinType!
  location: String
}

type PaymentNotification {
  payment: Payment!
  customer: Customer!
  subscription: Subscription
  status: PaymentStatus!
}
```

## Custom Directives

```graphql
# Authentication and Authorization
directive @auth(role: [UserRole!]) on FIELD_DEFINITION | OBJECT

# Rate Limiting
directive @rateLimit(max: Int!, window: Int!) on FIELD_DEFINITION

# Tenant Isolation
directive @tenant on FIELD_DEFINITION

# Caching
directive @cache(ttl: Int!) on FIELD_DEFINITION

# Deprecation
directive @deprecated(reason: String!) on FIELD_DEFINITION | ENUM_VALUE

# Internal use only
directive @internal on FIELD_DEFINITION
```

## Error Handling

```graphql
interface Error {
  message: String!
  code: String!
}

type ValidationError implements Error {
  message: String!
  code: String!
  field: String!
  value: String
}

type AuthenticationError implements Error {
  message: String!
  code: String!
}

type AuthorizationError implements Error {
  message: String!
  code: String!
  requiredRole: UserRole
}

type NotFoundError implements Error {
  message: String!
  code: String!
  resource: String!
  id: ID!
}

type BusinessLogicError implements Error {
  message: String!
  code: String!
  context: JSON
}

union MutationResult = 
  | SubscriptionResult 
  | CheckinResult 
  | PaymentResult 
  | ValidationError 
  | BusinessLogicError
```

This comprehensive GraphQL schema provides a robust foundation for the multi-tenant B2B QR check-in platform, ensuring type safety, performance, and security while maintaining flexibility for future enhancements.
