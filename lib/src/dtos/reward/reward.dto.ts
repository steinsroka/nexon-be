import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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
