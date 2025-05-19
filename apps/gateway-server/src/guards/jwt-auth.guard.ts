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
    // JWT 전략 실행
    const canActivate = await super.canActivate(context);

    // JWT 검증이 통과한 경우에만 블랙리스트 검사 실행
    if (canActivate) {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);

      if (token) {
        // 블랙리스트에 있는 토큰인지 확인
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
