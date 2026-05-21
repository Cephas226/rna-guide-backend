// ============================================================
// RNA Guide - Sync Service
// Synchronisation offline-first bidirectionnelle
// Stratégie: Last Write Wins (LWW) + Conflict Detection
// ============================================================

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SyncStatus, ConflictResolution, SyncAction, Prisma } from '@prisma/client';

// ── Types ─────────────────────────────────────────────────────

export interface SyncPushItem {
  entityType: 'parcel' | 'inventory' | 'exploitation' | 'photo';
  action: 'create' | 'update' | 'delete';
  localId: string;     // ID généré côté mobile
  serverId?: string;   // ID serveur si connu
  payload: Record<string, any>;
  clientUpdatedAt: string; // ISO timestamp
  version?: number;
}

export interface SyncPushDto {
  items: SyncPushItem[];
  deviceId: string;
  lastSyncAt?: string;
}

export interface SyncPullDto {
  lastSyncAt: string;       // ISO - ne retourner que les deltas depuis ce timestamp
  entityTypes?: string[];   // filtrer les types d'entités
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

// ── Handlers par type d'entité ────────────────────────────────

type EntityHandler = {
  findByLocalId: (localId: string) => Promise<any>;
  findById: (id: string) => Promise<any>;
  create: (payload: any, userId: string) => Promise<any>;
  update: (id: string, payload: any) => Promise<any>;
  softDelete: (id: string) => Promise<any>;
};

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── PUSH: mobile → serveur ────────────────────────────────

