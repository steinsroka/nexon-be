import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { UserService } from '../user/user.service';
import { JwtPayload } from '@lib/types';
import { AuthActant } from '@lib/types/actant.type';
import { UserDto } from '@lib/dtos/user/user.dto';

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

    const payload: JwtPayload = {
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

    const userDto = plainToInstance(UserDto, user);
    return { user: userDto, accessToken, refreshToken };
  }

  async login(req: {
    email: string;
    password: string;
  }): Promise<{ user: UserDto; accessToken: string; refreshToken: string }> {
    const { email, password } = req;
    // TODO: 이미 로그인되어있는 유저가 다시 로그인 시도할 경우에 대한 처리
    const user = await this.userService.validateUser(email, password);

    const payload: JwtPayload = {
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

    const userDto = plainToInstance(UserDto, user);

    return { user: userDto, accessToken, refreshToken };
  }

  async refresh(req: {
    refreshToken: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = req;
    // TODO: 리프레시 토큰이 만료된 경우에 대한 처리
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const user = await this.userService.findOneById(payload.sub.toString());

      const newPayload: JwtPayload = {
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

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException(
        `유효하지 않은 리프레시 토큰입니다 ${error.message}`,
      );
    }
  }

  async logout(actant: AuthActant): Promise<{ success: boolean }> {
    const user = actant.user;
    await this.userService.removeRefreshToken(user.id);

    return { success: true };
  }

  private createAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      algorithm: 'HS512',
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
    });
  }

  private createRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      algorithm: 'HS512',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });
  }
}
