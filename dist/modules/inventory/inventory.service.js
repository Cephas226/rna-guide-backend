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
var InventoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let InventoryService = InventoryService_1 = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(InventoryService_1.name);
    }
    async create(dto, userId) {
        const parcel = await this.prisma.parcel.findFirst({ where: { id: dto.parcelId, deletedAt: null } });
        if (!parcel)
            throw new common_1.NotFoundException(`Parcelle ${dto.parcelId} introuvable`);
        const existing = await this.prisma.inventory.findFirst({
            where: { parcelId: dto.parcelId, year: dto.year, season: dto.season },
        });
        if (existing)
            throw new common_1.ConflictException(`Inventaire ${dto.year}/${dto.season} déjà existant pour cette parcelle`);
        if (dto.species?.length) {
            const ids = dto.species.map(s => s.speciesId);
            const found = await this.prisma.species.findMany({ where: { id: { in: ids } }, select: { id: true } });
            const missing = ids.filter(id => !found.find(f => f.id === id));
            if (missing.length)
                throw new common_1.BadRequestException(`Espèces introuvables: ${missing.join(', ')}`);
            for (const sp of dto.species) {
                const total = sp.piedsH1 + sp.piedsH2 + sp.piedsH3;
                if (sp.selectedPieds > total)
                    throw new common_1.BadRequestException(`Espèce ${sp.speciesId}: pieds sélectionnés (${sp.selectedPieds}) > total (${total})`);
            }
        }
        const totalPieds = dto.species?.reduce((s, sp) => s + sp.piedsH1 + sp.piedsH2 + sp.piedsH3, 0) ?? 0;
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
                syncStatus: client_1.SyncStatus.SYNCED,
                species: dto.species?.length ? {
                    create: dto.species.map(sp => ({
                        speciesId: sp.speciesId,
                        piedsH1: sp.piedsH1,
                        piedsH2: sp.piedsH2,
                        piedsH3: sp.piedsH3,
                        totalPieds: sp.piedsH1 + sp.piedsH2 + sp.piedsH3,
                        selectedPieds: sp.selectedPieds,
                        notes: sp.notes,
                    }))
                } : undefined,
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
    async findAll(query, user) {
        const { parcelId, agentId, year, season, validatedOnly, page = 1, limit = 20 } = query;
        const where = {};
        if (user.role === client_1.Role.PRODUCTEUR)
            where.parcel = { ownerId: user.id };
        else if (user.role === client_1.Role.AGENT_TERRAIN)
            where.agentId = user.id;
        if (parcelId)
            where.parcelId = parcelId;
        if (agentId && [client_1.Role.SUPERVISEUR, client_1.Role.ADMIN].includes(user.role))
            where.agentId = agentId;
        if (year)
            where.year = year;
        if (season)
            where.season = season;
        if (validatedOnly)
            where.validatedAt = { not: null };
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
    async findByParcel(parcelId, year, user) {
        const parcel = await this.prisma.parcel.findFirst({ where: { id: parcelId, deletedAt: null } });
        if (!parcel)
            throw new common_1.NotFoundException(`Parcelle ${parcelId} introuvable`);
        if (user?.role === client_1.Role.PRODUCTEUR && parcel.ownerId !== user.id)
            throw new common_1.ForbiddenException('Accès refusé');
        return this.prisma.inventory.findMany({
            where: { parcelId, ...(year ? { year } : {}) },
            orderBy: [{ year: 'desc' }, { season: 'asc' }],
            include: {
                agent: { select: { id: true, firstName: true, lastName: true } },
                species: { include: { species: { select: { id: true, scientificName: true, localNameFr: true, localNameMoore: true, category: true } } }, orderBy: { totalPieds: 'desc' } },
            },
        });
    }
    async findOne(id, user) {
        const inventory = await this.prisma.inventory.findUnique({
            where: { id },
            include: {
                agent: { select: { id: true, firstName: true, lastName: true } },
                parcel: { select: { id: true, name: true, village: true, region: true, superficie: true, ownerId: true } },
                species: { include: { species: true }, orderBy: { totalPieds: 'desc' } },
            },
        });
        if (!inventory)
            throw new common_1.NotFoundException(`Inventaire ${id} introuvable`);
        if (user.role === client_1.Role.PRODUCTEUR && inventory.parcel.ownerId !== user.id)
            throw new common_1.ForbiddenException('Accès refusé');
        return inventory;
    }
    async update(id, dto, user) {
        const inventory = await this.prisma.inventory.findUnique({ where: { id } });
        if (!inventory)
            throw new common_1.NotFoundException(`Inventaire ${id} introuvable`);
        if (user.role === client_1.Role.PRODUCTEUR)
            throw new common_1.ForbiddenException('Modification non autorisée');
        if (user.role === client_1.Role.AGENT_TERRAIN && inventory.agentId !== user.id)
            throw new common_1.ForbiddenException('Modification non autorisée');
        if (inventory.validatedAt && user.role === client_1.Role.AGENT_TERRAIN)
            throw new common_1.ForbiddenException('Inventaire validé — contactez un superviseur');
        let updateData = { ...(dto.observations !== undefined && { observations: dto.observations }), version: { increment: 1 } };
        if (dto.species?.length) {
            for (const sp of dto.species) {
                const total = sp.piedsH1 + sp.piedsH2 + sp.piedsH3;
                if (sp.selectedPieds > total)
                    throw new common_1.BadRequestException(`Espèce ${sp.speciesId}: pieds sélectionnés > total`);
            }
            updateData = {
                ...updateData,
                totalPieds: dto.species.reduce((s, sp) => s + sp.piedsH1 + sp.piedsH2 + sp.piedsH3, 0),
                selectedPieds: dto.species.reduce((s, sp) => s + sp.selectedPieds, 0),
                species: {
                    deleteMany: {},
                    create: dto.species.map(sp => ({
                        speciesId: sp.speciesId,
                        piedsH1: sp.piedsH1,
                        piedsH2: sp.piedsH2,
                        piedsH3: sp.piedsH3,
                        totalPieds: sp.piedsH1 + sp.piedsH2 + sp.piedsH3,
                        selectedPieds: sp.selectedPieds,
                        notes: sp.notes,
                    })),
                },
            };
        }
        return this.prisma.inventory.update({
            where: { id },
            data: updateData,
            include: { species: { include: { species: true } }, agent: { select: { id: true, firstName: true, lastName: true } } },
        });
    }
    async validate(id, validatorId) {
        const inventory = await this.prisma.inventory.findUnique({ where: { id }, include: { _count: { select: { species: true } } } });
        if (!inventory)
            throw new common_1.NotFoundException(`Inventaire ${id} introuvable`);
        if (inventory.validatedAt)
            throw new common_1.ConflictException('Inventaire déjà validé');
        if (inventory._count.species === 0)
            throw new common_1.BadRequestException('Impossible de valider un inventaire sans espèces');
        return this.prisma.inventory.update({
            where: { id },
            data: { validatedAt: new Date(), validatedBy: validatorId },
            include: { agent: { select: { firstName: true, lastName: true } }, parcel: { select: { name: true } } },
        });
    }
    async invalidate(id) {
        const inventory = await this.prisma.inventory.findUnique({ where: { id } });
        if (!inventory)
            throw new common_1.NotFoundException(`Inventaire ${id} introuvable`);
        return this.prisma.inventory.update({ where: { id }, data: { validatedAt: null, validatedBy: null } });
    }
    async remove(id, user) {
        const inventory = await this.prisma.inventory.findUnique({ where: { id } });
        if (!inventory)
            throw new common_1.NotFoundException(`Inventaire ${id} introuvable`);
        if (user.role === client_1.Role.PRODUCTEUR)
            throw new common_1.ForbiddenException('Non autorisé');
        if (user.role === client_1.Role.AGENT_TERRAIN && inventory.agentId !== user.id)
            throw new common_1.ForbiddenException('Non autorisé');
        if (inventory.validatedAt && user.role !== client_1.Role.ADMIN)
            throw new common_1.ForbiddenException('Impossible de supprimer un inventaire validé');
        await this.prisma.inventory.delete({ where: { id } });
        this.logger.log(`Inventaire ${id} supprimé par ${user.id}`);
    }
    async getStats(parcelId) {
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
        const speciesAgg = {};
        for (const inv of inventories) {
            for (const sp of inv.species) {
                if (!speciesAgg[sp.speciesId])
                    speciesAgg[sp.speciesId] = { species: sp.species, totalPieds: 0, maxPieds: 0 };
                speciesAgg[sp.speciesId].totalPieds += sp.totalPieds;
                speciesAgg[sp.speciesId].maxPieds = Math.max(speciesAgg[sp.speciesId].maxPieds, sp.totalPieds);
            }
        }
        return {
            totalInventaires: inventories.length,
            evolution,
            speciesRichesse: Object.values(speciesAgg).sort((a, b) => b.totalPieds - a.totalPieds),
            tendance: inventories.length >= 2 ? inventories[inventories.length - 1].totalPieds - inventories[0].totalPieds : 0,
        };
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = InventoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map