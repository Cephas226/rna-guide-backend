"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SyncService = SyncService_1 = class SyncService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SyncService_1.name);
    }
    async push(dto, userId) {
        const results = [];
        let success = 0, conflicts = 0, errors = 0;
        for (const item of dto.items) {
            try {
                const result = await this.processSyncItem(item, userId, dto.deviceId);
                results.push(result);
                if (result.status === 'conflict')
                    conflicts++;
                else if (result.status === 'error')
                    errors++;
                else
                    success++;
                await this.prisma.syncLog.create({
                    data: {
                        userId,
                        deviceId: dto.deviceId,
                        entityType: item.entityType,
                        entityId: result.serverId ?? item.serverId ?? '',
                        localId: item.localId,
                        action: item.action.toUpperCase(),
                        payload: item.payload,
                        conflictWith: result.conflictData,
                        resolution: result.status === 'conflict' ? client_1.ConflictResolution.SERVER_WINS : null,
                    },
                });
            }
            catch (err) {
                errors++;
                results.push({
                    localId: item.localId,
                    status: 'error',
                    errorMessage: err.message,
                });
                this.logger.error(`Erreur sync item ${item.localId}: ${err.message}`);
            }
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastSyncAt: new Date(), deviceId: dto.deviceId },
        });
        return { pushed: { success, conflicts, errors, results } };
    }
    async pull(dto, userId) {
        const since = dto.lastSyncAt ? new Date(dto.lastSyncAt) : new Date(0);
        const entityTypes = dto.entityTypes ?? ['parcel', 'inventory', 'exploitation', 'photo'];
        const [parcels, inventories, exploitations, formations] = await Promise.all([
            entityTypes.includes('parcel')
                ? this.prisma.parcel.findMany({
                    where: {
                        OR: [{ updatedAt: { gte: since } }, { deletedAt: { gte: since } }],
                    },
                    include: {
                        owner: { select: { id: true, firstName: true, lastName: true } },
                        photoPoints: true,
                    },
                })
                : [],
            entityTypes.includes('inventory')
                ? this.prisma.inventory.findMany({
                    where: { updatedAt: { gte: since } },
                    include: { species: { include: { species: true } } },
                })
                : [],
            entityTypes.includes('exploitation')
                ? this.prisma.exploitation.findMany({
                    where: { updatedAt: { gte: since } },
                })
                : [],
            this.prisma.formation.findMany({
                where: { updatedAt: { gte: since }, isPublished: true },
                orderBy: { orderIndex: 'asc' },
            }),
        ]);
        const userIds = new Set();
        parcels.forEach(p => p.ownerId && userIds.add(p.ownerId));
        inventories.forEach(i => i.agentId && userIds.add(i.agentId));
        exploitations.forEach(e => e.userId && userIds.add(e.userId));
        const users = userIds.size > 0
            ? await this.prisma.user.findMany({
                where: { id: { in: [...userIds] } },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    role: true,
                    region: true,
                    province: true,
                    commune: true,
                    village: true,
                    avatarUrl: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })
            : [];
        return {
            pulledAt: new Date().toISOString(),
            delta: {
                users,
                parcels,
                inventories,
                exploitations,
                formations,
            },
            counts: {
                users: users.length,
                parcels: parcels.length,
                inventories: inventories.length,
                exploitations: exploitations.length,
                formations: formations.length,
            },
        };
    }
    async processSyncItem(item, userId, deviceId) {
        const handler = this.getEntityHandler(item.entityType);
        let existing = null;
        if (item.serverId) {
            existing = await handler.findById(item.serverId);
        }
        if (!existing && item.localId) {
            existing = await handler.findByLocalId(item.localId);
        }
        if (item.action === 'create') {
            if (existing) {
                return { localId: item.localId, serverId: existing.id, status: 'updated' };
            }
            const created = await handler.create({ ...item.payload, localId: item.localId, ownerId: userId, userId }, userId);
            return { localId: item.localId, serverId: created.id, status: 'created' };
        }
        if (item.action === 'update') {
            if (!existing) {
                const created = await handler.create({ ...item.payload, localId: item.localId, ownerId: userId, userId }, userId);
                return { localId: item.localId, serverId: created.id, status: 'created' };
            }
            const clientTime = item.clientUpdatedAt ? new Date(item.clientUpdatedAt) : new Date(0);
            const serverTime = existing.updatedAt ?? existing.createdAt;
            if (serverTime > clientTime && (existing.version ?? 1) > (item.version ?? 1)) {
                return {
                    localId: item.localId,
                    serverId: existing.id,
                    status: 'conflict',
                    conflictData: existing,
                };
            }
            await handler.update(existing.id, item.payload);
            return { localId: item.localId, serverId: existing.id, status: 'updated' };
        }
        if (item.action === 'delete') {
            if (!existing) {
                return { localId: item.localId, status: 'deleted' };
            }
            await handler.softDelete(existing.id);
            return { localId: item.localId, serverId: existing.id, status: 'deleted' };
        }
        throw new common_1.BadRequestException(`Action inconnue: ${item.action}`);
    }
    async resolveConflict(syncLogId, resolution, clientPayload) {
        const log = await this.prisma.syncLog.findUnique({ where: { id: syncLogId } });
        if (!log)
            throw new common_1.BadRequestException('SyncLog introuvable');
        if (resolution === 'client_wins' && clientPayload) {
            const handler = this.getEntityHandler(log.entityType);
            await handler.update(log.entityId, clientPayload);
        }
        await this.prisma.syncLog.update({
            where: { id: syncLogId },
            data: { resolution: resolution === 'client_wins' ? client_1.ConflictResolution.CLIENT_WINS : client_1.ConflictResolution.SERVER_WINS },
        });
        return { resolved: true, resolution };
    }
    async getDeviceStatus(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { lastSyncAt: true, deviceId: true, appVersion: true },
        });
        const pendingCount = await this.prisma.parcel.count({
            where: { ownerId: userId, syncStatus: client_1.SyncStatus.PENDING },
        });
        const conflictsCount = await this.prisma.syncLog.count({
            where: { userId, resolution: null, conflictWith: { not: client_1.Prisma.AnyNull } },
        });
        return {
            lastSyncAt: user?.lastSyncAt,
            deviceId: user?.deviceId,
            appVersion: user?.appVersion,
            pendingItems: pendingCount,
            unresolvedConflicts: conflictsCount,
        };
    }
    getEntityHandler(entityType) {
        const handlers = {
            parcel: {
                findByLocalId: (localId) => this.prisma.parcel.findUnique({ where: { localId } }),
                findById: (id) => this.prisma.parcel.findUnique({ where: { id } }),
                create: (payload, userId) => this.prisma.parcel.create({
                    data: {
                        localId: payload.localId,
                        name: payload.name ?? 'Parcelle sans nom',
                        region: payload.region ?? '',
                        province: payload.province ?? '',
                        commune: payload.commune ?? '',
                        village: payload.village ?? '',
                        superficie: payload.superficie ?? 0,
                        latitude: payload.latitude ?? 0,
                        longitude: payload.longitude ?? 0,
                        geometry: payload.geometry,
                        gpsPoints: payload.gpsPoints,
                        ownerId: userId,
                        notes: payload.notes,
                        syncStatus: client_1.SyncStatus.SYNCED,
                    },
                }),
                update: (id, payload) => this.prisma.parcel.update({
                    where: { id },
                    data: { ...payload, syncStatus: client_1.SyncStatus.SYNCED, version: { increment: 1 } },
                }),
                softDelete: (id) => this.prisma.parcel.update({
                    where: { id },
                    data: { deletedAt: new Date(), syncStatus: client_1.SyncStatus.DELETED },
                }),
            },
            inventory: {
                findByLocalId: (localId) => this.prisma.inventory.findUnique({ where: { localId } }),
                findById: (id) => this.prisma.inventory.findUnique({ where: { id } }),
                create: (payload, userId) => this.prisma.inventory.create({
                    data: {
                        localId: payload.localId,
                        parcelId: payload.parcelId,
                        agentId: userId,
                        year: payload.year ?? new Date().getFullYear(),
                        season: payload.season ?? 'HIVERNAGE',
                        totalPieds: payload.totalPieds ?? 0,
                        selectedPieds: payload.selectedPieds ?? 0,
                        observations: payload.observations,
                        syncStatus: client_1.SyncStatus.SYNCED,
                    },
                }),
                update: (id, payload) => this.prisma.inventory.update({
                    where: { id },
                    data: { ...payload, syncStatus: client_1.SyncStatus.SYNCED, version: { increment: 1 } },
                }),
                softDelete: (id) => this.prisma.inventory.update({
                    where: { id },
                    data: { syncStatus: client_1.SyncStatus.DELETED },
                }),
            },
            exploitation: {
                findByLocalId: (localId) => this.prisma.exploitation.findUnique({ where: { localId } }),
                findById: (id) => this.prisma.exploitation.findUnique({ where: { id } }),
                create: (payload, userId) => this.prisma.exploitation.create({
                    data: {
                        localId: payload.localId,
                        parcelId: payload.parcelId,
                        userId: userId,
                        productType: payload.productType,
                        quantity: payload.quantity ?? 0,
                        unit: payload.unit ?? 'kg',
                        destination: payload.destination ?? 'autoconsommation',
                        usage: payload.usage,
                        priceXOF: payload.priceXOF,
                        exploitedAt: payload.exploitedAt ? new Date(payload.exploitedAt) : new Date(),
                        notes: payload.notes,
                        syncStatus: client_1.SyncStatus.SYNCED,
                    },
                }),
                update: (id, payload) => this.prisma.exploitation.update({
                    where: { id },
                    data: { ...payload, syncStatus: client_1.SyncStatus.SYNCED },
                }),
                softDelete: (id) => this.prisma.exploitation.update({
                    where: { id },
                    data: { syncStatus: client_1.SyncStatus.DELETED },
                }),
            },
            photo: {
                findByLocalId: (localId) => this.prisma.photo.findUnique({ where: { localId } }),
                findById: (id) => this.prisma.photo.findUnique({ where: { id } }),
                create: (payload, userId) => this.prisma.photo.create({
                    data: {
                        localId: payload.localId,
                        parcelId: payload.parcelId,
                        authorId: userId,
                        storageUrl: payload.storageUrl ?? '',
                        latitude: payload.latitude,
                        longitude: payload.longitude,
                        takenAt: payload.takenAt ? new Date(payload.takenAt) : new Date(),
                        notes: payload.notes,
                        syncStatus: client_1.SyncStatus.SYNCED,
                    },
                }),
                update: (id, payload) => this.prisma.photo.update({
                    where: { id },
                    data: payload,
                }),
                softDelete: (id) => this.prisma.photo.update({
                    where: { id },
                    data: { syncStatus: client_1.SyncStatus.DELETED },
                }),
            },
        };
        const handler = handlers[entityType];
        if (!handler)
            throw new common_1.BadRequestException(`Type d'entité inconnu: ${entityType}`);
        return handler;
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = SyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SyncService);
//# sourceMappingURL=sync.service.js.map