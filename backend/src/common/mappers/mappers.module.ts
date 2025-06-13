import { Module } from '@nestjs/common';
import { UserMapper } from './user.mapper';
import { SubscriptionMapper } from './subscription.mapper';
import { CustomerMapper } from './customer.mapper';

@Module({
  providers: [UserMapper, SubscriptionMapper, CustomerMapper],
  exports: [UserMapper, SubscriptionMapper, CustomerMapper],
})
export class MappersModule {}
