import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Customer {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  dateOfBirth?: Date;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  postalCode?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  clubId: string;
}
