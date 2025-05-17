import { ConditionDto, EventDto } from './event.dto';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RewardDto } from '../reward/reward.dto';

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
  })
  @IsString()
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    example: '2025-05-31T00:00:00.000Z',
    description: '이벤트 종료 일자',
  })
  @IsString()
  @IsNotEmpty()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({
    example: 'ACTIVE',
    description: '이벤트 상태',
    enum: ['ACTIVE', 'INACTIVE'],
  })
  @IsString()
  @IsNotEmpty()
  status: string;
  conditions: ConditionDto[]; // TODO: import 위치 수정
  rewards: RewardDto[]; // TODO: import 위치 수정
}

export class CreateEventResponseDto extends EventDto {}
