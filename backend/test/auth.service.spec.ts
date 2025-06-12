// filepath: /Volumes/DATA/project/qrCheckin/backend/test/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';
import { Role } from '../src/common/enums';
import { UserMapper } from '../src/common/mappers/user.mapper';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let redisService: RedisService;
  let userMapper: UserMapper;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: Role.USER,
    isActive: true,
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              if (key === 'jwt.secret') return 'test-secret';
              if (key === 'jwt.expiresIn') return '1d';
              return null;
            }),
          },
        },
        {
          provide: RedisService,
          useValue: {
            set: jest.fn().mockResolvedValue(true),
            get: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: UserMapper,
          useValue: {
            mapPrismaUserToDto: jest.fn().mockImplementation((user) => ({
              id: user.id,
              email: user.email,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              isActive: user.isActive,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            })),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    redisService = module.get<RedisService>(RedisService);
    userMapper = module.get<UserMapper>(UserMapper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data without password when valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser(email, password);

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: Role.USER,
        isActive: true,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return null when invalid credentials', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      const { password, ...userWithoutPassword } = mockUser;
      
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);
      jest.spyOn(userMapper, 'mapPrismaUserToDto').mockReturnValue(userWithoutPassword as any);
      mockedBcrypt.hash.mockResolvedValue('hashedpassword' as never);

      const result = await service.register(userData);

      expect(result).toEqual(userWithoutPassword);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...userData,
          password: 'hashedpassword',
        },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
    });

    it('should throw conflict exception when user already exists', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);

      await expect(service.register(userData)).rejects.toThrow('User with this email or username already exists');
    });
  });
});
