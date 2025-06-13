import { Module } from '@nestjs/common';
import { UserMapper } from './user.mapper';
import { SubscriptionMapper } from './subscription.mapper';
import { CheckinLogMapper } from './checkin-log.mapper';

@Module({
  providers: [UserMapper, SubscriptionMapper, CheckinLogMapper],
  exports: [UserMapper, SubscriptionMapper, CheckinLogMapper],
})
export class MappersModule {}
