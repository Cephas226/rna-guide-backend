"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const uuid_1 = require("uuid");
const USER_SELECT = {
    id: true, firstName: true, lastName: true, email: true, phone: true,
    role: true, region: true, province: true, commune: true, village: true,
    isActive: true, lastSyncAt: true, deviceId: true, appVersion: true,
    avatarUrl: true, createdAt: true, updatedAt: true,
    _count: { select: { ownedParcels: true, inventories: true, photos: true, exploitations: true } },
};
let UsersService = UsersService_1 = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async findAll(query, requester) {
        const { role, region, province, search, isActive, page = 1, limit = 20 } = query;
        const where = { deletedAt: null };
        if (requester.role === client_1.Role.AGENT_TERRAIN) {
            where.region = requester.region;
            where.role = { in: [client_1.Role.PRODUCTEUR] };
        }
        if (role)
            where.role = role;
        if (region)
            where.region = region;
        if (province)
            where.province = province;
        if (isActive !== undefined)
            where.isActive = isActive;
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
    async findOne(id, requester) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            select: USER_SELECT,
        });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        if (requester.role === client_1.Role.PRODUCTEUR && requester.id !== id) {
            throw new common_1.ForbiddenException('Accès refusé');
        }
        return user;
    }
    async update(id, dto, requester) {
        const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        if (requester.role === client_1.Role.PRODUCTEUR && requester.id !== id) {
            throw new common_1.ForbiddenException('Vous ne pouvez modifier que votre propre profil');
        }
        if (requester.role === client_1.Role.AGENT_TERRAIN && requester.id !== id) {
            throw new common_1.ForbiddenException('Vous ne pouvez modifier que votre propre profil');
        }
        if (dto.email && dto.email !== user.email) {
            const existing = await this.prisma.user.findFirst({ where: { email: dto.email.toLowerCase(), id: { not: id } } });
            if (existing)
                throw new common_1.ConflictException('Cet email est déjà utilisé');
        }
        if (dto.phone && dto.phone !== user.phone) {
            const existing = await this.prisma.user.findFirst({ where: { phone: dto.phone, id: { not: id } } });
            if (existing)
                throw new common_1.ConflictException('Ce numéro est déjà utilisé');
        }
        return this.prisma.user.update({
            where: { id },
            data: { ...dto, ...(dto.email && { email: dto.email.toLowerCase() }) },
            select: USER_SELECT,
        });
    }
    async changePassword(id, dto, requester) {
        if (requester.id !== id && requester.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Vous ne pouvez changer que votre propre mot de passe');
        }
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!isValid)
            throw new common_1.BadRequestException('Mot de passe actuel incorrect');
        if (dto.newPassword === dto.currentPassword) {
            throw new common_1.BadRequestException('Le nouveau mot de passe doit être différent de l\'ancien');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({ where: { id }, data: { passwordHash } });
        await this.prisma.refreshToken.updateMany({ where: { userId: id }, data: { isRevoked: true } });
        this.logger.log(`Mot de passe changé pour l'utilisateur ${id}`);
        return { message: 'Mot de passe modifié avec succès. Reconnectez-vous.' };
    }
    async changeRole(id, dto, adminId) {
        if (id === adminId)
            throw new common_1.BadRequestException('Vous ne pouvez pas changer votre propre rôle');
        const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        const updated = await this.prisma.user.update({
            where: { id },
            data: { role: dto.role },
            select: { id: true, firstName: true, lastName: true, role: true },
        });
        this.logger.log(`Rôle de ${id} changé en ${dto.role} par admin ${adminId}`);
        return updated;
    }
    async toggleActive(id, isActive, adminId) {
        if (id === adminId)
            throw new common_1.BadRequestException('Vous ne pouvez pas désactiver votre propre compte');
        const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        const updated = await this.prisma.user.update({
            where: { id },
            data: { isActive },
            select: { id: true, firstName: true, lastName: true, isActive: true },
        });
        if (!isActive) {
            await this.prisma.refreshToken.updateMany({ where: { userId: id }, data: { isRevoked: true } });
        }
        this.logger.log(`Compte ${id} ${isActive ? 'activé' : 'désactivé'} par ${adminId}`);
        return updated;
    }
    async remove(id, adminId) {
        if (id === adminId)
            throw new common_1.BadRequestException('Vous ne pouvez pas supprimer votre propre compte');
        const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
        await this.prisma.refreshToken.updateMany({ where: { userId: id }, data: { isRevoked: true } });
        this.logger.log(`Utilisateur ${id} supprimé (soft) par admin ${adminId}`);
    }
    async requestPasswordReset(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    ...(dto.email ? [{ email: dto.email.toLowerCase() }] : []),
                    ...(dto.phone ? [{ phone: dto.phone }] : []),
                ],
                isActive: true, deletedAt: null,
            },
        });
        if (!user)
            return { message: 'Si ce compte existe, un lien de réinitialisation a été envoyé.' };
        await this.prisma.passwordReset.updateMany({
            where: { userId: user.id, usedAt: null },
            data: { usedAt: new Date() },
        });
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await this.prisma.passwordReset.create({
            data: { token, userId: user.id, expiresAt },
        });
        this.logger.log(`Reset password demandé pour ${user.id}, token: ${token}`);
        return {
            message: 'Lien de réinitialisation généré.',
            resetToken: process.env.NODE_ENV !== 'production' ? token : undefined,
        };
    }
    async resetPassword(dto) {
        const resetRecord = await this.prisma.passwordReset.findUnique({
            where: { token: dto.token },
            include: { user: true },
        });
        if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Token invalide ou expiré');
        }
        if (!resetRecord.user.isActive) {
            throw new common_1.BadRequestException('Compte désactivé');
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map