// ============================================================
// RNA Guide - Users Service (complet)
// ============================================================

import {
  Injectable, NotFoundException, ForbiddenException,
  ConflictException, BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {
  UpdateUserDto, ChangePasswordDto, AdminChangeRoleDto,
  QueryUserDto, RequestPasswordResetDto, ResetPasswordDto,
} from './dto/user.dto';

const USER_SELECT = {
  id: true, firstName: true, lastName: true, email: true, phone: true,
  role: true, region: true, province: true, commune: true, village: true,
  isActive: true, lastSyncAt: true, deviceId: true, appVersion: true,
  avatarUrl: true, createdAt: true, updatedAt: true,
  _count: { select: { ownedParcels: true, inventories: true, photos: true, exploitations: true } },
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private readonly prisma: PrismaService) {}

  // ── Lister les utilisateurs ───────────────────────────────

  async findAll(query: QueryUserDto, requester: any) {
    const { role, region, province, search, isActive, page = 1, limit = 20 } = query;
    const where: any = { deletedAt: null };

    // Les agents terrain ne voient que leur région
    if (requester.role === Role.AGENT_TERRAIN) {
      where.region = requester.region;
      where.role = { in: [Role.PRODUCTEUR] }; // agents voient seulement les producteurs
    }

    if (role) where.role = role;
    if (region) where.region = region;
    if (province) where.province = province;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: USER_SELECT,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: skip + limit < total } };
  }

  // ── Détail utilisateur ────────────────────────────────────

  async findOne(id: string, requester: any) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // Un producteur ne peut voir que son propre profil
    if (requester.role === Role.PRODUCTEUR && requester.id !== id) {
      throw new ForbiddenException('Accès refusé');
    }

    return user;
  }

  // ── Modifier son profil ───────────────────────────────────

  async update(id: string, dto: UpdateUserDto, requester: any) {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // Vérification droits
    if (requester.role === Role.PRODUCTEUR && requester.id !== id) {
      throw new ForbiddenException('Vous ne pouvez modifier que votre propre profil');
    }
    if (requester.role === Role.AGENT_TERRAIN && requester.id !== id) {
      throw new ForbiddenException('Vous ne pouvez modifier que votre propre profil');
    }

    // Vérifier unicité email/phone si modifiés
    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findFirst({ where: { email: dto.email.toLowerCase(), id: { not: id } } });
      if (existing) throw new ConflictException('Cet email est déjà utilisé');
    }
    if (dto.phone && dto.phone !== user.phone) {
      const existing = await this.prisma.user.findFirst({ where: { phone: dto.phone, id: { not: id } } });
      if (existing) throw new ConflictException('Ce numéro est déjà utilisé');
    }

    return this.prisma.user.update({
      where: { id },
      data: { ...dto, ...(dto.email && { email: dto.email.toLowerCase() }) },
      select: USER_SELECT,
    });
  }

  // ── Changer son mot de passe ──────────────────────────────

  async changePassword(id: string, dto: ChangePasswordDto, requester: any) {
    if (requester.id !== id && requester.role !== Role.ADMIN) {
      throw new ForbiddenException('Vous ne pouvez changer que votre propre mot de passe');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) throw new BadRequestException('Mot de passe actuel incorrect');

    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException('Le nouveau mot de passe doit être différent de l\'ancien');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });

    // Révoquer tous les refresh tokens (sécurité)
    await this.prisma.refreshToken.updateMany({ where: { userId: id }, data: { isRevoked: true } });
    this.logger.log(`Mot de passe changé pour l'utilisateur ${id}`);

    return { message: 'Mot de passe modifié avec succès. Reconnectez-vous.' };
  }

  // ── Changer le rôle (Admin uniquement) ───────────────────

  async changeRole(id: string, dto: AdminChangeRoleDto, adminId: string) {
    if (id === adminId) throw new BadRequestException('Vous ne pouvez pas changer votre propre rôle');

    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: { id: true, firstName: true, lastName: true, role: true },
    });
    this.logger.log(`Rôle de ${id} changé en ${dto.role} par admin ${adminId}`);
    return updated;
  }

  // ── Activer / Désactiver un compte ────────────────────────

  async toggleActive(id: string, isActive: boolean, adminId: string) {
    if (id === adminId) throw new BadRequestException('Vous ne pouvez pas désactiver votre propre compte');

    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, firstName: true, lastName: true, isActive: true },
    });

    if (!isActive) {
      // Révoquer tous les tokens si désactivation
      await this.prisma.refreshToken.updateMany({ where: { userId: id }, data: { isRevoked: true } });
    }

    this.logger.log(`Compte ${id} ${isActive ? 'activé' : 'désactivé'} par ${adminId}`);
    return updated;
  }

  // ── Soft delete (Admin) ───────────────────────────────────

  async remove(id: string, adminId: string) {
    if (id === adminId) throw new BadRequestException('Vous ne pouvez pas supprimer votre propre compte');

    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    await this.prisma.refreshToken.updateMany({ where: { userId: id }, data: { isRevoked: true } });
    this.logger.log(`Utilisateur ${id} supprimé (soft) par admin ${adminId}`);
  }

  // ── Demander reset mot de passe ───────────────────────────

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(dto.email ? [{ email: dto.email.toLowerCase() }] : []),
          ...(dto.phone ? [{ phone: dto.phone }] : []),
        ],
        isActive: true, deletedAt: null,
      },
    });

    // Toujours retourner 200 (pas de fuite d'info)
    if (!user) return { message: 'Si ce compte existe, un lien de réinitialisation a été envoyé.' };

    // Invalider les anciens tokens
    await this.prisma.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() }, // marquer comme utilisés
    });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await this.prisma.passwordReset.create({
      data: { token, userId: user.id, expiresAt },
    });

    // En production: envoyer par SMS (ex: Twilio) ou email (ex: SendGrid)
    // Ici on retourne le token pour le dev/démo
    this.logger.log(`Reset password demandé pour ${user.id}, token: ${token}`);

    return {
      message: 'Lien de réinitialisation généré.',
      // À retirer en production — uniquement pour la démo
      resetToken: process.env.NODE_ENV !== 'production' ? token : undefined,
    };
  }

  // ── Réinitialiser le mot de passe ────────────────────────

  async resetPassword(dto: ResetPasswordDto) {
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
      throw new BadRequestException('Token invalide ou expiré');
    }
    if (!resetRecord.user.isActive) {
      throw new BadRequestException('Compte désactivé');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await Promise.all([
      this.prisma.user.update({ where: { id: resetRecord.userId }, data: { passwordHash } }),
      this.prisma.passwordReset.update({ where: { id: resetRecord.id }, data: { usedAt: new Date() } }),
      this.prisma.refreshToken.updateMany({ where: { userId: resetRecord.userId }, data: { isRevoked: true } }),
    ]);

    this.logger.log(`Mot de passe réinitialisé pour ${resetRecord.userId}`);
    return { message: 'Mot de passe réinitialisé avec succès. Reconnectez-vous.' };
  }

  // ── Stats globales (Admin) ────────────────────────────────

  async getGlobalStats() {
    const [byRole, totalActive, totalInactive, recentRegistrations] = await Promise.all([
      this.prisma.user.groupBy({
        by: ['role'],
        where: { deletedAt: null, isActive: true },
        _count: { _all: true },
      }),
      this.prisma.user.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.user.count({ where: { deletedAt: null, isActive: false } }),
      this.prisma.user.count({
        where: { deletedAt: null, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    return {
      totalActive,
      totalInactive,
      recentRegistrations,
      byRole: byRole.reduce((acc, r) => ({ ...acc, [r.role]: r._count._all }), {}),
    };
  }
}
