import { UserDto } from '@lib/dtos/user/user.dto';
import { JwtPayload } from '@lib/types';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET', 'default_jwt_secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<UserDto> {
    try {
      if (!payload || !payload.sub) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다');
      }

      // const user = await this.userServiceClient.findOneById(payload.sub);
      console.log('here');
      const user: UserDto = await firstValueFrom(
        this.userServiceClient.send('user_find_one_by_id', payload.sub),
      );

      if (!user) {
        throw new UnauthorizedException('존재하지 않는 사용자입니다');
      }

      const userDto = plainToInstance(UserDto, user);

      return userDto;
    } catch (error) {
      console.error('[JwtStrategy.validate] error:', error); // TODO: logger
      throw new UnauthorizedException('접근 권한이 없습니다');
    }
  }
}
