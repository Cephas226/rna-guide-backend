import { MediaService } from './media.service';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    uploadPhoto(file: Express.Multer.File, dto: any, user: any): Promise<{
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
    getByParcel(parcelId: string, year?: string, limit?: string): Promise<({
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
    getStats(parcelId: string): Promise<{
        total: number;
        totalSizeMb: number;
        byYear: {
            year: number;
            count: number;
        }[];
        lastPhotoAt: Date;
    }>;
    getSignedUrl(id: string, expires?: string): Promise<{
        signedUrl: string;
        expiresIn: number;
    }>;
    deletePhoto(id: string, user: any): Promise<void>;
}
