import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LogoutResponseDto {
  @ApiProperty({
    example: '로그아웃 성공',
    description: '로그아웃 결과',
  })
  @Expose()
  success: boolean;
}
