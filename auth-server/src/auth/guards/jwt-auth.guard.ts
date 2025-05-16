import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserDto } from 'src/user/dtos/user.dto';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = UserDto>(err: any, user: TUser): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('접근 권한이 없습니다');
    }
    return user as TUser;
  }
}
