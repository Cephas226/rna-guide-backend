import { SyncService, SyncPushDto } from './sync.service';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    push(dto: SyncPushDto, user: any): Promise<import("./sync.service").SyncResult>;
    pull(lastSyncAt: string, entityTypesRaw: string, user: any): Promise<any>;
    getStatus(user: any): Promise<any>;
    resolve(syncLogId: string, body: {
        resolution: 'client_wins' | 'server_wins';
        clientPayload?: any;
    }, user: any): Promise<any>;
}
