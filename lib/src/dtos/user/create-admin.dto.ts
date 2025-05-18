import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { UserDto } from './user.dto';
import {
  NAME_MAX_LEN,
  NAME_MIN_LEN,
  PASSWORD_MAX_LEN,
  PASSWORD_MIN_LEN,
  PASSWORD_REGEX,
} from '@lib/constants';
import {
  EMAIL_REGEX_INVALID,
  NAME_LENGTH_INVALID,
  PASSWORD_LENGTH_INVALID,
  PASSWORD_REGEX_INVALID,
} from '@lib/msgs';

export const ROLE_INVALID = '유효하지 않은 역할입니다.';

export class CreateAdminRequestDto {
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
}

export class CreateAdminResponseDto extends UserDto {}
