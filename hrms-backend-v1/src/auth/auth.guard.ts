import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token found');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      // Joi schema prevents reaching here in production, but guard as a safeguard
      throw new UnauthorizedException(
        'Server misconfiguration: JWT_SECRET not set',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });

      // P0 Multi-Tenant Security: Platform tokens must not access workspace tenant APIs directly
      if (payload.isPlatform) {
        throw new ForbiddenException(
          'Access denied: Platform credentials cannot access workspace tenant resources directly',
        );
      }

      // P0 Multi-Tenant Security: Tenant token must have a valid companyId
      if (
        !payload.companyId ||
        typeof payload.companyId !== 'string' ||
        !payload.companyId.trim()
      ) {
        throw new UnauthorizedException('Tenant company context is required');
      }

      // Attach the payload to the request object
      request['user'] = payload;
    } catch (err) {
      if (
        err instanceof ForbiddenException ||
        err instanceof UnauthorizedException
      ) {
        throw err;
      }
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
