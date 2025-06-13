import { Injectable } from '@nestjs/common';
import { Subscription } from '../dto/subscription.dto';
import { SubscriptionType } from '../enums';
import { CustomerMapper } from './customer.mapper';

@Injectable()
export class SubscriptionMapper {
  constructor(private customerMapper: CustomerMapper) {}

  mapPrismaSubscriptionToDto(
    prismaSubscription: any
  ): Subscription {
    const subscription: Partial<Subscription> = {
      id: prismaSubscription.id,
      name: prismaSubscription.name,
      type: prismaSubscription.type as unknown as SubscriptionType,
      price: prismaSubscription.price,
      duration: prismaSubscription.duration,
      maxCheckins: prismaSubscription.maxCheckins || undefined,
      isActive: prismaSubscription.isActive,
      startDate: prismaSubscription.startDate,
      endDate: prismaSubscription.endDate,
      createdAt: prismaSubscription.createdAt,
      updatedAt: prismaSubscription.updatedAt,
      clubId: prismaSubscription.clubId,
      customerId: prismaSubscription.customerId,
    };

    // Add relations if they exist
    if (prismaSubscription.customer) {
      subscription.customer = this.customerMapper.mapPrismaCustomerToDto(prismaSubscription.customer);
    }

    if (prismaSubscription.club) {
      subscription.club = prismaSubscription.club;
    }

    if (prismaSubscription.package) {
      subscription.package = prismaSubscription.package;
    }

    return subscription as Subscription;
  }
}
