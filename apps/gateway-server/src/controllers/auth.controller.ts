import { Actant } from '@lib/decorators';
import { Cookies } from '@lib/decorators/cookie.decorator';
import { LoginRequestDto, LoginResponseDto } from '@lib/dtos/auth/login.dto';
import { RefreshResponseDto } from '@lib/dtos/auth/refresh.dto';
import {
  RegisterRequestDto,
  RegisterResponseDto,
} from '@lib/dtos/auth/register.dto';
import { JwtAuthGuard } from '@lib/guards';
import { Serializer } from '@lib/interceptors';
import { AuthActant } from '@lib/types/actant.type';
import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { GatewayService } from './../gateway.service';
import { MicroServiceType } from '@lib/enums/microservice.enum';
import { LogoutResponseDto } from '@lib/dtos/auth/logout.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly gatewayService: GatewayService) {}

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
    const resp = await this.gatewayService.sendRequest<RegisterResponseDto>(
      MicroServiceType.AUTH_SERVICE,
      'auth_register',
      { registerRequestDto },
    );

    this.gatewayService.setRefreshTokenCookie(res, resp.refreshToken);

    return resp;
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
    const resp = await this.gatewayService.sendRequest<LoginResponseDto>(
      MicroServiceType.AUTH_SERVICE,
      'auth_login',
      { loginRequestDto },
    );

    this.gatewayService.setRefreshTokenCookie(res, resp.refreshToken);

    return resp;
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
    const resp = await this.gatewayService.sendRequest<LoginResponseDto>(
      MicroServiceType.AUTH_SERVICE,
      'auth_login',
      { refreshToken },
    );

    this.gatewayService.setRefreshTokenCookie(res, resp.refreshToken);

    return resp;
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
  ): Promise<LogoutResponseDto> {
    const resp = await this.gatewayService.sendRequest<LogoutResponseDto>(
      MicroServiceType.AUTH_SERVICE,
      'auth_login',
      { actant },
    );

    this.gatewayService.clearRefreshTokenCookie(res);

    return resp;
  }
}
