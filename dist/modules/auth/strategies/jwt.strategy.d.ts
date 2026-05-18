import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from '../auth.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly authService;
    private readonly config;
    constructor(authService: AuthService, config: ConfigService);
    validate(payload: JwtPayload): Promise<{
        email: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        deletedAt: Date | null;
    }>;
}
export {};
