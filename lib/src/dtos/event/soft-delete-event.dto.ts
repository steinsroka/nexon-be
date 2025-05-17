import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDateString } from 'class-validator';
import { EventDto } from './event.dto';

export class SoftDeleteEventResponseDto extends EventDto {
  @ApiProperty({
    example: '2025-05-01T00:00:00.000Z',
    description: '삭제된 일자',
  })
  @IsDateString()
  @Expose()
  @Type(() => Date)
  declare deletedAt: Date;
}
