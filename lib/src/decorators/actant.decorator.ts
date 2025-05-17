import { ActantType, AuthActant, UnknownActant } from '@lib/types/actant.type';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Actant = createParamDecorator(
  (
    type: ActantType = 'auth',
    ctx: ExecutionContext,
  ): AuthActant | UnknownActant => {
    const request = ctx.switchToHttp().getRequest();

    const ipAddr =
      request.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.connection?.remoteAddress ||
      'unknown';

    const userAgent = request.headers?.['user-agent'] || 'unknown';

    if (type === 'auth') {
      return {
        user: request?.user,
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
