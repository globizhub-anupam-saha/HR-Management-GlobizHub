import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentPlatformUserData {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export const CurrentPlatformUser = createParamDecorator(
  (data: keyof CurrentPlatformUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.platformUser || request.user;
    if (!user) return null;
    return data ? user[data] : user;
  },
);
