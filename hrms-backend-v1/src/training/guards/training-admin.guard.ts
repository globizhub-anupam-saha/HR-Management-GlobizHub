import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class TrainingAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const allowedRoles = ['SUPER_ADMIN', 'OWNER', 'HR_HEAD', 'ADMIN'];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Access denied: The Training & Development module is restricted to Admin and HR roles only.',
      );
    }

    return true;
  }
}
