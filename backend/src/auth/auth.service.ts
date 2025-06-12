import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { UserMapper } from '../common/mappers/user.mapper';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    private userMapper: UserMapper,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    // Store session in Redis
    const sessionKey = `session:${user.id}`;
    await this.redisService.set(
      sessionKey,
      JSON.stringify({ userId: user.id, email: user.email }),
      3600 * 24, // 24 hours
    );

    return {
      access_token: token,
      user: this.userMapper.mapPrismaUserToDto(user),
    };
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: userData.email }, { username: userData.username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    const { password, ...result } = user;
    return this.userMapper.mapPrismaUserToDto(result);
  }

  async logout(userId: string) {
    const sessionKey = `session:${userId}`;
    await this.redisService.del(sessionKey);
    return { message: 'Logged out successfully' };
  }

  async getSession(userId: string) {
    const sessionKey = `session:${userId}`;
    const session = await this.redisService.get(sessionKey);
    return session ? JSON.parse(session) : null;
  }
}