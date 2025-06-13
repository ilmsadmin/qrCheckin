import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventInput, UpdateEventInput } from '../common/dto/event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.event.findMany({
      include: {
        club: true,
        _count: {
          select: { checkinLogs: true }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        club: true,
        checkinLogs: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async create(createEventInput: CreateEventInput) {
    const { clubId, startTime, endTime, ...eventData } = createEventInput;

    // Validate that the club exists
    const club = await this.prisma.club.findUnique({
      where: { id: clubId }
    });

    if (!club) {
      throw new BadRequestException(`Club with ID ${clubId} not found`);
    }

    // Validate start time is before end time
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new BadRequestException('Start time must be before end time');
    }

    return this.prisma.event.create({
      data: {
        ...eventData,
        startTime: start,
        endTime: end,
        club: {
          connect: { id: clubId }
        }
      },
      include: {
        club: true,
        _count: {
          select: { checkinLogs: true }
        }
      }
    });
  }

  async update(id: string, updateEventInput: UpdateEventInput) {
    const { clubId, startTime, endTime, ...eventData } = updateEventInput;

    // Check if event exists
    const existingEvent = await this.prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Validate club if provided
    if (clubId) {
      const club = await this.prisma.club.findUnique({
        where: { id: clubId }
      });

      if (!club) {
        throw new BadRequestException(`Club with ID ${clubId} not found`);
      }
    }

    // Validate times if provided
    if (startTime || endTime) {
      const start = startTime ? new Date(startTime) : existingEvent.startTime;
      const end = endTime ? new Date(endTime) : existingEvent.endTime;

      if (start >= end) {
        throw new BadRequestException('Start time must be before end time');
      }
    }

    const updateData: any = { ...eventData };

    if (startTime) {
      updateData.startTime = new Date(startTime);
    }

    if (endTime) {
      updateData.endTime = new Date(endTime);
    }

    if (clubId) {
      updateData.club = { connect: { id: clubId } };
    }

    return this.prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        club: true,
        _count: {
          select: { checkinLogs: true }
        }
      }
    });
  }

  async remove(id: string) {
    // Check if event exists
    const existingEvent = await this.prisma.event.findUnique({
      where: { id }
    });

    console.log('Remove - Found existing event:', existingEvent);

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    console.log('Deactivating event...');
    // Soft delete by setting isActive to false
    const deactivatedEvent = await this.prisma.event.update({
      where: { id },
      data: { isActive: false },
      include: {
        club: true,
        _count: {
          select: { checkinLogs: true }
        }
      }
    });

    console.log('Event deactivated successfully:', deactivatedEvent);
    return deactivatedEvent;
  }

  async reactivate(id: string) {
    // Check if event exists
    const existingEvent = await this.prisma.event.findUnique({
      where: { id }
    });

    console.log('Reactivate - Found existing event:', existingEvent);

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Check if event is already active
    if (existingEvent.isActive) {
      console.log('Event is already active, throwing error');
      throw new BadRequestException('Event is already active');
    }

    console.log('Reactivating event...');
    // Reactivate by setting isActive to true
    const reactivatedEvent = await this.prisma.event.update({
      where: { id },
      data: { isActive: true },
      include: {
        club: true,
        _count: {
          select: { checkinLogs: true }
        }
      }
    });

    console.log('Event reactivated successfully:', reactivatedEvent);
    return reactivatedEvent;
  }

  async delete(id: string) {
    // Check if event exists
    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { checkinLogs: true }
        }
      }
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Check if event has check-in logs
    if (existingEvent._count.checkinLogs > 0) {
      throw new BadRequestException('Cannot delete event with existing check-in logs. Use deactivate instead.');
    }

    // Hard delete if no dependencies
    return this.prisma.event.delete({
      where: { id }
    });
  }
}