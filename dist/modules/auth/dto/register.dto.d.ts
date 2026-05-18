import { Role } from '@prisma/client';
export declare class RegisterDto {
    email?: string;
    phone?: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: Role;
    region?: string;
    province?: string;
    commune?: string;
    village?: string;
}
export declare class LoginDto {
    email?: string;
    phone?: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
