import { UserDto } from '@lib/dtos/user/user.dto';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenBlacklistService } from '../services/token-blacklist.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly tokenBlacklistService: TokenBlacklistService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    const canActivate = await super.canActivate(context);

    if (canActivate) {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);

      if (token) {
        const isBlacklisted =
          await this.tokenBlacklistService.isBlacklisted(token);

        if (isBlacklisted) {
          throw new UnauthorizedException('로그아웃된 토큰입니다');
        }
      }
    }

    return canActivate;
  }

  handleRequest<TUser = UserDto>(err: any, user: TUser, info: any): TUser {
    if (err) {
      throw err;
    }
    if (!user) {
      throw new UnauthorizedException('인증된 사용자가 없습니다');
    }

    return user;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;

    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');

    return type === 'Bearer' ? token : undefined;
  }
}
