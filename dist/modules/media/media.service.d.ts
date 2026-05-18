import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
export declare class MediaService {
    private readonly prisma;
    private readonly config;
    private readonly supabase;
    private readonly bucket;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService);
    uploadPhoto(file: Express.Multer.File, dto: {
        localId?: string;
        parcelId: string;
        photoPointId?: string;
        latitude?: number;
        longitude?: number;
        takenAt?: string;
        notes?: string;
        year?: number;
    }, userId: string): Promise<{
        photoPoint: {
            name: string;
            id: string;
            createdAt: Date;
            latitude: number;
            longitude: number;
            parcelId: string;
        } | null;
        author: {
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        localId: string | null;
        latitude: number | null;
        longitude: number | null;
        notes: string | null;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        year: number | null;
        takenAt: Date;
        parcelId: string;
        storageUrl: string;
        thumbnailUrl: string | null;
        originalName: string | null;
        sizeBytes: number | null;
        mimeType: string;
        altitude: number | null;
        localPath: string | null;
        authorId: string;
        photoPointId: string | null;
    }>;
    getPhotosByParcel(parcelId: string, options?: {
        year?: number;
        limit?: number;
    }): Promise<({
        photoPoint: {
            name: string;
            id: string;
            createdAt: Date;
            latitude: number;
            longitude: number;
            parcelId: string;
        } | null;
        author: {
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        localId: string | null;
        latitude: number | null;
        longitude: number | null;
        notes: string | null;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        year: number | null;
        takenAt: Date;
        parcelId: string;
        storageUrl: string;
        thumbnailUrl: string | null;
        originalName: string | null;
        sizeBytes: number | null;
        mimeType: string;
        altitude: number | null;
        localPath: string | null;
        authorId: string;
        photoPointId: string | null;
    })[]>;
    getBeforeAfter(parcelId: string, photoPointId?: string): Promise<{
        photoPointId: string | null;
        photoPointName: any;
        photos: any[];
        hasComparison: boolean;
    }[]>;
    deletePhoto(id: string, userId: string): Promise<void>;
    getSignedUrl(id: string, expiresInSeconds?: number): Promise<{
        signedUrl: string;
        expiresIn: number;
    }>;
    getPhotoStats(parcelId: string): Promise<{
        total: number;
        totalSizeMb: number;
        byYear: {
            year: number;
            count: number;
        }[];
        lastPhotoAt: Date;
    }>;
}
