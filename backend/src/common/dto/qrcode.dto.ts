import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class QRCode {
  @Field(() => ID)
  id: string;

  @Field()
  qrCode: string;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}