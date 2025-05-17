import {
  RegisterRequestDto,
  RegisterResponseDto,
} from '@lib/dtos/auth/register.dto';
import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Serializer } from '@lib/interceptors';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './services/auth.service';
import { LoginRequestDto, LoginResponseDto } from '@lib/dtos/auth/login.dto';
import { Cookies } from '@lib/decorators/cookie.decorator';
import { JwtAuthGuard } from '@lib/guards';
import { Actant } from '@lib/decorators';
import { AuthActant } from '@lib/types/actant.type';
import { RefreshResponseDto } from '@lib/dtos/auth/refresh.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
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
    return this.authService.register(registerRequestDto, res);
  }

  @Post('login')
  @ApiOperation({ summary: '사용자 로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Serializer(LoginResponseDto)
  async login(
    @Body() loginRequestDto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    return this.authService.login(loginRequestDto, res);
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiCookieAuth('refresh_token')
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
  })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  async refresh(
    @Cookies('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResponseDto> {
    return this.authService.refresh(refreshToken, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
  })
  async logout(
    @Actant() actant: AuthActant,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean }> {
    return this.authService.logout(actant, res);
  }
}
