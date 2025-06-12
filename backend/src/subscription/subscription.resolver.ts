import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { SubscriptionService } from './subscription.service';

@Resolver()
export class SubscriptionResolver {
  constructor(private subscriptionService: SubscriptionService) {}

  @Mutation(() => String)
  async createSubscription(
    @Args('userId') userId: string,
    @Args('clubId') clubId: string,
    @Args('name') name: string,
    @Args('type') type: string,
    @Args('price') price: number,
    @Args('duration') duration: number,
  ) {
    const result = await this.subscriptionService.createSubscription({
      userId,
      clubId,
      name,
      type,
      price,
      duration,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
    });
    return JSON.stringify(result);
  }

  @Query(() => String)
  async userSubscriptions(@Args('userId') userId: string) {
    const subscriptions = await this.subscriptionService.getUserSubscriptions(userId);
    return JSON.stringify(subscriptions);
  }

  @Query(() => String)
  async subscription(@Args('id') id: string) {
    const subscription = await this.subscriptionService.getSubscriptionById(id);
    return JSON.stringify(subscription);
  }

  @Mutation(() => String)
  async generateQRCode(
    @Args('subscriptionId') subscriptionId: string,
    @Args('userId') userId: string,
  ) {
    const qrCode = await this.subscriptionService.generateQRCode(subscriptionId, userId);
    return JSON.stringify(qrCode);
  }
}