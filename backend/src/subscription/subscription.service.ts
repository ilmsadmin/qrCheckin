import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as QRCode from 'qrcode';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

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

    const subscription = await this.prisma.subscription.create({
      data: subscriptionData,
      include: {
        user: true,
        club: true,
        package: true,
      }
    });

    // Generate QR Code for subscription
    const qrCode = await this.generateQRCode(subscription.id, subscription.userId);
    
    return {
      ...subscription,
      qrCode,
    };
  }

  async generateQRCode(subscriptionId: string, userId: string) {
    const qrCodeData = {
      subscriptionId,
      userId,
      timestamp: Date.now(),
    };

    const qrCodeString = JSON.stringify(qrCodeData);
    const qrCodeBase64 = await QRCode.toDataURL(qrCodeString);

    const qrCode = await this.prisma.qRCode.create({
      data: {
        code: qrCodeString,
        userId,
        subscriptionId,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      }
    });

    return {
      ...qrCode,
      qrCodeImage: qrCodeBase64,
    };
  }

  async getUserSubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: {
        club: true,
        package: true,
        qrCodes: true,
        _count: {
          select: { checkinLogs: true }
        }
      }
    });
  }

  async getSubscriptionById(id: string) {
    return this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: true,
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
  }
}