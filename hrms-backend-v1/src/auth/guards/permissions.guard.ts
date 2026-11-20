import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Get the required permissions for this specific route
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If the route doesn't require any specific permissions, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Attached by AuthGuard

    if (!user) throw new ForbiddenException('User not authenticated');

    // 2. System Admins & Owners bypass all granular permission checks
    if (user.role === 'SUPER_ADMIN' || user.role === 'OWNER') {
      return true;
    }

    // 3. Fetch the user's custom role/designation and permissions from the database
    const employee = await this.prisma.employee.findUnique({
      where: { id: user.sub },
      include: { customRole: true, designation: true },
    });

    const userPermissions = employee?.customRole?.permissions || [];
    const designation = employee?.designation;

    // 4. Check if the user has ALL the required permissions for this route
    const hasPermission = requiredPermissions.every((perm) => {
      // Check legacy custom role permissions
      if (userPermissions.includes(perm)) return true;

      // Check new Designation modulePermissions
      if (designation) {
        // Parse e.g. "employee.delete" -> module: "employee", action: "delete"
        const [rawModule, action] = perm.split('.');
        if (!rawModule || !action) return false;

        // Normalise module names to match designations config keys
        let moduleKey = rawModule.toLowerCase();
        if (moduleKey === 'employee') moduleKey = 'employees';
        if (moduleKey === 'task') moduleKey = 'tasks';
        if (moduleKey === 'document') moduleKey = 'documents';
        if (moduleKey === 'schedule') moduleKey = 'schedules';
        if (moduleKey === 'announcement') moduleKey = 'employees';
        if (moduleKey === 'system') moduleKey = 'settings';
        if (moduleKey === 'leaves') moduleKey = 'leave';
        if (moduleKey === 'shift') moduleKey = 'shifts';

        const modulePerms =
          (designation.modulePermissions as any)?.[moduleKey] || [];

        // 'manage' requires any mutation permission (create/edit/delete)
        if (action === 'manage') {
          return (
            modulePerms.includes('create') ||
            modulePerms.includes('edit') ||
            modulePerms.includes('delete')
          );
        }

        return modulePerms.includes(action);
      }

      // Default role fallback for HR_HEAD and MANAGER if no designation was assigned
      if (user.role === 'HR_HEAD') {
        return true;
      }

      if (user.role === 'MANAGER') {
        const [rawModule, action] = perm.split('.');
        let moduleKey = rawModule?.toLowerCase();
        if (moduleKey === 'employee') moduleKey = 'employees';
        if (moduleKey === 'task') moduleKey = 'tasks';
        if (moduleKey === 'document') moduleKey = 'documents';
        if (moduleKey === 'schedule') moduleKey = 'schedules';
        if (moduleKey === 'leaves') moduleKey = 'leave';

        // Managers can view and edit attendance, leave, tasks, schedules, employees
        if (
          ['employees', 'attendance', 'leave', 'tasks', 'schedules'].includes(
            moduleKey,
          )
        ) {
          return action === 'view' || action === 'edit' || action === 'manage';
        }
      }

      return false;
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        `Action denied. You need the following permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
