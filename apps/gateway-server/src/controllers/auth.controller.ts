import { Actant } from '@lib/decorators';
import { Cookies } from '@lib/decorators/cookie.decorator';
import { LoginRequestDto, LoginResponseDto } from '@lib/dtos/auth/login.dto';
import { RefreshResponseDto } from '@lib/dtos/auth/refresh.dto';
import {
  RegisterRequestDto,
  RegisterResponseDto,
} from '@lib/dtos/auth/register.dto';
import { REFRESH_TOKEN_COOKIE_NAME } from '@lib/constants/auth.constant';
import { Serializer } from '@lib/interceptors';
import { AuthActant } from '@lib/types/actant.type';
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthGatewayService } from '../services/auth-gateway.service';
import { LogoutResponseDto } from '@lib/dtos/auth/logout.dto';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authGatewayService: AuthGatewayService,
    private readonly tokenBlacklistService: TokenBlacklistService,
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
    const resp = await this.authGatewayService.register(registerRequestDto);

    this.authGatewayService.setRefreshTokenCookie(res, resp.refreshToken);
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
    const resp = await this.authGatewayService.login(loginRequestDto);

    this.authGatewayService.setRefreshTokenCookie(res, resp.refreshToken);
    return resp;
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiCookieAuth(REFRESH_TOKEN_COOKIE_NAME)
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
  })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  async refresh(
    @Cookies(REFRESH_TOKEN_COOKIE_NAME) refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResponseDto> {
    // 토큰이 블랙리스트에 있는지 확인
    const isBlacklisted =
      await this.tokenBlacklistService.isBlacklisted(refreshToken);

    if (isBlacklisted) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다');
    }

    const resp = await this.authGatewayService.refresh(refreshToken);

    await this.tokenBlacklistService.addToBlacklist(refreshToken);

    this.authGatewayService.setRefreshTokenCookie(res, resp.refreshToken);
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
    @Req() req: Request,
    @Cookies(REFRESH_TOKEN_COOKIE_NAME) refreshToken?: string,
  ): Promise<LogoutResponseDto> {
    const authorization = req.headers.authorization;
    const resp = await this.authGatewayService.logout(actant);

    // 액세스 토큰을 블랙리스트에 추가
    if (authorization) {
      console.log(authorization);
      const token = authorization.split(' ')[1]; // Bearer 토큰에서 실제 토큰 부분만 추출

      if (token) {
        await this.tokenBlacklistService.addToBlacklist(token);
      }
    }

    if (refreshToken) {
      await this.tokenBlacklistService.addToBlacklist(refreshToken);
    }

    this.authGatewayService.clearRefreshTokenCookie(res);
    return resp;
  }
}
