import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from 'express';
import { RefreshResponseDto } from '@lib/dtos/auth/refresh.dto';
import { LoginRequestDto, LoginResponseDto } from '@lib/dtos/auth/login.dto';
import {
  RegisterRequestDto,
  RegisterResponseDto,
} from '@lib/dtos/auth/register.dto';
import { AuthActant } from '@lib/types/actant.type';
import { BaseService } from './base.service';
import { LogoutResponseDto } from '@lib/dtos/auth/logout.dto';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    super(authServiceClient);
  }

  async register(
    registerRequestDto: RegisterRequestDto,
    res: Response,
  ): Promise<RegisterResponseDto> {
    const resp = await this.sendRequest<RegisterResponseDto>(
      'auth_register',
      registerRequestDto,
    );

    this.setRefreshTokenCookie(res, resp.refreshToken);

    return resp;
  }

  async login(
    loginRequestDto: LoginRequestDto,
    res: Response,
  ): Promise<LoginResponseDto> {
    const resp = await this.sendRequest<LoginResponseDto>(
      'auth_login',
      loginRequestDto,
    );

    this.setRefreshTokenCookie(res, resp.refreshToken);

    return resp;
  }

  async refresh(
    refreshToken: string,
    res: Response,
  ): Promise<RefreshResponseDto> {
    const resp = await this.sendRequest<RefreshResponseDto>(
      'auth_refresh',
      refreshToken,
    );

    this.setRefreshTokenCookie(res, resp.refreshToken);

    return resp;
  }

  async logout(actant: AuthActant, res: Response): Promise<LogoutResponseDto> {
    const resp = await this.sendRequest<LogoutResponseDto>(
      'auth_logout',
      actant,
    );

    res.clearCookie('refresh_token');

    return resp;
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    const isSecureCookie =
      this.configService.get<string>('NODE_ENV') === 'production';
    const domain = this.configService.get<string>('COOKIE_DOMAIN');

    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: isSecureCookie,
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1일 (밀리초)
      path: '/auth/refresh',
      ...(domain && { domain }),
    });
  }
}
