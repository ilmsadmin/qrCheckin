import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventInput, UpdateEventInput, Event } from '../common/dto/event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums';

@Resolver()
export class EventsResolver {
  constructor(private eventsService: EventsService) {}

  @Query(() => String)
  async events() {
    const events = await this.eventsService.findAll();
    return JSON.stringify(events);
  }

  @Query(() => String)
  async event(@Args('id') id: string) {
    const event = await this.eventsService.findOne(id);
    return JSON.stringify(event);
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  async createEvent(@Args('input') createEventInput: CreateEventInput) {
    const event = await this.eventsService.create(createEventInput);
    return JSON.stringify(event);
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  async updateEvent(
    @Args('id') id: string,
    @Args('input') updateEventInput: UpdateEventInput
  ) {
    const event = await this.eventsService.update(id, updateEventInput);
    return JSON.stringify(event);
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async removeEvent(@Args('id') id: string) {
    const event = await this.eventsService.remove(id);
    return JSON.stringify(event);
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteEvent(@Args('id') id: string) {
    const result = await this.eventsService.delete(id);
    return JSON.stringify({ success: true, deletedEvent: result });
  }
}