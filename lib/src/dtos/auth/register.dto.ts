import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import {
  NAME_MAX_LEN,
  NAME_MIN_LEN,
  PASSWORD_MAX_LEN,
  PASSWORD_MIN_LEN,
  PASSWORD_REGEX,
} from '../../constants';
import {
  EMAIL_REGEX_INVALID,
  NAME_LENGTH_INVALID,
  PASSWORD_LENGTH_INVALID,
  PASSWORD_REGEX_INVALID,
} from '../../msgs';
import { UserDto } from '../user/user.dto';

export class RegisterRequestDto {
  @ApiProperty({
    example: 'user@nexon.com',
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

  @ApiProperty({
    example: 'user@nexon.com',
    description: '초대한사람 email',
    required: false,
  })
  @IsEmail({}, { message: EMAIL_REGEX_INVALID })
  @IsOptional()
  inviteeEmail?: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access 토큰',
  })
  @Expose()
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh 토큰',
  })
  refreshToken: string;

  @ApiProperty({
    example: {
      id: '64a78e6e5d32a83d8a0d3f4c',
      email: 'user@nexon.com',
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
