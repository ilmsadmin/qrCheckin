import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { SubscriptionType } from '../enums';
import { Club } from './club.dto';
import { User } from './user.dto';

registerEnumType(SubscriptionType, {
  name: 'SubscriptionType',
});

@ObjectType()
export class SubscriptionPackage {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => SubscriptionType)
  type: SubscriptionType;

  @Field()
  price: number;

  @Field({ nullable: true })
  discountPrice?: number;

  @Field(() => Int)
  duration: number;

  @Field(() => Int, { nullable: true })
  maxCheckins?: number;

  @Field(() => [String])
  features: string[];

  @Field()
  isActive: boolean;

  @Field()
  isPopular: boolean;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Club)
  club: Club;
}

@ObjectType()
export class Subscription {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => SubscriptionType)
  type: SubscriptionType;

  @Field()
  price: number;

  @Field(() => Int)
  duration: number;

  @Field(() => Int, { nullable: true })
  maxCheckins?: number;

  @Field()
  isActive: boolean;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => User)
  user: User;

  @Field(() => Club)
  club: Club;

  @Field(() => SubscriptionPackage, { nullable: true })
  package?: SubscriptionPackage;
}