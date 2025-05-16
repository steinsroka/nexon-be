import { UserDto } from '@lib/dtos/user/user.dto';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = UserDto>(
    err: any,
    user: TUser,
    info: any,
    context: ExecutionContext,
  ): TUser {
    console.log('[JwtAuthGuard.handleRequest] user:', user);
    if (context) {
      const request = context.switchToHttp().getRequest();
      request.user = user;
    }

    return user;
  }
}
