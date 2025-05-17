import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class RewardDto {
  @ApiProperty({
    example: '64a78e6e5d32a83d8a0d3f4c',
    description: '보상 고유 ID (MongoDB ObjectId)',
  })
  @Expose()
  @Transform(({ obj, value }) => {
    if (obj?._id) {
      return obj._id.toString();
    } else if (obj?.id) {
      return typeof obj.id === 'object' ? obj.id.toString() : obj.id;
    } else if (value) {
      return typeof value === 'object' ? value.toString() : value;
    }
    return null;
  })
  id: string;

  @ApiProperty({
    example: '64a78e6e5d32a83d8a0d3f4c',
    description: '이벤트 아이디',
  })
  @Expose()
  eventId: string;

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
  quantity: number;

  @ApiProperty({
    example: 100,
    description: '보상 값',
    required: false,
  })
  @Expose()
  itemId: number;

  @ApiProperty({
    example: '보상 설명',
    description: '보상 설명',
  })
  @Expose()
  description: string;
}
