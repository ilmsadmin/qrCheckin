import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreatePackageDto {
  name: string;
  description?: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'EVENT_SPECIFIC';
  price: number;
  discountPrice?: number;
  duration: number;
  maxCheckins?: number;
  features?: string[];
  clubId: string;
  isPopular?: boolean;
  sortOrder?: number;
}

export interface UpdatePackageDto {
  name?: string;
  description?: string;
  type?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'EVENT_SPECIFIC';
  price?: number;
  discountPrice?: number;
  duration?: number;
  maxCheckins?: number;
  features?: string[];
  isActive?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
}

@Injectable()
export class SubscriptionPackageService {
  constructor(private prisma: PrismaService) {}

  async createPackage(data: CreatePackageDto) {
    return this.prisma.subscriptionPackage.create({
      data: {
        ...data,
        features: data.features || [],
      },
      include: {
        club: true,
        _count: {
          select: { subscriptions: true }
        }
      }
    });
  }

  async updatePackage(id: string, data: UpdatePackageDto) {
    return this.prisma.subscriptionPackage.update({
      where: { id },
      data: {
        ...data,
        features: data.features || undefined,
      },
      include: {
        club: true,
        _count: {
          select: { subscriptions: true }
        }
      }
    });
  }

  async deletePackage(id: string) {
    // First check if package has active subscriptions
    const packageWithSubscriptions = await this.prisma.subscriptionPackage.findUnique({
      where: { id },
      include: {
        subscriptions: {
          where: { isActive: true }
        }
      }
    });

    if (packageWithSubscriptions?.subscriptions.length > 0) {
      throw new Error('Cannot delete package with active subscriptions');
    }

    return this.prisma.subscriptionPackage.delete({
      where: { id }
    });
  }

  async getPackageById(id: string) {
    return this.prisma.subscriptionPackage.findUnique({
      where: { id },
      include: {
        club: true,
        subscriptions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: { subscriptions: true }
        }
      }
    });
  }

  async getPackagesByClub(clubId: string, includeInactive = false) {
    return this.prisma.subscriptionPackage.findMany({
      where: {
        clubId,
        ...(includeInactive ? {} : { isActive: true })
      },
      include: {
        club: true,
        _count: {
          select: { subscriptions: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async getAllPackages(includeInactive = false) {
    return this.prisma.subscriptionPackage.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        club: true,
        _count: {
          select: { subscriptions: true }
        }
      },
      orderBy: [
        { club: { name: 'asc' } },
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async getPopularPackages(limit = 5) {
    return this.prisma.subscriptionPackage.findMany({
      where: {
        isActive: true,
        isPopular: true
      },
      include: {
        club: true,
        _count: {
          select: { subscriptions: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });
  }

  async togglePackageStatus(id: string) {
    const packageData = await this.prisma.subscriptionPackage.findUnique({
      where: { id },
      select: { isActive: true }
    });

    if (!packageData) {
      throw new Error('Package not found');
    }

    return this.prisma.subscriptionPackage.update({
      where: { id },
      data: { isActive: !packageData.isActive },
      include: {
        club: true,
        _count: {
          select: { subscriptions: true }
        }
      }
    });
  }
}