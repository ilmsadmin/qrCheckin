import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.club.findMany({
      include: {
        _count: {
          select: {
            events: true,
            subscriptions: true,
            subscriptionPackages: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.club.findUnique({
      where: { id },
      include: {
        events: {
          where: { isActive: true },
          orderBy: { startTime: 'asc' },
        },
        subscriptionPackages: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });
  }

  async create(data: { 
    name: string; 
    description?: string; 
    subdomain: string; 
    contactEmail: string;
  }) {
    return this.prisma.club.create({
      data: {
        name: data.name,
        description: data.description,
        subdomain: data.subdomain,
        contactEmail: data.contactEmail,
      },
    });
  }

  async update(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
    return this.prisma.club.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.club.update({
      where: { id },
      data: { isActive: false },
    });
  }
}