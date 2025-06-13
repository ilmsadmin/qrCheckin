import { CheckinLogMapper } from '../src/common/mappers/checkin-log.mapper';
import { UserMapper } from '../src/common/mappers/user.mapper';
import { CheckinType } from '../src/common/enums';

describe('CheckinLogMapper', () => {
  let checkinLogMapper: CheckinLogMapper;
  let userMapper: UserMapper;

  beforeEach(() => {
    userMapper = new UserMapper();
    checkinLogMapper = new CheckinLogMapper(userMapper);
  });

  it('should map Prisma CheckinLog to DTO correctly', () => {
    const mockPrismaCheckinLog = {
      id: 'log1',
      userId: 'user1',
      eventId: 'event1',
      type: 'CHECKIN',
      timestamp: new Date('2024-01-01T10:00:00Z'),
      location: 'Main Hall',
      notes: 'Test checkin',
      user: {
        id: 'user1',
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
        id: 'event1',
        name: 'Test Event',
        description: 'Test Description',
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T12:00:00Z',
        location: 'Test Location',
        maxCapacity: 100,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        clubId: 'club1',
      },
    };

    const result = checkinLogMapper.mapPrismaCheckinLogToDto(mockPrismaCheckinLog);

    // Test that the basic fields are mapped correctly
    expect(result.id).toBe('log1');
    expect(result.userId).toBe('user1');
    expect(result.eventId).toBe('event1');
    expect(result.type).toBe(CheckinType.CHECKIN);
    expect(result.timestamp).toEqual(new Date('2024-01-01T10:00:00Z'));
    expect(result.location).toBe('Main Hall');
    expect(result.notes).toBe('Test checkin');

    // Test that the action getter works correctly
    expect(result.action).toBe('CHECKIN');
    expect(result.action).toBe(CheckinType.CHECKIN);

    // Test that relations are mapped
    expect(result.user).toBeDefined();
    expect(result.user.firstName).toBe('John');
    expect(result.user.lastName).toBe('Doe');
    expect(result.event).toBeDefined();
    expect(result.event.name).toBe('Test Event');
  });

  it('should handle CHECKOUT type correctly', () => {
    const mockPrismaCheckinLog = {
      id: 'log2',
      userId: 'user2',
      eventId: 'event2',
      type: 'CHECKOUT',
      timestamp: new Date('2024-01-01T11:00:00Z'),
      location: null,
      notes: null,
      user: {
        id: 'user2',
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
        id: 'event2',
        name: 'Test Event 2',
        description: 'Test Description 2',
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T12:00:00Z',
        location: 'Test Location 2',
        maxCapacity: 50,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        clubId: 'club2',
      },
    };

    const result = checkinLogMapper.mapPrismaCheckinLogToDto(mockPrismaCheckinLog);

    expect(result.type).toBe(CheckinType.CHECKOUT);
    expect(result.action).toBe('CHECKOUT');
    expect(result.action).toBe(CheckinType.CHECKOUT);
    expect(result.location).toBeNull();
    expect(result.notes).toBeNull();
  });
});