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
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { REQUEST } from '@nestjs/core';
import { Response } from 'express';
import { BaseGatewayService } from './base-gateway.service';

@Injectable()
export class AuthGatewayService extends BaseGatewayService {
  constructor(
    @Inject(MicroServiceType.AUTH_SERVER)
    protected readonly authServiceClient: ClientProxy,
    @Inject(REQUEST) protected readonly request: Request,
    private readonly configService: ConfigService,
  ) {
    super(authServiceClient, request);
  }

  async register(
    registerRequestDto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    return this.sendRequest<RegisterResponseDto>('auth_register', {
      registerRequestDto,
    });
  }

  async login(loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.sendRequest<LoginResponseDto>('auth_login', {
      loginRequestDto,
    });
  }

  async refresh(refreshToken: string): Promise<RefreshResponseDto> {
    return this.sendRequest<RefreshResponseDto>('auth_refresh', {
      refreshToken,
    });
  }

  async logout(actant: AuthActant): Promise<LogoutResponseDto> {
    return this.sendRequest<LogoutResponseDto>('auth_logout', { actant });
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