  async push(dto: SyncPushDto, userId: string): Promise<SyncResult> {
    const results: SyncItemResult[] = [];
    let success = 0, conflicts = 0, errors = 0;

    for (const item of dto.items) {
      try {
        const result = await this.processSyncItem(item, userId, dto.deviceId);
        results.push(result);

        if (result.status === 'conflict') conflicts++;
        else if (result.status === 'error') errors++;
        else success++;

        // Log de synchronisation
        await this.prisma.syncLog.create({
          data: {
            userId,
            deviceId: dto.deviceId,
            entityType: item.entityType,
            entityId: result.serverId ?? item.serverId ?? '',
            localId: item.localId,
            action: item.action.toUpperCase() as SyncAction,
            payload: item.payload,
            conflictWith: result.conflictData as any,
            resolution: result.status === 'conflict' ? ConflictResolution.SERVER_WINS : null,
          },
        });
      } catch (err: any) {
        errors++;
        results.push({
          localId: item.localId,
          status: 'error',
          errorMessage: err.message,
        });
        this.logger.error(`Erreur sync item ${item.localId}: ${err.message}`);
      }
    }

    // Mettre à jour lastSyncAt de l'utilisateur
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastSyncAt: new Date(), deviceId: dto.deviceId },
    });

    return { pushed: { success, conflicts, errors, results } };
  }

  // ── PULL: serveur → mobile (deltas) ──────────────────────

  async pull(dto: SyncPullDto, userId: string): Promise<any> {
    const since = dto.lastSyncAt ? new Date(dto.lastSyncAt) : new Date(0);
    const entityTypes = dto.entityTypes ?? ['parcel', 'inventory', 'exploitation', 'photo'];

    // Récupérer uniquement les entités modifiées depuis lastSyncAt
    const [parcels, inventories, exploitations, formations, species] = await Promise.all([
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

      // Formations: toujours synchronisées (contenu guide offline)
      this.prisma.formation.findMany({
        where: { updatedAt: { gte: since }, isPublished: true },
        orderBy: { orderIndex: 'asc' },
      }),

      // Espèces: catalogue de référence, synchronisé en entier à chaque pull initial
      this.prisma.species.findMany({ orderBy: { scientificName: 'asc' } }),
    ]);

    // Collect referenced user IDs across all entity types
    const userIds = new Set<string>();
    (parcels as any[]).forEach(p => p.ownerId && userIds.add(p.ownerId));
    (inventories as any[]).forEach(i => i.agentId && userIds.add(i.agentId));
    (exploitations as any[]).forEach(e => e.userId && userIds.add(e.userId));

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
        species,
      },
      counts: {
        users: users.length,
        parcels: parcels.length,
        inventories: inventories.length,
        exploitations: exploitations.length,
        formations: formations.length,
        species: species.length,
      },
    };
  }

  // ── Traitement individuel d'un item ───────────────────────

  private async processSyncItem(
    item: SyncPushItem,
    userId: string,
    deviceId: string,
  ): Promise<SyncItemResult> {
    const handler = this.getEntityHandler(item.entityType);

    // Recherche entité existante
    let existing: any = null;
    if (item.serverId) {
      existing = await handler.findById(item.serverId);
    }
    if (!existing && item.localId) {
      existing = await handler.findByLocalId(item.localId);
    }

    // ── CREATE ──
    if (item.action === 'create') {
      if (existing) {
        // Déjà créé (double envoi) → retourner l'ID serveur
        return { localId: item.localId, serverId: existing.id, status: 'updated' };
      }
      const created = await handler.create(
        { ...item.payload, localId: item.localId, ownerId: userId, userId },
        userId,
      );
      return { localId: item.localId, serverId: created.id, status: 'created' };
    }

    // ── UPDATE ──
    if (item.action === 'update') {
      if (!existing) {
        // Entité inconnue → créer à la place
        const created = await handler.create(
          { ...item.payload, localId: item.localId, ownerId: userId, userId },
          userId,
        );
        return { localId: item.localId, serverId: created.id, status: 'created' };
      }

      // Détection de conflit: version client vs serveur
      const clientTime = item.clientUpdatedAt ? new Date(item.clientUpdatedAt) : new Date(0);
      const serverTime = existing.updatedAt ?? existing.createdAt;

      if (serverTime > clientTime && (existing.version ?? 1) > (item.version ?? 1)) {
        // Conflit: serveur plus récent → Server Wins par défaut
        // Notifier le client pour révision manuelle si critique
        return {
          localId: item.localId,
          serverId: existing.id,
          status: 'conflict',
          conflictData: existing,
        };
      }

      // Pas de conflit: appliquer les changements du client
      await handler.update(existing.id, item.payload);
      return { localId: item.localId, serverId: existing.id, status: 'updated' };
    }

    // ── DELETE ──
    if (item.action === 'delete') {
      if (!existing) {
        return { localId: item.localId, status: 'deleted' };
      }
      await handler.softDelete(existing.id);
      return { localId: item.localId, serverId: existing.id, status: 'deleted' };
    }

    throw new BadRequestException(`Action inconnue: ${item.action}`);
  }

  // ── Résolution manuelle de conflit ────────────────────────

  async resolveConflict(
    syncLogId: string,
    resolution: 'client_wins' | 'server_wins',
    clientPayload?: any,
  ): Promise<any> {
    const log = await this.prisma.syncLog.findUnique({ where: { id: syncLogId } });
    if (!log) throw new BadRequestException('SyncLog introuvable');

    if (resolution === 'client_wins' && clientPayload) {
      const handler = this.getEntityHandler(log.entityType as any);
      await handler.update(log.entityId, clientPayload);
    }

    await this.prisma.syncLog.update({
      where: { id: syncLogId },
      data: { resolution: resolution === 'client_wins' ? ConflictResolution.CLIENT_WINS : ConflictResolution.SERVER_WINS },
    });

    return { resolved: true, resolution };
  }

  // ── Status de sync d'un appareil ─────────────────────────

  async getDeviceStatus(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastSyncAt: true, deviceId: true, appVersion: true },
    });

    const pendingCount = await this.prisma.parcel.count({
      where: { ownerId: userId, syncStatus: SyncStatus.PENDING },
    });

    const conflictsCount = await this.prisma.syncLog.count({
      where: { userId, resolution: null, conflictWith: { not: Prisma.AnyNull } },
    });

    return {
      lastSyncAt: user?.lastSyncAt,
      deviceId: user?.deviceId,
      appVersion: user?.appVersion,
      pendingItems: pendingCount,
      unresolvedConflicts: conflictsCount,
    };
  }

  // ── Factory handlers par type d'entité ───────────────────

  private getEntityHandler(entityType: string): EntityHandler {
    const handlers: Record<string, EntityHandler> = {
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
            syncStatus: SyncStatus.SYNCED,
          },
        }),
        update: (id, payload) => this.prisma.parcel.update({
          where: { id },
          data: { ...payload, syncStatus: SyncStatus.SYNCED, version: { increment: 1 } },
        }),
        softDelete: (id) => this.prisma.parcel.update({
          where: { id },
          data: { deletedAt: new Date(), syncStatus: SyncStatus.DELETED },
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
            syncStatus: SyncStatus.SYNCED,
          },
        }),
        update: (id, payload) => this.prisma.inventory.update({
          where: { id },
          data: { ...payload, syncStatus: SyncStatus.SYNCED, version: { increment: 1 } },
        }),
        softDelete: (id) => this.prisma.inventory.update({
          where: { id },
          data: { syncStatus: SyncStatus.DELETED },
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
            syncStatus: SyncStatus.SYNCED,
          },
        }),
        update: (id, payload) => this.prisma.exploitation.update({
          where: { id },
          data: { ...payload, syncStatus: SyncStatus.SYNCED },
        }),
        softDelete: (id) => this.prisma.exploitation.update({
          where: { id },
          data: { syncStatus: SyncStatus.DELETED },
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
            syncStatus: SyncStatus.SYNCED,
          },
        }),
        update: (id, payload) => this.prisma.photo.update({
          where: { id },
          data: payload,
        }),
        softDelete: (id) => this.prisma.photo.update({
          where: { id },
          data: { syncStatus: SyncStatus.DELETED },
        }),
      },
    };

    const handler = handlers[entityType];
    if (!handler) throw new BadRequestException(`Type d'entité inconnu: ${entityType}`);
    return handler;
  }
}
