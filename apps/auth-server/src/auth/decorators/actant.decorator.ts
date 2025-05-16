import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDto } from '../../user/dtos/user.dto';

export type AuthActant = { user: UserDto; ipAddr: string; userAgent: string };
export type UnknownActant = { ipAddr: string; userAgent: string };

export type ActantType = 'auth' | 'unknown';

export const Actant = createParamDecorator(
  (
    type: ActantType = 'auth',
    ctx: ExecutionContext,
  ): AuthActant | UnknownActant => {
    const request = ctx.switchToHttp().getRequest();

    const ipAddr =
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.connection.remoteAddress;

    const userAgent = request.headers['user-agent'] || 'unknown';

    if (type === 'auth') {
      return {
        user: request.user,
        ipAddr,
        userAgent,
      };
    }

    return {
      ipAddr,
      userAgent,
    };
  },
);
