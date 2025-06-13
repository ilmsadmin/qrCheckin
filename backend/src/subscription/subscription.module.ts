import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionResolver } from './subscription.resolver';
import { SubscriptionPackageService } from './subscription-package.service';
import { SubscriptionPackageResolver } from './subscription-package.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { MappersModule } from '../common/mappers/mappers.module';

@Module({
  imports: [MappersModule],
  providers: [
    SubscriptionService, 
    SubscriptionResolver, 
    SubscriptionPackageService,
    SubscriptionPackageResolver,
    PrismaService,
  ],
})
export class SubscriptionModule {}