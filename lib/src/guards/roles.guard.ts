import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserDto } from '@lib/dtos/user/user.dto';
import { UserRoleType } from '@lib/enums';
export type UserRequest = Request & { user: UserDto };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // NOTE: 역할이 지정되지 않은 경우 모든 사용자 접근 허용
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request: UserRequest = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || typeof user !== 'object') {
      throw new ForbiddenException('사용자 인증이 필요합니다');
    }

    if (!user.role) {
      throw new ForbiddenException('사용자 역할 정보가 없습니다');
    }

    // NOTE: 관리자(ADMIN)는 모든 권한을 가짐
    if (user.role === UserRoleType.ADMIN) {
      return true;
    }

    // NOTE: 필요한 역할 중 하나라도 가지고 있는지 확인
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('해당 작업을 수행할 권한이 없습니다');
    }

    return true;
  }
}
