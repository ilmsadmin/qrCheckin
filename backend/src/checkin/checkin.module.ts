import { Module } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CheckinResolver } from './checkin.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [CheckinService, CheckinResolver, PrismaService],
})
export class CheckinModule {}