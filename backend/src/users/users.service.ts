import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserMapper } from '../common/mappers/user.mapper';
import { User } from '../common/dto/user.dto';
import { QRCode } from '../common/dto/qrcode.dto';

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

    // In the new B2B model, Users are staff members, not customers
    // This method should probably be renamed or moved to a customer service
    // For now, I'll find a customer with the same email as the user
    const customer = await this.prisma.customer.findFirst({
      where: {
        email: user.email,
        isActive: true,
      },
    });

    if (!customer) {
      throw new Error('Customer not found for this user');
    }

    // Check if customer has an active subscription with QR code
    let customerSubscription = await this.prisma.subscription.findFirst({
      where: {
        customerId: customer.id,
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

    // If customer has an active subscription with QR code, return the existing QR code
    if (customerSubscription && customerSubscription.qrCodes.length > 0) {
      const existingQRCode = customerSubscription.qrCodes[0];
      return {
        id: existingQRCode.id,
        qrCode: existingQRCode.code,
        expiresAt: existingQRCode.expiresAt,
        isActive: existingQRCode.isActive,
        createdAt: existingQRCode.createdAt,
        updatedAt: existingQRCode.updatedAt,
      };
    }

    // If customer doesn't have an active subscription, create a temporary one
    if (!customerSubscription) {
      // Find the first available club (or create a default one)
      let defaultClub = await this.prisma.club.findFirst({
        where: { isActive: true },
      });

      if (!defaultClub) {
        // Create a default club if none exists
        defaultClub = await this.prisma.club.create({
          data: {
            name: 'Default Club',
            description: 'Default club for customer QR codes',
            subdomain: 'default',
            contactEmail: 'admin@default.com',
          },
        });
      }

      // Create a temporary subscription (30 days by default)
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Generate QR code data
      const qrCodeData = `CUSTOMER-${customer.id}-SUB-${new Date().getTime()}`; // Use timestamp as placeholder

      // Create subscription and QR code in a single transaction
      customerSubscription = await this.prisma.subscription.create({
        data: {
          name: 'Customer QR Code Access',
          type: 'MONTHLY',
          originalPrice: 0, // Free temporary subscription
          finalPrice: 0,
          duration: 30,
          startDate,
          endDate,
          customerId: customer.id,
          clubId: defaultClub.id,
          qrCodes: {
            create: {
              code: qrCodeData,
              customerId: customer.id,
              clubId: defaultClub.id,
              expiresAt: endDate,
            }
          },
        },
        include: {
          qrCodes: true,
        },
      });
    }

    // Get the QR code created with the subscription
    const qrCode = customerSubscription.qrCodes[0];

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