import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto, AdminChangeRoleDto, QueryUserDto, RequestPasswordResetDto, ResetPasswordDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    requestReset(dto: RequestPasswordResetDto): Promise<{
        message: string;
        resetToken?: undefined;
    } | {
        message: string;
        resetToken: string | undefined;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    findAll(query: QueryUserDto, user: any): Promise<{
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
    getStats(): Promise<{
        totalActive: number;
        totalInactive: number;
        recentRegistrations: number;
        byRole: {};
    }>;
    findOne(id: string, user: any): Promise<{
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
    update(id: string, dto: UpdateUserDto, user: any): Promise<{
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
    changePassword(id: string, dto: ChangePasswordDto, user: any): Promise<{
        message: string;
    }>;
    changeRole(id: string, dto: AdminChangeRoleDto, user: any): Promise<{
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
    }>;
    toggleActive(id: string, isActive: boolean, user: any): Promise<{
        firstName: string;
        lastName: string;
        id: string;
        isActive: boolean;
    }>;
    remove(id: string, user: any): Promise<void>;
}
