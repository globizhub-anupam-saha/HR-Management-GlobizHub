import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PLATFORM_ROLES_KEY } from '../decorators/platform-roles.decorator';
import { PlatformRoleType } from '../../../../generated/prisma/enums';

@Injectable()
export class PlatformRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<PlatformRoleType[]>(
      PLATFORM_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.platformUser;

    if (!user) {
      throw new ForbiddenException('Platform user context not resolved');
    }

    // SUPER_ADMIN has unrestricted platform access
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Action requires one of the following platform roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
