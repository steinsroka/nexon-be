import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { RewardDto } from './reward.dto';

export class UpdateRewardRequestDto {
  @ApiProperty({
    example: 'POINT',
    description: '보상 타입',
  })
  @IsString() // TODO: enum으로 변경
  @IsOptional()
  @Expose()
  type?: string;

  @ApiProperty({
    example: 100,
    description: '보상 값',
  })
  @IsOptional()
  @IsNumber()
  @Expose()
  value?: number;

  @ApiProperty({
    example: '보상 설명',
    description: '보상 설명',
  })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;
}
export class UpdateRewardResponseDto extends RewardDto {}
