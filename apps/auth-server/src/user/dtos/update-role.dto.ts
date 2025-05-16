import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRoleType } from '../schemas/user.schema';
import { UserDto } from './user.dto';

export class UpdateRoleRequestDto {
  @ApiProperty({
    description: '변경할 사용자 역할',
    enum: UserRoleType,
    example: UserRoleType.OPERATOR,
  })
  @IsEnum(UserRoleType, { message: '유효하지 않은 역할입니다' })
  @IsNotEmpty()
  role: UserRoleType;
}

export class UpdateRoleResponseDto extends UserDto {}
