// ============================================================
// RNA Guide - Décorateurs communs
// ============================================================

import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../guards/jwt-auth.guard';

/**
 * @CurrentUser() - Injecte l'utilisateur authentifié dans le paramètre
 * Usage: async getProfile(@CurrentUser() user: User)
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

/**
 * @Public() - Marque une route comme publique (pas de JWT requis)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * @Roles(...roles) - Restreint l'accès aux rôles spécifiés
 * Usage: @Roles(Role.ADMIN, Role.SUPERVISEUR)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
