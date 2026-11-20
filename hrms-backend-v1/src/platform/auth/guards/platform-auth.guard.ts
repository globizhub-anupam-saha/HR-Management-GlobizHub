import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PlatformAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Platform authorization token required');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new UnauthorizedException(
        'Server configuration error: JWT_SECRET not set',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });

      // Strict SaaS Isolation: Token must have been issued specifically for platform administration
      if (!payload.isPlatform) {
        throw new ForbiddenException(
          'Access denied: Tenant credentials cannot access Platform Super Admin domain',
        );
      }

      // Verify the platform user still exists and is active
      const platformUser = await this.prisma.platformUser.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });

      if (!platformUser || !platformUser.isActive) {
        throw new UnauthorizedException('Platform account inactive or revoked');
      }

      request['platformUser'] = platformUser;
      request['user'] = platformUser; // for generic decorators
      return true;
    } catch (err: any) {
      if (
        err instanceof ForbiddenException ||
        err instanceof UnauthorizedException
      ) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired platform token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
