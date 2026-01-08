import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class BannedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    
    if (user && user.isBanned) {
      throw new ForbiddenException('Your account has been banned. You cannot perform this action.');
    }

    return true;
  }
}
