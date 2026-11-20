import { SetMetadata } from '@nestjs/common';
import { PlatformRoleType } from '../../../../generated/prisma/enums';

export const PLATFORM_ROLES_KEY = 'platform_roles';
export const PlatformRoles = (...roles: PlatformRoleType[]) =>
  SetMetadata(PLATFORM_ROLES_KEY, roles);
