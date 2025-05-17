import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { RewardDto } from './reward.dto';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRewardRequestDto {
  @ApiProperty({
    example: 'POINT',
    description: '보상 타입',
  })
  @IsString() // TODO: enum으로 변경
  @IsNotEmpty()
  @Expose()
  type: string;

  @ApiProperty({
    example: 100,
    description: '보상 값',
  })
  @IsNotEmpty()
  @IsNumber()
  @Expose()
  value: number;

  @ApiProperty({
    example: '보상 설명',
    description: '보상 설명',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  description: string;
}
export class CreateRewardResponseDto extends RewardDto {}
