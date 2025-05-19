import { EventStatusType } from '@lib/enums/event-status-type.enum';
import { ApiProperty } from '@nestjs/swagger';

import { Expose, Transform, Type } from 'class-transformer';
import { RewardDto } from '../reward/reward.dto';
import { EventConditionType } from '@lib/enums/event-condition-type-enum';
import { ConditionMetadata } from '@lib/types/condition-metadata.type';

export class ConditionDto {
  @ApiProperty({
    example: EventConditionType.USER_INVITE,
    description: '조건 유형',
    enum: EventConditionType,
  })
  @Expose()
  type: EventConditionType;

  @ApiProperty({
    example: { consecutiveDays: 1 },
    description: '조건 값',
  })
  @Expose()
  metadata: ConditionMetadata;

  @ApiProperty({
    example: '조건 설명',
    description: '조건 설명',
  })
  @Expose()
  description: string;
}

export class EventDto {
  @ApiProperty({
    example: '64a78e6e5d32a83d8a0d3f4c',
    description: '사용자 고유 ID (MongoDB ObjectId)',
  })
  @Expose()
  @Transform(({ obj, value }) => {
    if (obj?._id) {
      return obj._id.toString();
    } else if (obj?.id) {
      return typeof obj.id === 'object' ? obj.id.toString() : obj.id;
    } else if (value) {
      return typeof value === 'object' ? value.toString() : value;
    }
    return null;
  })
  id: string;

  @ApiProperty({
    example: '이벤트 이름',
    description: '이벤트 이름',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: '이벤트 설명',
    description: '이벤트 설명',
  })
  @Expose()
  description: string;

  @ApiProperty({
    example: '2025-05-01T00:00:00.000Z',
    description: '이벤트 시작 일자',
  })
  @Type(() => Date)
  @Expose()
  startDate: Date;

  @ApiProperty({
    example: '2025-05-31T00:00:00.000Z',
    description: '이벤트 종료 일자',
  })
  @Expose()
  endDate: Date;

  @ApiProperty({
    example: 'ACTIVE',
    description: '이벤트 상태',
    enum: EventStatusType,
  })
  @Expose()
  status: EventStatusType;

  @ApiProperty({
    example: [
      {
        type: EventConditionType.USER_INVITE,
        metadata: { consecutiveDays: 1 },
        description: '조건 설명',
      },
    ],
    description: '이벤트 조건',
  })
  @Type(() => ConditionDto)
  @Expose()
  conditions: ConditionDto[];

  @ApiProperty({
    example: '64a78e6e5d32a83d8a0d3f4c',
    description: '이벤트 생성자 ID (MongoDB ObjectId)',
  })
  @Expose()
  createdBy: string;

  @ApiProperty({
    example: '2025-05-01T00:00:00.000Z',
    description: '이벤트 생성 일자',
  })
  @Type(() => Date)
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2025-05-01T00:00:00.000Z',
    description: '이벤트 수정 일자',
  })
  @Type(() => Date)
  @Expose()
  updatedAt: Date | null;

  @ApiProperty({
    example: '2025-05-01T00:00:00.000Z',
    description: '이벤트 삭제 일자',
  })
  @Type(() => Date)
  @Expose()
  deletedAt: Date | null;
}

export class EventSummaryDto extends EventDto {
  @ApiProperty({
    example: [
      {
        type: 'POINT',
        value: 100,
        description: '보상 설명',
      },
    ],
    description: '이벤트 보상',
  })
  @Expose()
  @Type(() => RewardDto)
  rewards: RewardDto[];
}
