import { Role } from '@prisma/client';
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    region?: string;
    province?: string;
    commune?: string;
    village?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class AdminChangeRoleDto {
    role: Role;
}
export declare class QueryUserDto {
    role?: Role;
    region?: string;
    province?: string;
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}
export declare class RequestPasswordResetDto {
    email?: string;
    phone?: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
