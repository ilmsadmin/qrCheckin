import { Module } from '@nestjs/common';
import { UserMapper } from './user.mapper';
import { SubscriptionMapper } from './subscription.mapper';

@Module({
  providers: [UserMapper, SubscriptionMapper],
  exports: [UserMapper, SubscriptionMapper],
})
export class MappersModule {}
