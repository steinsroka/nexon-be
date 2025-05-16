import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { UserDto } from '../../user/dtos/user.dto';

export const PASSWORD_MIN_LEN = 8;
export const PASSWORD_MAX_LEN = 20;
export const PASSWORD_REGEX =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
export const EMAIL_REGEX_INVALID = '이메일 형식이 올바르지 않습니다.';
export const PASSWORD_REGEX_INVALID =
  '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.';
export const PASSWORD_LENGTH_INVALID = '비밀번호는 8~20자 사이여야 합니다.';
export const NAME_MIN_LEN = 2;
export const NAME_MAX_LEN = 20;
export const NAME_LENGTH_INVALID = '이름은 2~20자 사이여야 합니다.';

export class RegisterRequestDto {
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
    example: 'password123!',
    description: '비밀번호 재입력',
  })
  @IsString()
  @Length(PASSWORD_MIN_LEN, PASSWORD_MAX_LEN, {
    message: PASSWORD_REGEX_INVALID,
  })
  @Matches(PASSWORD_REGEX, {
    message: PASSWORD_REGEX_INVALID,
  })
  @IsNotEmpty()
  checkPassword: string;

  @ApiProperty({
    example: '홍길동',
    description: '이름',
    required: false,
  })
  @IsString()
  @Length(NAME_MIN_LEN, NAME_MAX_LEN, {
    message: NAME_LENGTH_INVALID,
  })
  @IsNotEmpty()
  name: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access 토큰',
  })
  @Expose()
  accessToken: string;

  @ApiProperty({
    example: {
      id: '64a78e6e5d32a83d8a0d3f4c',
      email: 'user@example.com',
      name: '홍길동',
      role: 'USER',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    description: '사용자 정보',
  })
  @Type(() => UserDto)
  @Expose()
  user: UserDto;
}
