import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto, ChangePasswordDto, AdminChangeRoleDto, QueryUserDto, RequestPasswordResetDto, ResetPasswordDto } from './dto/user.dto';
export declare class UsersService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(query: QueryUserDto, requester: any): Promise<{
        data: {
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
            avatarUrl: string | null;
            isActive: boolean;
            lastSyncAt: Date | null;
            deviceId: string | null;
            appVersion: string | null;
            createdAt: Date;
            updatedAt: Date;
            _count: {
                ownedParcels: number;
                inventories: number;
                photos: number;
                exploitations: number;
            };
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNext: boolean;
        };
    }>;
    findOne(id: string, requester: any): Promise<{
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
        avatarUrl: string | null;
        isActive: boolean;
        lastSyncAt: Date | null;
        deviceId: string | null;
        appVersion: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            ownedParcels: number;
            inventories: number;
            photos: number;
            exploitations: number;
        };
    }>;
    update(id: string, dto: UpdateUserDto, requester: any): Promise<{
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
        avatarUrl: string | null;
        isActive: boolean;
        lastSyncAt: Date | null;
        deviceId: string | null;
        appVersion: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            ownedParcels: number;
            inventories: number;
            photos: number;
            exploitations: number;
        };
    }>;
    changePassword(id: string, dto: ChangePasswordDto, requester: any): Promise<{
        message: string;
    }>;
    changeRole(id: string, dto: AdminChangeRoleDto, adminId: string): Promise<{
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
    }>;
    toggleActive(id: string, isActive: boolean, adminId: string): Promise<{
        firstName: string;
        lastName: string;
        id: string;
        isActive: boolean;
    }>;
    remove(id: string, adminId: string): Promise<void>;
    requestPasswordReset(dto: RequestPasswordResetDto): Promise<{
        message: string;
        resetToken?: undefined;
    } | {
        message: string;
        resetToken: string | undefined;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getGlobalStats(): Promise<{
        totalActive: number;
        totalInactive: number;
        recentRegistrations: number;
        byRole: {};
    }>;
}
