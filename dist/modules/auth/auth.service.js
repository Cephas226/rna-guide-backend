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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = require("bcryptjs");
const uuid_1 = require("uuid");
const client_1 = require("@prisma/client");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, config) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(dto) {
        if (dto.email) {
            const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
            if (existingEmail)
                throw new common_1.ConflictException('Cet email est déjà utilisé');
        }
        if (dto.phone) {
            const existingPhone = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
            if (existingPhone)
                throw new common_1.ConflictException('Ce numéro de téléphone est déjà utilisé');
        }
        if (!dto.email && !dto.phone) {
            throw new common_1.BadRequestException('Email ou téléphone requis');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email?.toLowerCase(),
                phone: dto.phone,
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: dto.role ?? client_1.Role.PRODUCTEUR,
                region: dto.region,
                province: dto.province,
                commune: dto.commune,
                village: dto.village,
            },
        });
        this.logger.log(`Nouvel utilisateur enregistré: ${user.id} (${user.role})`);
        return this.generateTokens(user.id, user.email, user.phone, user.role);
    }
    async login(dto, deviceId, appVersion) {
        const user = dto.email
            ? await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } })
            : await this.prisma.user.findUnique({ where: { phone: dto.phone } });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
                deviceId: deviceId ?? user.deviceId,
                appVersion: appVersion ?? user.appVersion,
            },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.phone, user.role);
        return {
            ...tokens,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                region: user.region,
                province: user.province,
                commune: user.commune,
                village: user.village,
            },
        };
    }
    async refreshTokens(refreshToken) {
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token invalide ou expiré');
        }
        if (!tokenRecord.user.isActive) {
            throw new common_1.UnauthorizedException('Compte désactivé');
        }
        await this.prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { isRevoked: true },
        });
        const { user } = tokenRecord;
        return this.generateTokens(user.id, user.email, user.phone, user.role);
    }
    async logout(refreshToken) {
        await this.prisma.refreshToken.updateMany({
            where: { token: refreshToken },
            data: { isRevoked: true },
        });
    }
    async logoutAll(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId },
            data: { isRevoked: true },
        });
    }
    async validateJwtPayload(payload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, phone: true, role: true, isActive: true, deletedAt: true },
        });
        if (!user || !user.isActive || user.deletedAt)
            return null;
        return user;
    }
    async validateLocalUser(identifier, password) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier.toLowerCase() },
                    { phone: identifier },
                ],
                isActive: true,
                deletedAt: null,
            },
        });
        if (!user)
            return null;
        const isValid = await bcrypt.compare(password, user.passwordHash);
        return isValid ? user : null;
    }
    async generateTokens(userId, email, phone, role) {
        const payload = { sub: userId, email: email ?? undefined, phone: phone ?? undefined, role };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.config.get('app.jwt.accessSecret'),
            expiresIn: this.config.get('app.jwt.accessExpiresIn'),
        });
        const rawRefreshToken = (0, uuid_1.v4)();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await this.prisma.refreshToken.create({
            data: { token: rawRefreshToken, userId, expiresAt },
        });
        return {
            accessToken,
            refreshToken: rawRefreshToken,
            expiresIn: 15 * 60,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map