import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
declare const LocalStrategy_base: new (...args: any[]) => Strategy;
export declare class LocalStrategy extends LocalStrategy_base {
    private readonly authService;
    constructor(authService: AuthService);
    validate(identifier: string, password: string): Promise<{
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
    }>;
}
export {};
