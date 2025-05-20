import { UserActivityType } from '@lib/enums/user-activity-type-enum';
import { ActivityMetadata } from '@lib/types/activity-metadata.type';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class UserActivityDto {
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
    description: '유저 아이디',
  })
  @Expose()
  userId: string;

  @ApiProperty({
    example: UserActivityType.LOGIN,
    description: '유저 활동 타입',
    enum: UserActivityType,
  })
  @Expose()
  type: UserActivityType;

  @ApiProperty({
    description: '유저 활동 값',
  })
  @Expose()
  metadata: ActivityMetadata;

  @ApiProperty({
    example: '2025-05-01T00:00:00.000Z',
    description: '유저 활동 생성 일자',
  })
  @Expose()
  createdAt: Date;
}
