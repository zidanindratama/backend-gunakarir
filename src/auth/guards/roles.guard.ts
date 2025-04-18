import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { validateApprovedRecruiter } from '../../common/helpers/validate-approved-recruiter';
import { validateApprovedStudent } from '../../common/helpers/validate-approved-student';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    const hasRequiredRole = requiredRoles.includes(user?.role);
    if (!hasRequiredRole) {
      throw new ForbiddenException('Role tidak sesuai.');
    }

    const bypassApproval = this.reflector.getAllAndOverride<boolean>(
      'bypassApproval',
      [context.getHandler(), context.getClass()],
    );

    if (!bypassApproval) {
      if (user.role === 'RECRUITER') {
        await validateApprovedRecruiter(user.id, this.prisma);
      }

      if (user.role === 'STUDENT') {
        await validateApprovedStudent(user.id, this.prisma);
      }
    }

    return true;
  }
}
