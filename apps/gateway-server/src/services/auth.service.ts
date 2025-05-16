import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import { RefreshResponseDto } from '@lib/dtos/auth/refresh.dto';
import { LoginRequestDto, LoginResponseDto } from '@lib/dtos/auth/login.dto';
import {
  RegisterRequestDto,
  RegisterResponseDto,
} from '@lib/dtos/auth/register.dto';
import { AuthActant } from '@lib/types/actant.type';

export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  async register(
    registerRequestDto: RegisterRequestDto,
    res: Response,
  ): Promise<RegisterResponseDto> {
    const registerResponseDto: RegisterResponseDto = await firstValueFrom(
      this.authServiceClient.send('auth_register', registerRequestDto),
    );

    this.setRefreshTokenCookie(res, registerResponseDto.refreshToken);

    return registerResponseDto;
  }

  async login(
    loginRequestDto: LoginRequestDto,
    res: Response,
  ): Promise<LoginResponseDto> {
    try {
      const loginResponseDto: LoginResponseDto = await firstValueFrom(
        this.authServiceClient.send('auth_login', loginRequestDto),
      );
      this.setRefreshTokenCookie(res, loginResponseDto.refreshToken);

      return loginResponseDto;
    } catch (error) {
      console.error('Error during login:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  async refresh(
    refreshToken: string,
    res: Response,
  ): Promise<RefreshResponseDto> {
    const refreshResponseDto: RefreshResponseDto = await firstValueFrom(
      this.authServiceClient.send('auth_refresh', refreshToken),
    );

    this.setRefreshTokenCookie(res, refreshResponseDto.refreshToken);

    return refreshResponseDto;
  }

  async logout(
    actant: AuthActant,
    res: Response,
  ): Promise<{ success: boolean }> {
    const payload: { success: boolean } = await firstValueFrom(
      this.authServiceClient.send('auth_logout', actant),
    );

    res.clearCookie('refresh_token');

    return payload;
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    const isSecureCookie =
      this.configService.get<string>('NODE_ENV') === 'production';
    const domain = this.configService.get<string>('COOKIE_DOMAIN');

    res.cookie('refresh_token', token, {
      httpOnly: true, // 자바스크립트에서 쿠키에 접근할 수 없도록
      secure: isSecureCookie, // HTTPS에서만 쿠키 전송
      sameSite: 'strict', // CSRF 방지
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1일 (밀리초)
      path: '/auth/refresh', // 이 경로에서만 쿠키 사용
      ...(domain && { domain }), // 도메인이 있을 경우에만 설정
    });
  }
}
