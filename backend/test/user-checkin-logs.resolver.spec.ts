import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from '../src/users/users.resolver';
import { UsersService } from '../src/users/users.service';
import { CheckinService } from '../src/checkin/checkin.service';
import { CheckinLog } from '../src/common/dto/checkin-log.dto';
import { CheckinType, Role } from '../src/common/enums';

describe('UsersResolver - userCheckinLogs', () => {
  let resolver: UsersResolver;
  let checkinService: CheckinService;

  const mockCheckinService = {
    getCheckinLogs: jest.fn(),
  };

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    generateUserQRCode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: CheckinService,
          useValue: mockCheckinService,
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    checkinService = module.get<CheckinService>(CheckinService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('userCheckinLogs', () => {
    it('should call CheckinService.getCheckinLogs with correct parameters', async () => {
      const userId = 'user-123';
      const limit = 50;
      const offset = 0;

      const mockLogs: CheckinLog[] = [
        {
          id: 'log-1',
          userId: 'user-123',
          eventId: 'event-1',
          type: CheckinType.CHECKIN,
          action: 'CHECKIN',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          location: 'Test Location',
          user: {
            id: 'user-123',
            username: 'john_doe',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: Role.CUSTOMER,
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
      ];

      mockCheckinService.getCheckinLogs.mockResolvedValue(mockLogs);

      const result = await resolver.userCheckinLogs(userId, limit, offset);

      expect(checkinService.getCheckinLogs).toHaveBeenCalledWith(
        userId,
        undefined, // eventId should be undefined
        undefined, // clubId should be undefined
        limit,
        offset,
      );
      expect(result).toEqual(mockLogs);
      expect(result[0].action).toBe('CHECKIN'); // Verify action field is available
    });

    it('should work with minimal parameters', async () => {
      const userId = 'user-123';
      mockCheckinService.getCheckinLogs.mockResolvedValue([]);

      await resolver.userCheckinLogs(userId);

      expect(checkinService.getCheckinLogs).toHaveBeenCalledWith(
        userId,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should work with all parameters', async () => {
      const userId = 'user-123';
      const limit = 25;
      const offset = 10;
      mockCheckinService.getCheckinLogs.mockResolvedValue([]);

      await resolver.userCheckinLogs(userId, limit, offset);

      expect(checkinService.getCheckinLogs).toHaveBeenCalledWith(
        userId,
        undefined,
        undefined,
        limit,
        offset,
      );
    });

    it('should work without userId (get all user logs)', async () => {
      const limit = 100;
      const offset = 0;
      mockCheckinService.getCheckinLogs.mockResolvedValue([]);

      await resolver.userCheckinLogs(undefined, limit, offset);

      expect(checkinService.getCheckinLogs).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        limit,
        offset,
      );
    });
  });
});