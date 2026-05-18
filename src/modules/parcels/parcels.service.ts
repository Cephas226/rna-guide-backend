// ============================================================
// RNA Guide - Parcels Service
// ============================================================

import {
  Injectable, NotFoundException, ForbiddenException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, SyncStatus } from '@prisma/client';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { QueryParcelDto } from './dto/query-parcel.dto';

@Injectable()
export class ParcelsService {
  private readonly logger = new Logger(ParcelsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Créer une parcelle ─────────────────────────────────────

  async create(dto: CreateParcelDto, userId: string): Promise<any> {
    const parcel = await this.prisma.parcel.create({
      data: {
        localId: dto.localId,
        name: dto.name,
        region: dto.region,
        province: dto.province,
        commune: dto.commune,
        village: dto.village,
        superficie: dto.superficie,
        latitude: dto.latitude,
        longitude: dto.longitude,
        geometry: dto.geometry as any,
        gpsPoints: dto.gpsPoints as any,
        ownerId: userId,
        syncStatus: SyncStatus.SYNCED,
        notes: dto.notes,
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, phone: true, email: true },
        },
        _count: { select: { inventories: true, photos: true } },
      },
    });

    this.logger.log(`Parcelle créée: ${parcel.id} par utilisateur ${userId}`);
    return parcel;
  }

  // ── Lister avec filtres & pagination ──────────────────────

  async findAll(query: QueryParcelDto, user: any): Promise<any> {
    const {
      region, province, commune, village, ownerId,
      page = 1, limit = 20,
      search, syncStatus,
      lat, lng, radiusKm,
    } = query;

    // Les producteurs voient seulement leurs parcelles
    const effectiveOwnerId = user.role === Role.PRODUCTEUR ? user.id : ownerId;

    const where: any = {
      deletedAt: null,
      ...(effectiveOwnerId && { ownerId: effectiveOwnerId }),
      ...(region && { region }),
      ...(province && { province }),
      ...(commune && { commune }),
      ...(village && { village }),
      ...(syncStatus && { syncStatus }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { village: { contains: search, mode: 'insensitive' } },
          { commune: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Filtre géographique approximatif (bbox)
    if (lat && lng && radiusKm) {
      const delta = radiusKm / 111;
      where.latitude = { gte: lat - delta, lte: lat + delta };
      where.longitude = { gte: lng - delta, lte: lng + delta };
    }

    const skip = (page - 1) * limit;
    const [parcels, total] = await Promise.all([
      this.prisma.parcel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: { id: true, firstName: true, lastName: true, phone: true },
          },
          _count: { select: { inventories: true, photos: true, exploitations: true } },
        },
      }),
      this.prisma.parcel.count({ where }),
    ]);

    return {
      data: parcels,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    };
  }

  // ── Obtenir une parcelle ───────────────────────────────────

  async findOne(id: string, user: any): Promise<any> {
    const parcel = await this.prisma.parcel.findFirst({
      where: { id, deletedAt: null },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, phone: true, email: true, village: true },
        },
        photoPoints: true,
        inventories: {
          orderBy: { year: 'desc' },
          include: {
            agent: { select: { id: true, firstName: true, lastName: true } },
            species: { include: { species: true } },
          },
        },
        photos: {
          orderBy: { takenAt: 'desc' },
          take: 20,
          include: { author: { select: { firstName: true, lastName: true } } },
        },
        exploitations: {
          orderBy: { exploitedAt: 'desc' },
          take: 10,
        },
        _count: { select: { inventories: true, photos: true, exploitations: true } },
      },
    });

    if (!parcel) throw new NotFoundException(`Parcelle ${id} introuvable`);

    // Producteur ne peut voir que ses propres parcelles
    if (user.role === Role.PRODUCTEUR && parcel.ownerId !== user.id) {
      throw new ForbiddenException('Accès refusé');
    }

    return parcel;
  }

  // ── Modifier une parcelle ──────────────────────────────────

  async update(id: string, dto: UpdateParcelDto, user: any): Promise<any> {
    const parcel = await this.prisma.parcel.findFirst({
      where: { id, deletedAt: null },
    });
    if (!parcel) throw new NotFoundException(`Parcelle ${id} introuvable`);

    // Seul le propriétaire ou admin/superviseur peut modifier
    const canEdit = user.role !== Role.PRODUCTEUR || parcel.ownerId === user.id;
    if (!canEdit) throw new ForbiddenException('Modification non autorisée');

    const updated = await this.prisma.parcel.update({
      where: { id },
      data: {
        ...dto,
        geometry: dto.geometry as any,
        gpsPoints: dto.gpsPoints as any,
        version: { increment: 1 },
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return updated;
  }

  // ── Soft delete ────────────────────────────────────────────

  async remove(id: string, user: any): Promise<void> {
    const parcel = await this.prisma.parcel.findFirst({
      where: { id, deletedAt: null },
    });
    if (!parcel) throw new NotFoundException(`Parcelle ${id} introuvable`);

    if (user.role === Role.PRODUCTEUR && parcel.ownerId !== user.id) {
      throw new ForbiddenException('Suppression non autorisée');
    }
    if (user.role === Role.AGENT_TERRAIN) {
      throw new ForbiddenException('Les agents terrain ne peuvent pas supprimer de parcelles');
    }

    await this.prisma.parcel.update({
      where: { id },
      data: { deletedAt: new Date(), syncStatus: SyncStatus.DELETED },
    });
    this.logger.log(`Parcelle ${id} supprimée (soft) par ${user.id}`);
  }

  // ── Statistiques par région ────────────────────────────────

  async getStatsByRegion(): Promise<any> {
    const stats = await this.prisma.parcel.groupBy({
      by: ['region'],
      where: { deletedAt: null },
      _count: { _all: true },
      _sum: { superficie: true },
    });
    return stats.map(s => ({
      region: s.region,
      count: s._count._all,
      totalSuperficie: Math.round((s._sum.superficie ?? 0) * 10) / 10,
    }));
  }

  // ── GeoJSON pour carte ─────────────────────────────────────

  async getGeoJson(query: QueryParcelDto, user: any): Promise<any> {
    const { data } = await this.findAll({ ...query, limit: 5000 }, user);
    return {
      type: 'FeatureCollection',
      features: data.map((p: any) => ({
        type: 'Feature',
        geometry: p.geometry ?? {
          type: 'Point',
          coordinates: [p.longitude, p.latitude],
        },
        properties: {
          id: p.id,
          name: p.name,
          region: p.region,
          province: p.province,
          village: p.village,
          superficie: p.superficie,
          syncStatus: p.syncStatus,
          owner: `${p.owner?.firstName} ${p.owner?.lastName}`,
          inventoriesCount: p._count?.inventories,
        },
      })),
    };
  }
}
