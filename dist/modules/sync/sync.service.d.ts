import { PrismaService } from '../../prisma/prisma.service';
export interface SyncPushItem {
    entityType: 'parcel' | 'inventory' | 'exploitation' | 'photo';
    action: 'create' | 'update' | 'delete';
    localId: string;
    serverId?: string;
    payload: Record<string, any>;
    clientUpdatedAt: string;
    version?: number;
}
export interface SyncPushDto {
    items: SyncPushItem[];
    deviceId: string;
    lastSyncAt?: string;
}
export interface SyncPullDto {
    lastSyncAt: string;
    entityTypes?: string[];
}
export interface SyncResult {
    pushed: {
        success: number;
        conflicts: number;
        errors: number;
        results: SyncItemResult[];
    };
}
export interface SyncItemResult {
    localId: string;
    serverId?: string;
    status: 'created' | 'updated' | 'deleted' | 'conflict' | 'error';
    conflictData?: any;
    errorMessage?: string;
}
export declare class SyncService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    push(dto: SyncPushDto, userId: string): Promise<SyncResult>;
    pull(dto: SyncPullDto, userId: string): Promise<any>;
    private processSyncItem;
    resolveConflict(syncLogId: string, resolution: 'client_wins' | 'server_wins', clientPayload?: any): Promise<any>;
    getDeviceStatus(userId: string): Promise<any>;
    private getEntityHandler;
}
