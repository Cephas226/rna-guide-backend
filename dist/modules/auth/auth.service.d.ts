import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
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
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<AuthTokens>;
    login(dto: LoginDto, deviceId?: string, appVersion?: string): Promise<AuthTokens & {
        user: any;
    }>;
    refreshTokens(refreshToken: string): Promise<AuthTokens>;
    logout(refreshToken: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    validateJwtPayload(payload: JwtPayload): Promise<{
        email: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        deletedAt: Date | null;
    } | null>;
    validateLocalUser(identifier: string, password: string): Promise<{
        email: string | null;
        phone: string | null;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        region: string | null;
        province: string | null;
        commune: string | null;
        village: string | null;
        id: string;
        passwordHash: string;
        avatarUrl: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
        lastSyncAt: Date | null;
        deviceId: string | null;
        deviceModel: string | null;
        appVersion: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    } | null>;
    private generateTokens;
}
