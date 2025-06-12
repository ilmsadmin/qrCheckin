import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { UserMapper } from '../common/mappers/user.mapper';

@Module({
  providers: [UsersService, UsersResolver, PrismaService, UserMapper],
  exports: [UsersService, UserMapper],
})
export class UsersModule {}