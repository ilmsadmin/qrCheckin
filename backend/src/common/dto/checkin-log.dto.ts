import { ObjectType, Field, ID } from '@nestjs/graphql';
import { CheckinType } from '../enums';
import { User } from './user.dto';
import { Event } from './event.dto';

@ObjectType()
export class CheckinLog {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  eventId: string;

  @Field(() => CheckinType)
  type: CheckinType;

  // Map 'type' to 'action' for frontend compatibility
  @Field()
  get action(): string {
    return this.type;
  }

  @Field()
  timestamp: Date;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => User)
  user: User;

  @Field(() => Event)
  event: Event;
}