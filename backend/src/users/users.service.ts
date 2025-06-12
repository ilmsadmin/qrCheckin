import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserMapper } from '../common/mappers/user.mapper';
import { User } from '../common/dto/user.dto';
import { QRCode } from '../common/dto/qrcode.dto';
import * as QRCodeLib from 'qrcode';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private userMapper: UserMapper
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return users.map(user => this.userMapper.mapPrismaUserToDto(user));
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return this.userMapper.mapPrismaUserToDto(user);
  }

  async generateUserQRCode(userId: string): Promise<QRCode> {
    // First check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user already has an active subscription with QR code
    let userSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: { gt: new Date() },
      },
      include: {
        qrCodes: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // If user has an active subscription with QR code, return the existing QR code
    if (userSubscription && userSubscription.qrCodes.length > 0) {
      const existingQRCode = userSubscription.qrCodes[0];
      return {
        id: existingQRCode.id,
        qrCode: existingQRCode.code,
        expiresAt: existingQRCode.expiresAt,
        isActive: existingQRCode.isActive,
        createdAt: existingQRCode.createdAt,
        updatedAt: existingQRCode.updatedAt,
      };
    }

    // If user doesn't have an active subscription, create a temporary one
    if (!userSubscription) {
      // Find the first available club (or create a default one)
      let defaultClub = await this.prisma.club.findFirst({
        where: { isActive: true },
      });

      if (!defaultClub) {
        // Create a default club if none exists
        defaultClub = await this.prisma.club.create({
          data: {
            name: 'Default Club',
            description: 'Default club for user QR codes',
          },
        });
      }

      // Create a temporary subscription (30 days by default)
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      userSubscription = await this.prisma.subscription.create({
        data: {
          name: 'User QR Code Access',
          type: 'MONTHLY',
          price: 0, // Free temporary subscription
          duration: 30,
          startDate,
          endDate,
          userId,
          clubId: defaultClub.id,
        },
      });
    }

    // Generate QR code
    const qrCodeData = `USER-${userId}-SUB-${userSubscription.id}`;
    
    // Create QR code in database
    const qrCode = await this.prisma.qRCode.create({
      data: {
        code: qrCodeData,
        userId,
        subscriptionId: userSubscription.id,
        expiresAt: userSubscription.endDate,
      },
    });

    return {
      id: qrCode.id,
      qrCode: qrCode.code,
      expiresAt: qrCode.expiresAt,
      isActive: qrCode.isActive,
      createdAt: qrCode.createdAt,
      updatedAt: qrCode.updatedAt,
    };
  }
}