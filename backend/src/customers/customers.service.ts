import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CustomerFilter {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(clubId: string, filters: CustomerFilter = {}) {
    const { search, status, limit = 50, offset = 0 } = filters;

    const where: any = {
      clubId,
    };

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter based on subscription status
    if (status) {
      where.subscriptions = {
        some: {
          status: status.toUpperCase(),
        },
      };
    }

    const customers = await this.prisma.customer.findMany({
      where,
      include: {
        subscriptions: {
          include: {
            package: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get latest subscription
        },
        qrCodes: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get latest QR code
        },
        checkinLogs: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 5, // Get latest 5 check-ins
        },
        _count: {
          select: {
            subscriptions: true,
            checkinLogs: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Transform data to include computed fields
    return customers.map(customer => ({
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`,
      displayName: customer.firstName,
      currentSubscription: customer.subscriptions[0] || null,
      currentQRCode: customer.qrCodes[0] || null,
      recentCheckins: customer.checkinLogs,
      totalSubscriptions: customer._count.subscriptions,
      totalCheckins: customer._count.checkinLogs,
      memberSince: customer.createdAt,
      status: customer.subscriptions[0]?.status || 'NO_SUBSCRIPTION',
      subscriptionExpiry: customer.subscriptions[0]?.endDate || null,
      lastActivity: customer.checkinLogs[0]?.timestamp || null,
    }));
  }

  async findOne(id: string, clubId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id,
        clubId,
      },
      include: {
        subscriptions: {
          include: {
            package: true,
            payments: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        qrCodes: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        checkinLogs: {
          include: {
            event: true,
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 20, // Get latest 20 check-ins for detail view
        },
        _count: {
          select: {
            subscriptions: true,
            checkinLogs: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Calculate additional metrics
    const thisMonthCheckins = customer.checkinLogs.filter(
      log => log.timestamp >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    ).length;

    const currentSubscription = customer.subscriptions[0];
    const isActive = currentSubscription?.status === 'ACTIVE' && 
                    currentSubscription?.endDate > new Date();

    return {
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`,
      displayName: customer.firstName,
      currentSubscription,
      currentQRCode: customer.qrCodes[0] || null,
      totalSubscriptions: customer._count.subscriptions,
      totalCheckins: customer._count.checkinLogs,
      thisMonthCheckins,
      memberSince: customer.createdAt,
      status: currentSubscription?.status || 'NO_SUBSCRIPTION',
      subscriptionExpiry: currentSubscription?.endDate || null,
      lastActivity: customer.checkinLogs[0]?.timestamp || null,
      isActive,
      subscriptionHistory: customer.subscriptions,
      checkinHistory: customer.checkinLogs,
    };
  }

  async getStats(clubId: string) {
    const [
      totalCustomers,
      activeCustomers,
      expiredCustomers,
      newThisMonth,
      totalRevenue,
    ] = await Promise.all([
      // Total customers
      this.prisma.customer.count({
        where: { clubId },
      }),
      
      // Active customers (with active subscriptions)
      this.prisma.customer.count({
        where: {
          clubId,
          subscriptions: {
            some: {
              status: 'ACTIVE',
              endDate: {
                gt: new Date(),
              },
            },
          },
        },
      }),
      
      // Expired customers
      this.prisma.customer.count({
        where: {
          clubId,
          subscriptions: {
            some: {
              status: 'EXPIRED',
            },
          },
        },
      }),
      
      // New customers this month
      this.prisma.customer.count({
        where: {
          clubId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      
      // Total revenue from subscriptions
      this.prisma.payment.aggregate({
        where: {
          clubId,
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const canceledCustomers = totalCustomers - activeCustomers - expiredCustomers;

    return {
      totalCustomers,
      activeCustomers,
      expiredCustomers,
      canceledCustomers,
      newThisMonth,
      totalRevenue: totalRevenue._sum.amount || 0,
      activePercentage: totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0,
      retentionRate: totalCustomers > 0 ? Math.round(((activeCustomers + expiredCustomers) / totalCustomers) * 100) : 0,
    };
  }
}
