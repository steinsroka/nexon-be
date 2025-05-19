import { EventConditionType } from '@lib/enums/event-condition-type-enum';
import { EventStatusType } from '@lib/enums/event-status-type.enum';
import { RewardType } from '@lib/enums/reward-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CreateRewardRequestDto } from '../reward/create-reward.dto';
import { ConditionDto, EventDto } from './event.dto';

export class CreateEventRequestDto {
  @ApiProperty({
    example: '이벤트 이름',
    description: '이벤트 이름',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '이벤트 설명',
    description: '이벤트 설명',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '2025-05-01T00:00:00.000Z',
    description: '이벤트 시작 일자',
    type: Date,
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    example: '2025-05-31T00:00:00.000Z',
    description: '이벤트 종료 일자',
    type: Date,
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({
    example: 'ACTIVE',
    description: '이벤트 상태',
    enum: EventStatusType,
  })
  @IsEnum(EventStatusType)
  @IsNotEmpty()
  status: EventStatusType;

  @ApiProperty({
    example: [
      {
        type: EventConditionType.USER_INVITE,
        metadata: { inviteCount: 1 },
        description: '조건 설명',
      },
    ],
    description: '이벤트 조건',
    type: [ConditionDto],
  })
  @IsNotEmpty()
  conditions: ConditionDto[];

  @ApiProperty({
    example: [
      {
        eventId: '64a78e6e5d32a83d8a0d3f4c',
        type: RewardType.POINT,
        itemId: 'itemId',
        quantity: 100,
        description: '보상 설명',
      },
    ],
    description: '이벤트 보상',
    type: [CreateRewardRequestDto],
  })
  @IsNotEmpty()
  rewards: CreateRewardRequestDto[];
}

export class CreateEventResponseDto extends EventDto {}
