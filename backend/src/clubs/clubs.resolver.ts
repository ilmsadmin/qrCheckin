import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { Club } from '../common/dto/club.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums';

@Resolver(() => Club)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClubsResolver {
  constructor(private readonly clubsService: ClubsService) {}

  @Query(() => [Club])
  async clubs(): Promise<Club[]> {
    return this.clubsService.findAll();
  }

  @Query(() => Club)
  async club(@Args('id', { type: () => ID }) id: string): Promise<Club> {
    return this.clubsService.findOne(id);
  }

  @Mutation(() => Club)
  @Roles(Role.ADMIN)
  async createClub(
    @Args('name') name: string,
    @Args('description', { nullable: true }) description?: string,
  ): Promise<Club> {
    return this.clubsService.create({ name, description });
  }

  @Mutation(() => Club)
  @Roles(Role.ADMIN)
  async updateClub(
    @Args('id', { type: () => ID }) id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('isActive', { nullable: true }) isActive?: boolean,
  ): Promise<Club> {
    return this.clubsService.update(id, { name, description, isActive });
  }

  @Mutation(() => Club)
  @Roles(Role.ADMIN)
  async removeClub(@Args('id', { type: () => ID }) id: string): Promise<Club> {
    return this.clubsService.remove(id);
  }
}