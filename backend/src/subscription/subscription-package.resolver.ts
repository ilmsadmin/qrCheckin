import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { SubscriptionPackageService, CreatePackageDto, UpdatePackageDto } from './subscription-package.service';

@Resolver()
export class SubscriptionPackageResolver {
  constructor(private subscriptionPackageService: SubscriptionPackageService) {}

  @Mutation(() => String)
  async createSubscriptionPackage(
    @Args('name') name: string,
    @Args('clubId') clubId: string,
    @Args('type') type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'EVENT_SPECIFIC',
    @Args('price') price: number,
    @Args('duration') duration: number,
    @Args('description', { nullable: true }) description?: string,
    @Args('discountPrice', { nullable: true }) discountPrice?: number,
    @Args('maxCheckins', { nullable: true }) maxCheckins?: number,
    @Args('features', { type: () => [String], nullable: true }) features?: string[],
    @Args('isPopular', { nullable: true }) isPopular?: boolean,
    @Args('sortOrder', { nullable: true }) sortOrder?: number,
  ) {
    const packageData: CreatePackageDto = {
      name,
      clubId,
      type,
      price,
      duration,
      description,
      discountPrice,
      maxCheckins,
      features,
      isPopular,
      sortOrder,
    };

    const result = await this.subscriptionPackageService.createPackage(packageData);
    return JSON.stringify(result);
  }

  @Mutation(() => String)
  async updateSubscriptionPackage(
    @Args('id') id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('type', { nullable: true }) type?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'EVENT_SPECIFIC',
    @Args('price', { nullable: true }) price?: number,
    @Args('discountPrice', { nullable: true }) discountPrice?: number,
    @Args('duration', { nullable: true }) duration?: number,
    @Args('maxCheckins', { nullable: true }) maxCheckins?: number,
    @Args('features', { type: () => [String], nullable: true }) features?: string[],
    @Args('isActive', { nullable: true }) isActive?: boolean,
    @Args('isPopular', { nullable: true }) isPopular?: boolean,
    @Args('sortOrder', { nullable: true }) sortOrder?: number,
  ) {
    const updateData: UpdatePackageDto = {
      name,
      description,
      type,
      price,
      discountPrice,
      duration,
      maxCheckins,
      features,
      isActive,
      isPopular,
      sortOrder,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const result = await this.subscriptionPackageService.updatePackage(id, updateData);
    return JSON.stringify(result);
  }

  @Mutation(() => String)
  async deleteSubscriptionPackage(@Args('id') id: string) {
    const result = await this.subscriptionPackageService.deletePackage(id);
    return JSON.stringify(result);
  }

  @Mutation(() => String)
  async toggleSubscriptionPackageStatus(@Args('id') id: string) {
    const result = await this.subscriptionPackageService.togglePackageStatus(id);
    return JSON.stringify(result);
  }

  @Query(() => String)
  async subscriptionPackage(@Args('id') id: string) {
    const packageData = await this.subscriptionPackageService.getPackageById(id);
    return JSON.stringify(packageData);
  }

  @Query(() => String)
  async subscriptionPackagesByClub(
    @Args('clubId') clubId: string,
    @Args('includeInactive', { nullable: true }) includeInactive?: boolean,
  ) {
    const packages = await this.subscriptionPackageService.getPackagesByClub(
      clubId, 
      includeInactive || false
    );
    return JSON.stringify(packages);
  }

  @Query(() => String)
  async allSubscriptionPackages(
    @Args('includeInactive', { nullable: true }) includeInactive?: boolean,
  ) {
    const packages = await this.subscriptionPackageService.getAllPackages(
      includeInactive || false
    );
    return JSON.stringify(packages);
  }

  @Query(() => String)
  async popularSubscriptionPackages(
    @Args('limit', { nullable: true }) limit?: number,
  ) {
    const packages = await this.subscriptionPackageService.getPopularPackages(
      limit || 5
    );
    return JSON.stringify(packages);
  }
}