import { UserDto } from '@lib/dtos/user/user.dto';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest<TUser = UserDto>(err: any, user: TUser, info: any): TUser {
    if (err || !user) {
      throw new UnauthorizedException('인증된 사용자가 없습니다');
    }

    return user;
  }
}
