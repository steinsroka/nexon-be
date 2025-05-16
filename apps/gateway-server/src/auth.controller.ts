import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterRequestDto, RegisterResponseDto } from '@lib/dtos/auth.dto';
import { firstValueFrom } from 'rxjs';

import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Serializer } from '@lib/interceptors';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly userServiceClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: '사용자 회원가입' })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 (이메일 중복 등)' })
  @Serializer(RegisterResponseDto)
  async register(
    @Body() registerRequestDto: RegisterRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResponseDto> {
    console.log('here1');
    const registerResponseDto: RegisterResponseDto = await firstValueFrom(
      this.userServiceClient.send('auth_register', registerRequestDto),
    );

    console.log('registerResponseDto', registerResponseDto);

    const isSecureCookie =
      this.configService.get<string>('NODE_ENV') === 'production';
    const domain = this.configService.get<string>('COOKIE_DOMAIN');

    res.cookie('refresh_token', registerResponseDto.refreshToken, {
      httpOnly: true, // 자바스크립트에서 쿠키에 접근할 수 없도록
      secure: isSecureCookie, // HTTPS에서만 쿠키 전송
      sameSite: 'strict', // CSRF 방지
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1일 (밀리초)
      path: '/auth/refresh', // 이 경로에서만 쿠키 사용
      ...(domain && { domain }), // 도메인이 있을 경우에만 설정
    });

    return registerResponseDto;
  }
}
