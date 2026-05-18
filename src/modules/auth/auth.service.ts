// ============================================================
// RNA Guide - Auth Service
// ============================================================

import {
  Injectable, UnauthorizedException, BadRequestException,
  ConflictException, NotFoundException, Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string;
  email?: string;
  phone?: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── Inscription ──────────────────────────────────────────

  async register(dto: RegisterDto): Promise<AuthTokens> {
    // Vérifier unicité email/phone
    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existingEmail) throw new ConflictException('Cet email est déjà utilisé');
    }
    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
      if (existingPhone) throw new ConflictException('Ce numéro de téléphone est déjà utilisé');
    }
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email ou téléphone requis');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role ?? Role.PRODUCTEUR,
        region: dto.region,
        province: dto.province,
        commune: dto.commune,
        village: dto.village,
      },
    });

    this.logger.log(`Nouvel utilisateur enregistré: ${user.id} (${user.role})`);
    return this.generateTokens(user.id, user.email, user.phone, user.role);
  }

  // ── Connexion ────────────────────────────────────────────

  async login(dto: LoginDto, deviceId?: string, appVersion?: string): Promise<AuthTokens & { user: any }> {
    const user = dto.email
      ? await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } })
      : await this.prisma.user.findUnique({ where: { phone: dto.phone } });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Mettre à jour deviceId si fourni
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

  // ── Refresh Token ─────────────────────────────────────────

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    if (!tokenRecord.user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }

    // Rotation: révoquer l'ancien token
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { isRevoked: true },
    });

    const { user } = tokenRecord;
    return this.generateTokens(user.id, user.email, user.phone, user.role);
  }

  // ── Déconnexion ───────────────────────────────────────────

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  // ── Validation JWT (passport) ─────────────────────────────

  async validateJwtPayload(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, phone: true, role: true, isActive: true, deletedAt: true },
    });
    if (!user || !user.isActive || user.deletedAt) return null;
    return user;
  }

  async validateLocalUser(identifier: string, password: string) {
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
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  // ── Helper privé: génération tokens ──────────────────────

  private async generateTokens(
    userId: string,
    email: string | null | undefined,
    phone: string | null | undefined,
    role: Role,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, email: email ?? undefined, phone: phone ?? undefined, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('app.jwt.accessSecret'),
      expiresIn: this.config.get('app.jwt.accessExpiresIn'),
    });

    const rawRefreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: { token: rawRefreshToken, userId, expiresAt },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: 15 * 60, // 15 minutes en secondes
    };
  }
}
