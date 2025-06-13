import { Module } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CheckinResolver } from './checkin.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { CheckinLogMapper } from '../common/mappers/checkin-log.mapper';
import { UserMapper } from '../common/mappers/user.mapper';

@Module({
  providers: [CheckinService, CheckinResolver, PrismaService, CheckinLogMapper, UserMapper],
})
export class CheckinModule {}