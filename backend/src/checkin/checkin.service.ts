import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckinLogMapper } from '../common/mappers/checkin-log.mapper';
import * as QRCode from 'qrcode';

@Injectable()
export class CheckinService {
  constructor(
    private prisma: PrismaService,
    private checkinLogMapper: CheckinLogMapper
  ) {}

  async checkin(qrCodeId: string, eventId: string) {
    // Try to find QR code by ID first, then by code field
    let qrCode = await this.prisma.qRCode.findUnique({
      where: { id: qrCodeId },
      include: { customer: true, subscription: true, club: true }
    });

    // If not found by ID, try to find by code field
    if (!qrCode) {
      qrCode = await this.prisma.qRCode.findUnique({
        where: { code: qrCodeId },
        include: { customer: true, subscription: true, club: true }
      });
    }

    if (!qrCode || !qrCode.isActive) {
      throw new Error('Invalid QR Code');
    }

    const prismaCheckinLog = await this.prisma.checkinLog.create({
      data: {
        type: 'CHECKIN',
        customerId: qrCode.customerId,
        clubId: qrCode.clubId,
        eventId,
        subscriptionId: qrCode.subscriptionId,
        qrCodeId: qrCode.id,
        timestamp: new Date(),
      },
      include: {
        customer: true,
        event: true,
      }
    });

    return this.checkinLogMapper.mapPrismaCheckinLogToDto(prismaCheckinLog);
  }

  async checkout(qrCodeId: string, eventId: string) {
    // Try to find QR code by ID first, then by code field
    let qrCode = await this.prisma.qRCode.findUnique({
      where: { id: qrCodeId },
      include: { customer: true, subscription: true, club: true }
    });

    // If not found by ID, try to find by code field
    if (!qrCode) {
      qrCode = await this.prisma.qRCode.findUnique({
        where: { code: qrCodeId },
        include: { customer: true, subscription: true, club: true }
      });
    }

    if (!qrCode || !qrCode.isActive) {
      throw new Error('Invalid QR Code');
    }

    const prismaCheckinLog = await this.prisma.checkinLog.create({
      data: {
        type: 'CHECKOUT',
        customerId: qrCode.customerId,
        clubId: qrCode.clubId,
        eventId,
        subscriptionId: qrCode.subscriptionId,
        qrCodeId: qrCode.id,
        timestamp: new Date(),
      },
      include: {
        customer: true,
        event: true,
      }
    });

    return this.checkinLogMapper.mapPrismaCheckinLogToDto(prismaCheckinLog);
  }

  async getCheckinLogs(customerId?: string, eventId?: string, clubId?: string, limit?: number, offset?: number) {
    const prismaCheckinLogs = await this.prisma.checkinLog.findMany({
      where: {
        ...(customerId && { customerId }),
        ...(eventId && { eventId }),
        ...(clubId && { clubId }),
      },
      include: {
        customer: {
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

    return prismaCheckinLogs.map(log => this.checkinLogMapper.mapPrismaCheckinLogToDto(log));
  }
}