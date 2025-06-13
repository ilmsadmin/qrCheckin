import { Resolver, Mutation, Query, Args, Int } from '@nestjs/graphql';
import { CheckinService } from './checkin.service';
import { CheckinLog } from '../common/dto/checkin-log.dto';

@Resolver()
export class CheckinResolver {
  constructor(private checkinService: CheckinService) {}

  @Mutation(() => CheckinLog)
  async checkin(
    @Args('qrCodeId') qrCodeId: string,
    @Args('eventId') eventId: string,
  ): Promise<CheckinLog> {
    return this.checkinService.checkin(qrCodeId, eventId);
  }

  @Mutation(() => CheckinLog)
  async checkout(
    @Args('qrCodeId') qrCodeId: string,
    @Args('eventId') eventId: string,
  ): Promise<CheckinLog> {
    return this.checkinService.checkout(qrCodeId, eventId);
  }

  @Query(() => [CheckinLog])
  async checkinLogs(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('customerId', { nullable: true }) customerId?: string,
    @Args('eventId', { nullable: true }) eventId?: string,
    @Args('clubId', { nullable: true }) clubId?: string,
  ): Promise<CheckinLog[]> {
    return this.checkinService.getCheckinLogs(customerId, eventId, clubId, limit, offset);
  }
}