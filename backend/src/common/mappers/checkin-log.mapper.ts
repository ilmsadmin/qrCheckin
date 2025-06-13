import { Injectable } from '@nestjs/common';
import { CheckinLog } from '../dto/checkin-log.dto';
import { CheckinType } from '../enums';
import { UserMapper } from './user.mapper';

@Injectable()
export class CheckinLogMapper {
  constructor(private userMapper: UserMapper) {}

  mapPrismaCheckinLogToDto(prismaCheckinLog: any): CheckinLog {
    const checkinLog = new CheckinLog();
    
    checkinLog.id = prismaCheckinLog.id;
    checkinLog.userId = prismaCheckinLog.userId;
    checkinLog.eventId = prismaCheckinLog.eventId;
    checkinLog.type = prismaCheckinLog.type as CheckinType;
    checkinLog.timestamp = prismaCheckinLog.timestamp;
    checkinLog.location = prismaCheckinLog.location;
    checkinLog.notes = prismaCheckinLog.notes;

    // Map relations if they exist
    if (prismaCheckinLog.user) {
      checkinLog.user = this.userMapper.mapPrismaUserToDto(prismaCheckinLog.user);
    }

    if (prismaCheckinLog.event) {
      checkinLog.event = prismaCheckinLog.event;
    }

    return checkinLog;
  }
}