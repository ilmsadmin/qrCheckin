import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as QRCode from 'qrcode';

@Injectable()
export class CheckinService {
  constructor(private prisma: PrismaService) {}

  async checkin(qrCodeId: string, eventId: string) {
    // Try to find QR code by ID first, then by code field
    let qrCode = await this.prisma.qRCode.findUnique({
      where: { id: qrCodeId },
      include: { user: true, subscription: true }
    });

    // If not found by ID, try to find by code field
    if (!qrCode) {
      qrCode = await this.prisma.qRCode.findUnique({
        where: { code: qrCodeId },
        include: { user: true, subscription: true }
      });
    }

    if (!qrCode || !qrCode.isActive) {
      throw new Error('Invalid QR Code');
    }

    return this.prisma.checkinLog.create({
      data: {
        type: 'CHECKIN',
        userId: qrCode.userId,
        eventId,
        subscriptionId: qrCode.subscriptionId,
        qrCodeId: qrCode.id,
        timestamp: new Date(),
      },
      include: {
        user: true,
        event: true,
      }
    });
  }

  async checkout(qrCodeId: string, eventId: string) {
    // Try to find QR code by ID first, then by code field
    let qrCode = await this.prisma.qRCode.findUnique({
      where: { id: qrCodeId },
      include: { user: true, subscription: true }
    });

    // If not found by ID, try to find by code field
    if (!qrCode) {
      qrCode = await this.prisma.qRCode.findUnique({
        where: { code: qrCodeId },
        include: { user: true, subscription: true }
      });
    }

    if (!qrCode || !qrCode.isActive) {
      throw new Error('Invalid QR Code');
    }

    return this.prisma.checkinLog.create({
      data: {
        type: 'CHECKOUT',
        userId: qrCode.userId,
        eventId,
        subscriptionId: qrCode.subscriptionId,
        qrCodeId: qrCode.id,
        timestamp: new Date(),
      },
      include: {
        user: true,
        event: true,
      }
    });
  }

  async getCheckinLogs(userId?: string, eventId?: string, limit?: number, offset?: number) {
    return this.prisma.checkinLog.findMany({
      where: {
        ...(userId && { userId }),
        ...(eventId && { eventId }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        event: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      ...(limit && { take: limit }),
      ...(offset && { skip: offset }),
    });
  }
}