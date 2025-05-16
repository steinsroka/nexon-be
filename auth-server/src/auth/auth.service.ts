import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import { UserDto } from 'src/user/dtos/user.dto';
import { UserService } from 'src/user/user.service';
import { JwtPayloadDto } from './dtos/jwt-payload.dto';
import { LoginRequestDto } from './dtos/login.dto';
import { AuthActant } from './decorators/actant.decorator';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(req: {
    email: string;
    password: string;
    checkPassword: string;
    name: string;
  }): Promise<{ user: UserDto; accessToken: string; refreshToken: string }> {
    const user = await this.userService.createUser(req);

    const payload: JwtPayloadDto = {
      iss: this.configService.get<string>('JWT_ISSUER', 'nexon-auth-server'),
      sub: user._id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    await this.userService.updateRefreshToken(
      user._id.toString(),
      refreshToken,
    );

    // this.setRefreshTokenCookie(res, refreshToken);

    const userDto = plainToInstance(UserDto, user);
    return { user: userDto, accessToken, refreshToken };
  }

  async login(
    loginDto: LoginRequestDto,
    res: Response,
  ): Promise<{ user: UserDto; accessToken: string }> {
    // TODO: 이미 로그인되어있는 유저가 다시 로그인 시도할 경우에 대한 처리
    const user = await this.userService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    const payload: JwtPayloadDto = {
      iss: this.configService.get<string>('JWT_ISSUER', 'nexon-auth-server'),
      sub: user._id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    await this.userService.updateRefreshToken(
      user._id.toString(),
      refreshToken,
    );

    this.setRefreshTokenCookie(res, refreshToken);

    const userDto = plainToInstance(UserDto, user);
    return { user: userDto, accessToken };
  }

  async refresh(
    refreshToken: string,
    res: Response,
  ): Promise<{ accessToken: string }> {
    // TODO: 리프레시 토큰이 만료된 경우에 대한 처리
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const user = await this.userService.findOneById(payload.sub.toString());

      const newPayload: JwtPayloadDto = {
        iss: this.configService.get<string>('JWT_ISSUER', 'nexon-auth-server'),
        sub: user.id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
      };

      const accessToken = this.createAccessToken(newPayload);
      const newRefreshToken = this.createRefreshToken(newPayload);

      await this.userService.updateRefreshToken(
        user.id.toString(),
        newRefreshToken,
      );

      this.setRefreshTokenCookie(res, newRefreshToken);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException(
        `유효하지 않은 리프레시 토큰입니다 ${error.message}`,
      );
    }
  }

  async logout(
    actant: AuthActant,
    res: Response,
  ): Promise<{ success: boolean }> {
    const user = actant.user;
    await this.userService.removeRefreshToken(user.id);

    res.clearCookie('refresh_token');

    return { success: true };
  }

  private createAccessToken(payload: JwtPayloadDto): string {
    return this.jwtService.sign(payload, {
      algorithm: 'HS512',
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
    });
  }

  private createRefreshToken(payload: JwtPayloadDto): string {
    return this.jwtService.sign(payload, {
      algorithm: 'HS512',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });
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
