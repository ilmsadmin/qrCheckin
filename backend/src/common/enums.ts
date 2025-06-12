import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  USER = 'USER',
}

export enum SubscriptionType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  EVENT_SPECIFIC = 'EVENT_SPECIFIC',
}

export enum CheckinType {
  CHECKIN = 'CHECKIN',
  CHECKOUT = 'CHECKOUT',
}

// Register enums with GraphQL
registerEnumType(Role, { name: 'Role' });
registerEnumType(SubscriptionType, { name: 'SubscriptionType' });
registerEnumType(CheckinType, { name: 'CheckinType' });