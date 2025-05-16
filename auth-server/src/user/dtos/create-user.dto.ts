import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { UserRoleType } from '../schemas/user.schema';
import {
  PASSWORD_MIN_LEN,
  PASSWORD_MAX_LEN,
  PASSWORD_REGEX,
  NAME_MIN_LEN,
  NAME_MAX_LEN,
  EMAIL_REGEX_INVALID,
  NAME_LENGTH_INVALID,
  PASSWORD_LENGTH_INVALID,
  PASSWORD_REGEX_INVALID,
} from 'src/auth/dtos/register.dto';

export const ROLE_INVALID = '유효하지 않은 역할입니다.';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '이메일',
  })
  @IsEmail({}, { message: EMAIL_REGEX_INVALID })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123!',
    description: '비밀번호',
  })
  @IsString()
  @Length(PASSWORD_MIN_LEN, PASSWORD_MAX_LEN, {
    message: PASSWORD_LENGTH_INVALID,
  })
  @Matches(PASSWORD_REGEX, {
    message: PASSWORD_REGEX_INVALID,
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: '홍길동',
    description: '이름',
  })
  @IsString()
  @Length(NAME_MIN_LEN, NAME_MAX_LEN, {
    message: NAME_LENGTH_INVALID,
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'USER',
    description: '사용자 역할 (관리자만 설정 가능)',
    enum: UserRoleType,
    required: false,
    default: UserRoleType.USER,
  })
  @IsEnum(UserRoleType, { message: ROLE_INVALID })
  @IsOptional()
  role?: UserRoleType;
}
