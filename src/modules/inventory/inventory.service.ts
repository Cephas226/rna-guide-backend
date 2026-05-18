// ============================================================
// RNA Guide - Inventory Service (complet)
// ============================================================

import {
  Injectable, NotFoundException, ConflictException,
  ForbiddenException, BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SyncStatus, Role } from '@prisma/client';
import { CreateInventoryDto, UpdateInventoryDto, QueryInventoryDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInventoryDto, userId: string) {
    const parcel = await this.prisma.parcel.findFirst({ where: { id: dto.parcelId, deletedAt: null } });
    if (!parcel) throw new NotFoundException(`Parcelle ${dto.parcelId} introuvable`);

    const existing = await this.prisma.inventory.findFirst({
      where: { parcelId: dto.parcelId, year: dto.year, season: dto.season },
    });
    if (existing) throw new ConflictException(`Inventaire ${dto.year}/${dto.season} déjà existant pour cette parcelle`);

    if (dto.species?.length) {
      const ids = dto.species.map(s => s.speciesId);
      const found = await this.prisma.species.findMany({ where: { id: { in: ids } }, select: { id: true } });
      const missing = ids.filter(id => !found.find(f => f.id === id));
      if (missing.length) throw new BadRequestException(`Espèces introuvables: ${missing.join(', ')}`);
      for (const sp of dto.species) {
        if (sp.selectedPieds > sp.totalPieds)
          throw new BadRequestException(`Espèce ${sp.speciesId}: pieds sélectionnés (${sp.selectedPieds}) > total (${sp.totalPieds})`);
      }
    }

    const totalPieds = dto.species?.reduce((s, sp) => s + sp.totalPieds, 0) ?? 0;
    const selectedPieds = dto.species?.reduce((s, sp) => s + sp.selectedPieds, 0) ?? 0;

    const inventory = await this.prisma.inventory.create({
      data: {
        localId: dto.localId,
        parcelId: dto.parcelId,
        agentId: userId,
        year: dto.year,
        season: dto.season,
        totalPieds,
        selectedPieds,
        observations: dto.observations,
        syncStatus: SyncStatus.SYNCED,
        species: dto.species?.length ? { create: dto.species.map(sp => ({ ...sp })) } : undefined,
      },
      include: {
        species: { include: { species: true } },
        agent: { select: { id: true, firstName: true, lastName: true } },
        parcel: { select: { id: true, name: true, village: true, region: true } },
      },
    });
    this.logger.log(`Inventaire créé: ${inventory.id}`);
    return inventory;
  }

  async findAll(query: QueryInventoryDto, user: any) {
    const { parcelId, agentId, year, season, validatedOnly, page = 1, limit = 20 } = query;
    const where: any = {};
    if (user.role === Role.PRODUCTEUR) where.parcel = { ownerId: user.id };
    else if (user.role === Role.AGENT_TERRAIN) where.agentId = user.id;
    if (parcelId) where.parcelId = parcelId;
    if (agentId && [Role.SUPERVISEUR, Role.ADMIN].includes(user.role)) where.agentId = agentId;
    if (year) where.year = year;
    if (season) where.season = season;
    if (validatedOnly) where.validatedAt = { not: null };

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where, skip, take: limit,
        orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
        include: {
          agent: { select: { id: true, firstName: true, lastName: true } },
          parcel: { select: { id: true, name: true, village: true, region: true, superficie: true } },
          _count: { select: { species: true } },
        },
      }),
      this.prisma.inventory.count({ where }),
    ]);
    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: skip + limit < total } };
  }

  async findByParcel(parcelId: string, year?: number, user?: any) {
    const parcel = await this.prisma.parcel.findFirst({ where: { id: parcelId, deletedAt: null } });
    if (!parcel) throw new NotFoundException(`Parcelle ${parcelId} introuvable`);
    if (user?.role === Role.PRODUCTEUR && parcel.ownerId !== user.id) throw new ForbiddenException('Accès refusé');

    return this.prisma.inventory.findMany({
      where: { parcelId, ...(year ? { year } : {}) },
      orderBy: [{ year: 'desc' }, { season: 'asc' }],
      include: {
        agent: { select: { id: true, firstName: true, lastName: true } },
        species: { include: { species: { select: { id: true, scientificName: true, localNameFr: true, localNameMoore: true, category: true } } }, orderBy: { totalPieds: 'desc' } },
      },
    });
  }

  async findOne(id: string, user: any) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: {
        agent: { select: { id: true, firstName: true, lastName: true } },
        parcel: { select: { id: true, name: true, village: true, region: true, superficie: true, ownerId: true } },
        species: { include: { species: true }, orderBy: { totalPieds: 'desc' } },
      },
    });
    if (!inventory) throw new NotFoundException(`Inventaire ${id} introuvable`);
    if (user.role === Role.PRODUCTEUR && inventory.parcel.ownerId !== user.id) throw new ForbiddenException('Accès refusé');
    return inventory;
  }

  async update(id: string, dto: UpdateInventoryDto, user: any) {
    const inventory = await this.prisma.inventory.findUnique({ where: { id } });
    if (!inventory) throw new NotFoundException(`Inventaire ${id} introuvable`);
    if (user.role === Role.PRODUCTEUR) throw new ForbiddenException('Modification non autorisée');
    if (user.role === Role.AGENT_TERRAIN && inventory.agentId !== user.id) throw new ForbiddenException('Modification non autorisée');
    if (inventory.validatedAt && user.role === Role.AGENT_TERRAIN) throw new ForbiddenException('Inventaire validé — contactez un superviseur');

    let updateData: any = { ...(dto.observations !== undefined && { observations: dto.observations }), version: { increment: 1 } };

    if (dto.species?.length) {
      for (const sp of dto.species) {
        if (sp.selectedPieds > sp.totalPieds) throw new BadRequestException(`Espèce ${sp.speciesId}: pieds sélectionnés > total`);
      }
      updateData = {
        ...updateData,
        totalPieds: dto.species.reduce((s, sp) => s + sp.totalPieds, 0),
        selectedPieds: dto.species.reduce((s, sp) => s + sp.selectedPieds, 0),
        species: { deleteMany: {}, create: dto.species.map(sp => ({ ...sp })) },
      };
    }

    return this.prisma.inventory.update({
      where: { id },
      data: updateData,
      include: { species: { include: { species: true } }, agent: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async validate(id: string, validatorId: string) {
    const inventory = await this.prisma.inventory.findUnique({ where: { id }, include: { _count: { select: { species: true } } } });
    if (!inventory) throw new NotFoundException(`Inventaire ${id} introuvable`);
    if (inventory.validatedAt) throw new ConflictException('Inventaire déjà validé');
    if (inventory._count.species === 0) throw new BadRequestException('Impossible de valider un inventaire sans espèces');

    return this.prisma.inventory.update({
      where: { id },
      data: { validatedAt: new Date(), validatedBy: validatorId },
      include: { agent: { select: { firstName: true, lastName: true } }, parcel: { select: { name: true } } },
    });
  }

  async invalidate(id: string) {
    const inventory = await this.prisma.inventory.findUnique({ where: { id } });
    if (!inventory) throw new NotFoundException(`Inventaire ${id} introuvable`);
    return this.prisma.inventory.update({ where: { id }, data: { validatedAt: null, validatedBy: null } });
  }

  async remove(id: string, user: any) {
    const inventory = await this.prisma.inventory.findUnique({ where: { id } });
    if (!inventory) throw new NotFoundException(`Inventaire ${id} introuvable`);
    if (user.role === Role.PRODUCTEUR) throw new ForbiddenException('Non autorisé');
    if (user.role === Role.AGENT_TERRAIN && inventory.agentId !== user.id) throw new ForbiddenException('Non autorisé');
    if (inventory.validatedAt && user.role !== Role.ADMIN) throw new ForbiddenException('Impossible de supprimer un inventaire validé');
    await this.prisma.inventory.delete({ where: { id } });
    this.logger.log(`Inventaire ${id} supprimé par ${user.id}`);
  }

  async getStats(parcelId: string) {
    const inventories = await this.prisma.inventory.findMany({
      where: { parcelId },
      include: { species: { include: { species: true } } },
      orderBy: { year: 'asc' },
    });
    const evolution = inventories.map(inv => ({
      year: inv.year, season: inv.season,
      totalPieds: inv.totalPieds, selectedPieds: inv.selectedPieds,
      nbEspeces: inv.species.length, validated: !!inv.validatedAt,
    }));
    const speciesAgg: Record<string, any> = {};
    for (const inv of inventories) {
      for (const sp of inv.species) {
        if (!speciesAgg[sp.speciesId]) speciesAgg[sp.speciesId] = { species: sp.species, totalPieds: 0, maxPieds: 0 };
        speciesAgg[sp.speciesId].totalPieds += sp.totalPieds;
        speciesAgg[sp.speciesId].maxPieds = Math.max(speciesAgg[sp.speciesId].maxPieds, sp.totalPieds);
      }
    }
    return {
      totalInventaires: inventories.length,
      evolution,
      speciesRichesse: Object.values(speciesAgg).sort((a: any, b: any) => b.totalPieds - a.totalPieds),
      tendance: inventories.length >= 2 ? inventories[inventories.length - 1].totalPieds - inventories[0].totalPieds : 0,
    };
  }
}
