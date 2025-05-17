import { EventStatusType } from '@lib/enums/event-status-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  Condition,
  Reward,
} from 'apps/event-server/src/event/schemas/event.schemas';
import { Expose, Transform } from 'class-transformer';

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
        type: 'POINT',
        value: 100,
        description: '조건 설명',
      },
    ],
    description: '이벤트 조건',
  })
  @Expose()
  conditions: Condition[];

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
  rewards: Reward[];

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
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2025-05-01T00:00:00.000Z',
    description: '이벤트 수정 일자',
  })
  @Expose()
  updatedAt: Date | null;

  @ApiProperty({
    example: '2025-05-01T00:00:00.000Z',
    description: '이벤트 삭제 일자',
  })
  deletedAt: Date | null;
}

export class ConditionDto {
  @ApiProperty({
    example: 'POINT',
    description: '조건 타입',
  })
  @Expose()
  type: string;

  @ApiProperty({
    example: 100,
    description: '조건 값',
  })
  @Expose()
  value: number;

  @ApiProperty({
    example: '조건 설명',
    description: '조건 설명',
  })
  @Expose()
  description: string;
}

export class RewardDto {
  @ApiProperty({
    example: 'POINT',
    description: '보상 타입',
  })
  @Expose()
  type: string;

  @ApiProperty({
    example: 100,
    description: '보상 값',
  })
  @Expose()
  value: number;

  @ApiProperty({
    example: '보상 설명',
    description: '보상 설명',
  })
  @Expose()
  description: string;
}
