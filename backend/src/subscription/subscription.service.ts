import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionMapper } from '../common/mappers/subscription.mapper';
import * as QRCode from 'qrcode';

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private subscriptionMapper: SubscriptionMapper
  ) {}

  async createSubscription(data: any) {
    // If packageId is provided, get package details
    let subscriptionData = { ...data };
    
    if (data.packageId) {
      const packageData = await this.prisma.subscriptionPackage.findUnique({
        where: { id: data.packageId },
        include: { club: true }
      });

      if (!packageData) {
        throw new Error('Subscription package not found');
      }

      if (!packageData.isActive) {
        throw new Error('Subscription package is not active');
      }

      // Override data with package details
      subscriptionData = {
        ...data,
        name: packageData.name,
        type: packageData.type,
        price: packageData.discountPrice || packageData.price,
        duration: packageData.duration,
        maxCheckins: packageData.maxCheckins,
        clubId: packageData.clubId,
      };
    }

    // Ensure startDate and endDate are properly set
    const now = new Date();
    const startDate = subscriptionData.startDate || now;
    const duration = subscriptionData.duration || 30; // Default 30 days if not specified
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);

    // Create final subscription data with required fields
    const finalSubscriptionData = {
      ...subscriptionData,
      startDate,
      endDate,
      isActive: true,
    };

    const subscription = await this.prisma.subscription.create({
      data: finalSubscriptionData,
      include: {
        customer: true,
        club: true,
        package: true,
      }
    });

    // Generate QR Code for subscription
    const qrCode = await this.generateQRCode(subscription.id, subscription.customerId, subscription.clubId);
    
    const result = this.subscriptionMapper.mapPrismaSubscriptionToDto(subscription);
    return {
      ...result,
      qrCode,
    };
  }

  async generateQRCode(subscriptionId: string, customerId: string, clubId: string) {
    const qrCodeData = {
      subscriptionId,
      customerId,
      timestamp: Date.now(),
    };

    const qrCodeString = JSON.stringify(qrCodeData);
    const qrCodeBase64 = await QRCode.toDataURL(qrCodeString);

    const qrCode = await this.prisma.qRCode.create({
      data: {
        code: qrCodeString,
        customerId,
        subscriptionId,
        clubId,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      }
    });

    return {
      ...qrCode,
      qrCodeImage: qrCodeBase64,
    };
  }

  async getCustomerSubscriptions(customerId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { customerId },
      include: {
        club: true,
        package: true,
        qrCodes: true,
        customer: true,
        _count: {
          select: { checkinLogs: true }
        }
      }
    });
    
    return subscriptions.map(sub => this.subscriptionMapper.mapPrismaSubscriptionToDto(sub));
  }

  async getSubscriptionById(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: true,
        club: true,
        package: true,
        qrCodes: true,
        checkinLogs: {
          include: {
            event: true,
          }
        }
      }
    });
    
    return this.subscriptionMapper.mapPrismaSubscriptionToDto(subscription);
  }

  async cancelSubscription(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: true,
        club: true,
        package: true,
      }
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // If subscription is already cancelled, just return it (no error)
    if (!subscription.isActive) {
      const result = await this.prisma.subscription.findUnique({
        where: { id },
        include: {
          customer: true,
          club: true,
          package: true,
          qrCodes: true,
        }
      });
      return this.subscriptionMapper.mapPrismaSubscriptionToDto(result);
    }

    // Cancel the subscription
    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: { isActive: false },
      include: {
        customer: true,
        club: true,
        package: true,
        qrCodes: true,
      }
    });

    return this.subscriptionMapper.mapPrismaSubscriptionToDto(updatedSubscription);
  }

  async reactivateSubscription(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: true,
        club: true,
        package: true,
      }
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Check if subscription has expired
    const now = new Date();
    if (subscription.endDate < now) {
      throw new Error('Cannot reactivate expired subscription');
    }

    // If subscription is already active, just return it (no error)
    if (subscription.isActive) {
      const result = await this.prisma.subscription.findUnique({
        where: { id },
        include: {
          customer: true,
          club: true,
          package: true,
          qrCodes: true,
        }
      });
      return this.subscriptionMapper.mapPrismaSubscriptionToDto(result);
    }

    // Reactivate the subscription
    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: { isActive: true },
      include: {
        customer: true,
        club: true,
        package: true,
        qrCodes: true,
      }
    });

    return this.subscriptionMapper.mapPrismaSubscriptionToDto(updatedSubscription);
  }

  // Helper method to get subscription with customer relation for authorization
  async getSubscriptionForAuth(id: string) {
    return await this.prisma.subscription.findUnique({
      where: { id },
      select: {
        id: true,
        customerId: true,
        clubId: true,
        customer: {
          select: {
            id: true,
          }
        }
      }
    });
  }
}