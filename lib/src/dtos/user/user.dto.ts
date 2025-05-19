import { UserRoleType } from '@lib/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

export class UserDto {
  @ApiProperty({
    example: '64a78e6e5d32a83d8a0d3f4c',
    description: '사용자 고유 ID (MongoDB ObjectId)',
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
    example: 'user@nexon.com',
    description: '사용자 이메일 주소',
  })
  @Expose()
  email: string;

  @ApiProperty({
    example: '홍길동',
    description: '사용자 이름',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'USER',
    description: '사용자 역할',
    enum: UserRoleType,
  })
  @Expose()
  role: UserRoleType;

  @ApiProperty({
    example: 'example@nexon.com',
    description: '사용자 초대 이메일 주소',
  })
  @Expose()
  inviteeEmail: string | null;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '사용자 리프레시 토큰',
  })
  refreshToken: string | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: '사용자 생성 일자',
  })
  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: '사용자 정보 마지막 수정 일자',
  })
  @Expose()
  @Type(() => Date)
  updatedAt: Date;
}
