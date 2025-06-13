import { Module } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CheckinResolver } from './checkin.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { MappersModule } from '../common/mappers/mappers.module';

@Module({
  imports: [MappersModule],
  providers: [CheckinService, CheckinResolver, PrismaService],
})
export class CheckinModule {}