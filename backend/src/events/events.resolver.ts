import { Resolver, Query, Args } from '@nestjs/graphql';
import { EventsService } from './events.service';

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
}