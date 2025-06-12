import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionResolver } from './subscription.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [SubscriptionService, SubscriptionResolver, PrismaService],
})
export class SubscriptionModule {}