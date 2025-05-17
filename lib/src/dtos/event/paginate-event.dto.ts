import { EventStatusType } from '@lib/enums/event-status-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationParam } from '../common/pagination.dto';

export class PaginateEventsRequestDto extends PaginationParam {
  @ApiProperty({
    example: 'ACTIVE',
    description: '이벤트 상태',
    enum: ['ACTIVE', 'INACTIVE'],
  })
  @IsEnum(EventStatusType)
  @IsOptional()
  status?: EventStatusType;

  @ApiProperty({
    example: '2025-05-01T00:00:00.000Z',
    description: '이벤트 시작 일자',
  })
  @IsDateString()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({
    example: '2025-05-31T00:00:00.000Z',
    description: '이벤트 종료 일자',
  })
  @IsDateString()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({
    example: '이벤트 이름',
    description: '이벤트 이름',
  })
  @IsString()
  @IsOptional()
  name?: string;
}

export class PaginateEventsResponseDto {}
