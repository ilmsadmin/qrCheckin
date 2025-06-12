import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { User } from '../dto/user.dto';
import { Role } from '../enums';

@Injectable()
export class UserMapper {
  mapPrismaUserToDto(prismaUser: any): User {
    // Convert the Prisma Role enum to our application Role enum
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      username: prismaUser.username,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      role: prismaUser.role as unknown as Role, // This cast ensures type compatibility
      isActive: prismaUser.isActive,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }
}
