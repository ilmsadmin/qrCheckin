import { Resolver, Query, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './customer.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../common/dto/user.dto';

@Resolver(() => Customer)
@UseGuards(JwtAuthGuard)
export class CustomersResolver {
  constructor(private readonly customersService: CustomersService) {}

  @Query(() => String, { description: 'Get all customers as JSON string' })
  async customers(
    @CurrentUser() user: User,
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('status', { type: () => String, nullable: true }) status?: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset?: number,
  ): Promise<string> {
    const customers = await this.customersService.findAll(user.clubId, {
      search,
      status,
      limit,
      offset,
    });
    return JSON.stringify(customers);
  }

  @Query(() => String, { description: 'Get customer details as JSON string' })
  async customer(
    @CurrentUser() user: User,
    @Args('id', { type: () => String }) id: string,
  ): Promise<string> {
    const customer = await this.customersService.findOne(id, user.clubId);
    return JSON.stringify(customer);
  }

  @Query(() => String, { description: 'Get customer statistics as JSON string' })
  async customerStats(
    @CurrentUser() user: User,
  ): Promise<string> {
    const stats = await this.customersService.getStats(user.clubId);
    return JSON.stringify(stats);
  }
}
