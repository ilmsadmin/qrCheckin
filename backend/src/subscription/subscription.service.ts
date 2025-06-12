import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as QRCode from 'qrcode';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async createSubscription(data: any) {
    const subscription = await this.prisma.subscription.create({
      data,
      include: {
        user: true,
        club: true,
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