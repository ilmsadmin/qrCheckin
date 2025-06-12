import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { CheckinService } from './checkin.service';

@Resolver()
export class CheckinResolver {
  constructor(private checkinService: CheckinService) {}

  @Mutation(() => String)
  async checkin(
    @Args('qrCodeId') qrCodeId: string,
    @Args('eventId') eventId: string,
  ) {
    const result = await this.checkinService.checkin(qrCodeId, eventId);
    return JSON.stringify(result);
  }

  @Mutation(() => String)
  async checkout(
    @Args('qrCodeId') qrCodeId: string,
    @Args('eventId') eventId: string,
  ) {
    const result = await this.checkinService.checkout(qrCodeId, eventId);
    return JSON.stringify(result);
  }

  @Query(() => String)
  async checkinLogs(
    @Args('userId', { nullable: true }) userId?: string,
    @Args('eventId', { nullable: true }) eventId?: string,
  ) {
    const logs = await this.checkinService.getCheckinLogs(userId, eventId);
    return JSON.stringify(logs);
  }
}