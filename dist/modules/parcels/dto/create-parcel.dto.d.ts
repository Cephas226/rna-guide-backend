import { SyncStatus } from '@prisma/client';
export declare class GpsPointDto {
    lat: number;
    lng: number;
}
export declare class CreateParcelDto {
    localId?: string;
    name: string;
    region: string;
    province: string;
    commune: string;
    village: string;
    superficie: number;
    latitude: number;
    longitude: number;
    geometry?: Record<string, any>;
    gpsPoints?: GpsPointDto[];
    notes?: string;
}
declare const UpdateParcelDto_base: import("@nestjs/common").Type<Partial<CreateParcelDto>>;
export declare class UpdateParcelDto extends UpdateParcelDto_base {
}
export declare class QueryParcelDto {
    region?: string;
    province?: string;
    commune?: string;
    village?: string;
    ownerId?: string;
    syncStatus?: SyncStatus;
    search?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    page?: number;
    limit?: number;
}
export {};
