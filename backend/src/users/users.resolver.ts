import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../common/dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { Role } from '../common/enums';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User)
  async user(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    // Users can only access their own profile unless they are admin/staff
    if (currentUser.role === Role.USER && currentUser.id !== id) {
      throw new Error('Unauthorized to access this user profile');
    }
    return this.usersService.findOne(id);
  }

  @Query(() => User)
  async profile(@CurrentUser() user: User): Promise<User> {
    return this.usersService.findOne(user.id);
  }
}