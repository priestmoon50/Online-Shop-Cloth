// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true; // اگر نقش‌ها تعریف نشده باشد، دسترسی آزاد است.
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return roles.includes(user.role); // چک کردن نقش کاربر
  }
}
