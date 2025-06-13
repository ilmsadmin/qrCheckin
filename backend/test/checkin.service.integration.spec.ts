import { Test, TestingModule } from '@nestjs/testing';
import { CheckinService } from '../src/checkin/checkin.service';
import { CheckinLogMapper } from '../src/common/mappers/checkin-log.mapper';
import { UserMapper } from '../src/common/mappers/user.mapper';
import { PrismaService } from '../src/prisma/prisma.service';
import { CheckinType } from '../src/common/enums';

describe('CheckinService Integration - Action Field Mapping', () => {
  let service: CheckinService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    checkinLog: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    qRCode: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckinService,
        CheckinLogMapper,
        UserMapper,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CheckinService>(CheckinService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCheckinLogs', () => {
    it('should return CheckinLog DTOs with working action getter', async () => {
      // Mock Prisma data - this is what comes from the database
      const mockPrismaData = [
        {
          id: 'log-1',
          userId: 'user-1',
          eventId: 'event-1',
          type: 'CHECKIN', // Note: this is the raw enum value from Prisma
          timestamp: new Date('2024-01-01T10:00:00Z'),
          location: 'Main Hall',
          notes: 'Test checkin',
          user: {
            id: 'user-1',
            email: 'test@example.com',
            username: 'testuser',
            firstName: 'John',
            lastName: 'Doe',
            role: 'USER',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          event: {
            id: 'event-1',
            name: 'Test Event',
            description: 'Test Description',
            startTime: '2024-01-01T10:00:00Z',
            endTime: '2024-01-01T12:00:00Z',
            location: 'Test Location',
            maxCapacity: 100,
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            clubId: 'club-1',
          },
        },
        {
          id: 'log-2',
          userId: 'user-2',
          eventId: 'event-2',
          type: 'CHECKOUT', // Note: this is the raw enum value from Prisma
          timestamp: new Date('2024-01-01T11:00:00Z'),
          location: null,
          notes: null,
          user: {
            id: 'user-2',
            email: 'test2@example.com',
            username: 'testuser2',
            firstName: 'Jane',
            lastName: 'Smith',
            role: 'USER',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          event: {
            id: 'event-2',
            name: 'Test Event 2',
            description: 'Test Description 2',
            startTime: '2024-01-01T10:00:00Z',
            endTime: '2024-01-01T12:00:00Z',
            location: 'Test Location 2',
            maxCapacity: 50,
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            clubId: 'club-2',
          },
        },
      ];

      mockPrismaService.checkinLog.findMany.mockResolvedValue(mockPrismaData);

      // Call the service method
      const result = await service.getCheckinLogs(undefined, undefined, 100, 0);

      // Verify the result
      expect(result).toHaveLength(2);
      
      // Test the first log (CHECKIN)
      expect(result[0].id).toBe('log-1');
      expect(result[0].type).toBe(CheckinType.CHECKIN);
      expect(result[0].action).toBe('CHECKIN'); // This should work because of the mapper
      expect(result[0].action).toBe(CheckinType.CHECKIN);
      expect(result[0].user.firstName).toBe('John');
      expect(result[0].event.name).toBe('Test Event');

      // Test the second log (CHECKOUT)
      expect(result[1].id).toBe('log-2');
      expect(result[1].type).toBe(CheckinType.CHECKOUT);
      expect(result[1].action).toBe('CHECKOUT'); // This should work because of the mapper
      expect(result[1].action).toBe(CheckinType.CHECKOUT);
      expect(result[1].user.firstName).toBe('Jane');
      expect(result[1].event.name).toBe('Test Event 2');

      // Verify that Prisma was called with correct parameters
      expect(mockPrismaService.checkinLog.findMany).toHaveBeenCalledWith({
        where: {},
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
        take: 100,
      });
    });

    it('should handle empty results', async () => {
      mockPrismaService.checkinLog.findMany.mockResolvedValue([]);

      const result = await service.getCheckinLogs();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should pass through filters correctly', async () => {
      mockPrismaService.checkinLog.findMany.mockResolvedValue([]);

      await service.getCheckinLogs('user-123', 'event-456', 50, 25);

      expect(mockPrismaService.checkinLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          eventId: 'event-456',
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
        take: 50,
        skip: 25,
      });
    });
  });
});