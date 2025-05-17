import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { RewardDto } from './reward.dto';

export class CreateRewardRequestDto {
  @ApiProperty({
    example: 'POINT',
    description: '보상 타입',
  })
  @IsString() // TODO: enum으로 변경
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: 100,
    description: '보상 값',
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

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
  @IsNotEmpty()
  description: string;
}
export class CreateRewardResponseDto extends RewardDto {} // TODO: Event, Reward모두 출력가능한 객체로 리턴
