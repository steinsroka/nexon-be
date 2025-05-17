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
  quantity?: number;

  @ApiProperty({
    example: '64a78e6e5d32a83d8a0d3f4c',
    description: '아이템 아이디',
    required: false,
  })
  @IsString()
  @IsOptional()
  itemId?: string;

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
