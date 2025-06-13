import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CheckinService } from '../checkin/checkin.service';
import { User } from '../common/dto/user.dto';
import { CheckinLog } from '../common/dto/checkin-log.dto';
import { QRCode } from '../common/dto/qrcode.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { Role } from '../common/enums';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly checkinService: CheckinService,
  ) {}

  @Query(() => [User])
  @UseGuards(RolesGuard)
  @Roles(Role.CLUB_ADMIN, Role.CLUB_STAFF)
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User)
  async user(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    // Users can only access their own profile unless they are admin/staff
    if (currentUser.role === Role.CUSTOMER && currentUser.id !== id) {
      throw new Error('Unauthorized to access this user profile');
    }
    return this.usersService.findOne(id);
  }

  @Query(() => User)
  async profile(@CurrentUser() user: User): Promise<User> {
    return this.usersService.findOne(user.id);
  }

  @Mutation(() => QRCode)
  @UseGuards(RolesGuard)
  @Roles(Role.CLUB_ADMIN, Role.CLUB_STAFF)
  async generateUserQRCode(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<QRCode> {
    return this.usersService.generateUserQRCode(userId);
  }

  @Query(() => [CheckinLog])
  @UseGuards(RolesGuard)
  @Roles(Role.CLUB_ADMIN, Role.CLUB_STAFF)
  async userCheckinLogs(
    @Args('userId', { type: () => ID, nullable: true }) userId?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ): Promise<CheckinLog[]> {
    return this.checkinService.getCheckinLogs(userId, undefined, undefined, limit, offset);
  }
}