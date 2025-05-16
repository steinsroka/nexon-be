import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { JwtPayloadDto } from '../dtos/jwt-payload.dto';
import { UserDto } from '../../user/dtos/user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET', 'default_jwt_secret'),
    });
  }

  async validate(payload: JwtPayloadDto): Promise<UserDto> {
    try {
      if (!payload || !payload.sub) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다');
      }

      const user = await this.userService.findOneById(payload.sub);

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
