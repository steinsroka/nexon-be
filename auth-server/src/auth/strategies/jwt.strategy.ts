import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserDto } from 'src/user/dtos/user.dto';
import { UserService } from '../../user/user.service';
import { JwtPayloadDto } from '../dtos/jwt-payload.dto';

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
      const user = await this.userService.findOneById(payload.sub);

      return plainToClass(UserDto, user);
    } catch (error) {
      throw new UnauthorizedException('접근 권한이 없습니다', error);
    }
  }
}
