import { Field, InputType, ObjectType, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsDateString, IsInt, IsBoolean, Min } from 'class-validator';

@InputType()
export class CreateEventInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsDateString()
  startTime: string;

  @Field()
  @IsDateString()
  endTime: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxCapacity?: number;

  @Field(() => ID)
  @IsString()
  clubId: string;
}

@InputType()
export class UpdateEventInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxCapacity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  clubId?: string;
}

@ObjectType()
export class Event {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  startTime: string;

  @Field()
  endTime: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  maxCapacity?: number;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field(() => ID)
  clubId: string;
}