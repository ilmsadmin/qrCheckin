import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { UserMapper } from '../common/mappers/user.mapper';
import { CheckinLogMapper } from '../common/mappers/checkin-log.mapper';
import { CheckinService } from '../checkin/checkin.service';

@Module({
  providers: [UsersService, UsersResolver, PrismaService, UserMapper, CheckinLogMapper, CheckinService],
  exports: [UsersService, UserMapper],
})
export class UsersModule {}