import { EventStatusType } from '@lib/enums/event-status-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Condition } from 'apps/event-server/src/event/schemas/event.schema';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ConditionDto, EventDto } from './event.dto';

export class UpdateEventRequestDto {
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
    enum: ['ACTIVE', 'INACTIVE'],
  })
  @IsEnum(EventStatusType)
  @IsNotEmpty()
  status: EventStatusType;

  @ApiProperty({
    type: [Condition],
    description: '이벤트 조건',
  })
  @IsNotEmpty()
  @Type(() => ConditionDto)
  conditions: ConditionDto[];
}

export class UpdateEventResponseDto extends EventDto {}
