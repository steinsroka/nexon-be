import {
  REFRESH_TOKEN_COOKIE_MAX_AGE,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_PATH,
} from '@lib/constants/auth.constant';
import { LoginRequestDto, LoginResponseDto } from '@lib/dtos/auth/login.dto';
import { LogoutResponseDto } from '@lib/dtos/auth/logout.dto';
import { RefreshResponseDto } from '@lib/dtos/auth/refresh.dto';
import {
  RegisterRequestDto,
  RegisterResponseDto,
} from '@lib/dtos/auth/register.dto';
import { MicroServiceType } from '@lib/enums/microservice.enum';
import { AuthActant } from '@lib/types/actant.type';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { REQUEST } from '@nestjs/core';
import { Response } from 'express';
import { BaseGatewayService } from './base.service';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService extends BaseGatewayService {
  constructor(
    @Inject(MicroServiceType.AUTH_SERVER)
    protected readonly authServiceClient: ClientProxy,
    @Inject(REQUEST) protected readonly request: Request,
    private readonly configService: ConfigService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {
    super(authServiceClient, request);
  }

  async register(
    registerRequestDto: RegisterRequestDto,
    res: Response,
  ): Promise<RegisterResponseDto> {
    const resp = await this.sendRequest<RegisterResponseDto>('auth_register', {
      registerRequestDto,
    });

    this.setRefreshTokenCookie(res, resp.refreshToken);

    return resp;
  }

  async login(
    loginRequestDto: LoginRequestDto,
    res: Response,
  ): Promise<LoginResponseDto> {
    const resp = await this.sendRequest<LoginResponseDto>('auth_login', {
      loginRequestDto,
    });

    this.setRefreshTokenCookie(res, resp.refreshToken);

    return resp;
  }

  async refresh(
    refreshToken: string,
    res: Response,
  ): Promise<RefreshResponseDto> {
    const isBlacklisted =
      await this.tokenBlacklistService.isBlacklisted(refreshToken);

    if (isBlacklisted) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다');
    }

    const resp = await this.sendRequest<RefreshResponseDto>('auth_refresh', {
      refreshToken,
    });

    await this.tokenBlacklistService.addToBlacklist(refreshToken);

    this.setRefreshTokenCookie(res, resp.refreshToken);

    return resp;
  }

  async logout(
    actant: AuthActant,
    res: Response,
    authorization?: string,
    refreshToken?: string,
  ): Promise<LogoutResponseDto> {
    const resp = await this.sendRequest<LogoutResponseDto>('auth_logout', {
      actant,
    });

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

    this.clearRefreshTokenCookie(res);

    return resp;
  }

  setRefreshTokenCookie(res: Response, token: string): void {
    const isSecureCookie =
      this.configService.get<string>('NODE_ENV') === 'production';
    const domain = this.configService.get<string>('COOKIE_DOMAIN');

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isSecureCookie,
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
      path: REFRESH_TOKEN_COOKIE_PATH,
      ...(domain && { domain }),
    });
  }

  clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
  }

  protected getServiceType(): MicroServiceType {
    return MicroServiceType.AUTH_SERVER;
  }
}
