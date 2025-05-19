import { LoginRequestDto } from '@lib/dtos/auth/login.dto';
import {
  RegisterRequestDto,
  RegisterResponseDto,
} from '@lib/dtos/auth/register.dto';
import { UserDto } from '@lib/dtos/user/user.dto';
import { UserActivityType } from '@lib/enums/user-activity-type-enum';
import {
  DEFAULT_JWT_ACCESS_EXPIRES,
  DEFAULT_JWT_ISSUER,
  DEFAULT_JWT_REFRESH_EXPIRES,
  JWT_ALGORITHM,
} from '@lib/constants/auth.constant';
import { ERROR_INVITEE_NOT_FOUND } from '@lib/msgs/auth.msg';
import { JwtPayload } from '@lib/types';
import { AuthActant } from '@lib/types/actant.type';
import { RpcExceptionUtil } from '@lib/utils/rpc-exception.util';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { UserActivityService } from '../user-activity/user-activity.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userActivityService: UserActivityService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(req: {
    registerRequestDto: RegisterRequestDto;
  }): Promise<RegisterResponseDto> {
    const user = await this.userService.createUser(req);

    const payload: JwtPayload = {
      iss: this.configService.get<string>('JWT_ISSUER', DEFAULT_JWT_ISSUER),
      sub: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    await this.userService.updateRefreshToken(user.id.toString(), refreshToken);

    if (req.registerRequestDto.inviteeEmail) {
      const invitee = await this.userService.findOneByEmail(
        req.registerRequestDto.inviteeEmail,
      );

      if (!invitee) {
        throw RpcExceptionUtil.notFound(ERROR_INVITEE_NOT_FOUND);
      }

      await this.userActivityService.createUserActivity({
        userId: invitee.id,
        createUserActivityRequestDto: {
          type: UserActivityType.USER_INVITE,
        },
      });
    }

    await this.userActivityService.createUserActivity({
      userId: user.id.toString(),
      createUserActivityRequestDto: {
        type: UserActivityType.LOGIN,
      },
    });

    const userDto = plainToInstance(UserDto, user);

    return plainToInstance(RegisterResponseDto, {
      user: userDto,
      accessToken,
      refreshToken,
    });
  }

  async login(req: {
    loginRequestDto: LoginRequestDto;
  }): Promise<{ user: UserDto; accessToken: string; refreshToken: string }> {
    const { email, password } = req.loginRequestDto;
    const userDto = await this.userService.validateUser(email, password);

    const payload: JwtPayload = {
      iss: this.configService.get<string>('JWT_ISSUER', DEFAULT_JWT_ISSUER),
      sub: userDto.id,
      email: userDto.email,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    await this.userService.updateRefreshToken(
      userDto.id.toString(),
      refreshToken,
    );

    // NOTE: 정책에 따라 로그인 기록 간격 추가 필요
    await this.userActivityService.createUserActivity({
      userId: userDto.id.toString(),
      createUserActivityRequestDto: {
        type: UserActivityType.LOGIN,
      },
    });

    return { user: userDto, accessToken, refreshToken };
  }

  async refresh(req: {
    refreshToken: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = req;

    // JWT 토큰 검증
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      ignoreExpiration: false,
    });

    const user = await this.userService.findOneById(payload.sub.toString());

    if (!user.refreshToken) {
      throw RpcExceptionUtil.unauthorized(
        '로그아웃 상태입니다. 다시 로그인해주세요.',
        'LOGGED_OUT_USER',
      );
    }

    const newPayload: JwtPayload = {
      iss: this.configService.get<string>('JWT_ISSUER', DEFAULT_JWT_ISSUER),
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
  }

  async logout(req: { actant: AuthActant }): Promise<{ success: boolean }> {
    const user = req.actant.user;

    await this.userService.removeRefreshToken(user.id);

    return { success: true };
  }

  private createAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      algorithm: JWT_ALGORITHM,
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_ACCESS_EXPIRES_IN',
        DEFAULT_JWT_ACCESS_EXPIRES,
      ),
    });
  }

  private createRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      algorithm: JWT_ALGORITHM,
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
        DEFAULT_JWT_REFRESH_EXPIRES,
      ),
    });
  }
}
