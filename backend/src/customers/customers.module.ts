import { Module } from '@nestjs/common';
import { CustomersResolver } from './customers.resolver';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [CustomersResolver, CustomersService, PrismaService],
  exports: [CustomersService],
})
export class CustomersModule {}
