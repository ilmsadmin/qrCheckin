import { Resolver, Mutation, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Subscription } from '../common/dto/subscription.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../common/dto/user.dto';
import { Role, SubscriptionType } from '../common/enums';

@Resolver(() => Subscription)
@UseGuards(JwtAuthGuard)
export class SubscriptionResolver {
  constructor(private subscriptionService: SubscriptionService) {}

  @Mutation(() => Subscription)
  async createSubscription(
    @Args('clubId', { type: () => ID }) clubId: string,
    @Args('name') name: string,
    @Args('type', { type: () => String }) type: SubscriptionType,
    @Args('price') price: number,
    @Args('duration') duration: number,
    @Args('packageId', { type: () => ID, nullable: true }) packageId: string,
    @CurrentUser() user: User,
  ): Promise<Subscription> {
    return this.subscriptionService.createSubscription({
      userId: user.id,
      clubId,
      name,
      type,
      price,
      duration,
      packageId,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
    });
  }

  @Query(() => String)
  async userSubscriptions(
    @Args('userId', { type: () => ID, nullable: true }) userId: string,
    @CurrentUser() currentUser: User,
  ): Promise<string> {
    // If no userId provided, return current user's subscriptions
    const targetUserId = userId || currentUser.id;
    
    // Only allow customers to see their own subscriptions unless they are admin/staff
    if (currentUser.role === Role.CUSTOMER && currentUser.id !== targetUserId) {
      throw new Error('Unauthorized to access subscriptions');
    }
    
    const subscriptions = await this.subscriptionService.getCustomerSubscriptions(targetUserId);
    return JSON.stringify(subscriptions);
  }

  @Query(() => Subscription)
  async subscription(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionService.getSubscriptionById(id);
    
    // Only allow customers to see their own subscriptions unless they are admin/staff
    if (currentUser.role === Role.CUSTOMER && currentUser.id !== subscription.customer.id) {
      throw new Error('Unauthorized to access this subscription');
    }
    
    return subscription;
  }

  @Mutation(() => String)
  async createSubscriptionFromPackage(
    @Args('packageId', { type: () => ID }) packageId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() currentUser: User,
  ): Promise<string> {
    // Only allow customers to create subscriptions for themselves unless they are admin/staff
    if (currentUser.role === Role.CUSTOMER && currentUser.id !== userId) {
      throw new Error('Unauthorized to create subscription for this user');
    }

    const subscription = await this.subscriptionService.createSubscription({
      userId,
      packageId,
      startDate: new Date(),
    });
    
    return JSON.stringify(subscription);
  }

  @Mutation(() => String)
  async cancelSubscription(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<string> {
    const subscription = await this.subscriptionService.getSubscriptionById(id);
    
    // Only allow users to cancel their own subscriptions unless they are admin/staff
    if (currentUser.role === Role.CUSTOMER && currentUser.id !== subscription.customer.id) {
      throw new Error('Unauthorized to cancel this subscription');
    }
    
    const result = await this.subscriptionService.cancelSubscription(id);
    return JSON.stringify(result);
  }

  @Mutation(() => String)
  async reactivateSubscription(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<string> {
    const subscription = await this.subscriptionService.getSubscriptionById(id);
    
    // Only allow customers to reactivate their own subscriptions unless they are admin/staff
    if (currentUser.role === Role.CUSTOMER && currentUser.id !== subscription.customer.id) {
      throw new Error('Unauthorized to reactivate this subscription');
    }
    
    const result = await this.subscriptionService.reactivateSubscription(id);
    return JSON.stringify(result);
  }

  @Mutation(() => String)
  async generateQRCode(
    @Args('subscriptionId', { type: () => ID }) subscriptionId: string,
    @CurrentUser() currentUser: User,
  ): Promise<string> {
    const subscription = await this.subscriptionService.getSubscriptionById(subscriptionId);
    
    // Only allow customers to generate QR codes for their own subscriptions unless they are admin/staff
    if (currentUser.role === Role.CUSTOMER && currentUser.id !== subscription.customer.id) {
      throw new Error('Unauthorized to generate QR code for this subscription');
    }
    
    const qrCode = await this.subscriptionService.generateQRCode(subscriptionId, subscription.customer.id, subscription.clubId);
    return JSON.stringify(qrCode);
  }
}