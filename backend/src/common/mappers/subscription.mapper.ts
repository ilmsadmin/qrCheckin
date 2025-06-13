import { Injectable } from '@nestjs/common';
import { Subscription } from '../dto/subscription.dto';
import { SubscriptionType } from '../enums';
import { UserMapper } from './user.mapper';

@Injectable()
export class SubscriptionMapper {
  constructor(private userMapper: UserMapper) {}

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
    };

    // Add relations if they exist
    if (prismaSubscription.user) {
      subscription.user = this.userMapper.mapPrismaUserToDto(prismaSubscription.user);
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
