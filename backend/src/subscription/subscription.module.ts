import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionResolver } from './subscription.resolver';
import { SubscriptionPackageService } from './subscription-package.service';
import { SubscriptionPackageResolver } from './subscription-package.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { UserMapper } from '../common/mappers/user.mapper';
import { SubscriptionMapper } from '../common/mappers/subscription.mapper';

@Module({
  providers: [
    SubscriptionService, 
    SubscriptionResolver, 
    SubscriptionPackageService,
    SubscriptionPackageResolver,
    PrismaService,
    UserMapper,
    SubscriptionMapper
  ],
})
export class SubscriptionModule {}