import { Module } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ClubsResolver } from './clubs.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ClubsResolver, ClubsService, PrismaService],
  exports: [ClubsService],
})
export class ClubsModule {}