import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { UserDto } from 'src/user/dtos/user.dto';
import {
  EMAIL_REGEX_INVALID,
  PASSWORD_MIN_LEN,
  PASSWORD_MAX_LEN,
  PASSWORD_LENGTH_INVALID,
  PASSWORD_REGEX,
  PASSWORD_REGEX_INVALID,
} from './register.dto';

export class LoginRequestDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '사용자 이메일 주소',
  })
  @IsEmail({}, { message: EMAIL_REGEX_INVALID })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123!',
    description: '사용자 비밀번호',
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
}

export class LoginResponseDto {
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
  @Expose()
  @Type(() => UserDto)
  user: UserDto;
}
