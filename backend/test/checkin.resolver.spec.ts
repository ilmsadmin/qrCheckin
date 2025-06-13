import { Test, TestingModule } from '@nestjs/testing';
import { CheckinResolver } from '../src/checkin/checkin.resolver';
import { CheckinService } from '../src/checkin/checkin.service';
import { CheckinLog } from '../src/common/dto/checkin-log.dto';
import { CheckinType, Role } from '../src/common/enums';

describe('CheckinResolver - checkinLogs', () => {
  let resolver: CheckinResolver;
  let checkinService: CheckinService;

  const mockCheckinService = {
    checkin: jest.fn(),
    checkout: jest.fn(),
    getCheckinLogs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckinResolver,
        {
          provide: CheckinService,
          useValue: mockCheckinService,
        },
      ],
    }).compile();

    resolver = module.get<CheckinResolver>(CheckinResolver);
    checkinService = module.get<CheckinService>(CheckinService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkinLogs', () => {
    it('should return checkin logs with action field properly mapped', async () => {
      const limit = 100;
      const offset = 0;

      const mockLogs: CheckinLog[] = [
        {
          id: 'log-1',
          userId: 'user-123',
          eventId: 'event-1',
          type: CheckinType.CHECKIN,
          action: 'CHECKIN', // This should be populated by the mapper
          timestamp: new Date('2024-01-01T10:00:00Z'),
          location: 'Test Location',
          user: {
            id: 'user-123',
            username: 'john_doe',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: Role.USER,
            isActive: true,
            createdAt: new Date('2024-01-01T00:00:00Z'),
            updatedAt: new Date('2024-01-01T00:00:00Z'),
          },
          event: {
            id: 'event-1',
            name: 'Test Event',
            location: 'Event Location',
            startTime: '2024-01-01T09:00:00Z',
            endTime: '2024-01-01T17:00:00Z',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            clubId: 'club-1',
          },
        },
        {
          id: 'log-2',
          userId: 'user-456',
          eventId: 'event-2',
          type: CheckinType.CHECKOUT,
          action: 'CHECKOUT', // This should be populated by the mapper
          timestamp: new Date('2024-01-01T12:00:00Z'),
          location: 'Another Location',
          user: {
            id: 'user-456',
            username: 'jane_doe',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            role: Role.USER,
            isActive: true,
            createdAt: new Date('2024-01-01T00:00:00Z'),
            updatedAt: new Date('2024-01-01T00:00:00Z'),
          },
          event: {
            id: 'event-2',
            name: 'Another Event',
            location: 'Event Location 2',
            startTime: '2024-01-01T11:00:00Z',
            endTime: '2024-01-01T18:00:00Z',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            clubId: 'club-1',
          },
        },
      ];

      mockCheckinService.getCheckinLogs.mockResolvedValue(mockLogs);

      const result = await resolver.checkinLogs(limit, offset);

      expect(checkinService.getCheckinLogs).toHaveBeenCalledWith(
        undefined, // userId should be undefined
        undefined, // eventId should be undefined
        limit,
        offset,
      );
      expect(result).toEqual(mockLogs);
      expect(result.length).toBe(2);
      
      // Verify action field is available and properly mapped
      expect(result[0].action).toBe('CHECKIN');
      expect(result[1].action).toBe('CHECKOUT');
      
      // Verify that action field matches type field
      expect(result[0].action).toBe(result[0].type);
      expect(result[1].action).toBe(result[1].type);
    });

    it('should work with userId and eventId filters', async () => {
      const userId = 'user-123';
      const eventId = 'event-456';
      const limit = 50;
      const offset = 10;
      
      mockCheckinService.getCheckinLogs.mockResolvedValue([]);

      await resolver.checkinLogs(limit, offset, userId, eventId);

      expect(checkinService.getCheckinLogs).toHaveBeenCalledWith(
        userId,
        eventId,
        limit,
        offset,
      );
    });

    it('should work with minimal parameters', async () => {
      mockCheckinService.getCheckinLogs.mockResolvedValue([]);

      await resolver.checkinLogs();

      expect(checkinService.getCheckinLogs).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });
  });
});