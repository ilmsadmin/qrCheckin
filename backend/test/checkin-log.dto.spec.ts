import { CheckinLog } from '../src/common/dto/checkin-log.dto';
import { CheckinType } from '../src/common/enums';

describe('CheckinLog DTO', () => {
  it('should create a CheckinLog with proper field mapping', () => {
    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER' as any,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockEvent = {
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
    };

    const checkinLog = new CheckinLog();
    checkinLog.id = 'log1';
    checkinLog.userId = 'user1';
    checkinLog.eventId = 'event1';
    checkinLog.type = CheckinType.CHECKIN;
    checkinLog.timestamp = new Date();
    checkinLog.location = 'Main Hall';
    checkinLog.notes = 'Test checkin';
    checkinLog.user = mockUser;
    checkinLog.event = mockEvent;

    // Test that the 'action' field properly maps to 'type'
    expect(checkinLog.action).toBe(CheckinType.CHECKIN);
    expect(checkinLog.action).toBe('CHECKIN');
    
    // Test that all required fields are present
    expect(checkinLog.id).toBe('log1');
    expect(checkinLog.userId).toBe('user1');
    expect(checkinLog.eventId).toBe('event1');
    expect(checkinLog.location).toBe('Main Hall');
    expect(checkinLog.user).toEqual(mockUser);
    expect(checkinLog.event).toEqual(mockEvent);
  });

  it('should handle CHECKOUT type correctly', () => {
    const checkinLog = new CheckinLog();
    checkinLog.type = CheckinType.CHECKOUT;

    expect(checkinLog.action).toBe(CheckinType.CHECKOUT);
    expect(checkinLog.action).toBe('CHECKOUT');
  });
});