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
var ParcelsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ParcelsService = ParcelsService_1 = class ParcelsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ParcelsService_1.name);
    }
    async create(dto, userId) {
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
                geometry: dto.geometry,
                gpsPoints: dto.gpsPoints,
                ownerId: userId,
                syncStatus: client_1.SyncStatus.SYNCED,
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
    async findAll(query, user) {
        const { region, province, commune, village, ownerId, page = 1, limit = 20, search, syncStatus, lat, lng, radiusKm, } = query;
        const effectiveOwnerId = user.role === client_1.Role.PRODUCTEUR ? user.id : ownerId;
        const where = {
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
    async findOne(id, user) {
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
        if (!parcel)
            throw new common_1.NotFoundException(`Parcelle ${id} introuvable`);
        if (user.role === client_1.Role.PRODUCTEUR && parcel.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Accès refusé');
        }
        return parcel;
    }
    async update(id, dto, user) {
        const parcel = await this.prisma.parcel.findFirst({
            where: { id, deletedAt: null },
        });
        if (!parcel)
            throw new common_1.NotFoundException(`Parcelle ${id} introuvable`);
        const canEdit = user.role !== client_1.Role.PRODUCTEUR || parcel.ownerId === user.id;
        if (!canEdit)
            throw new common_1.ForbiddenException('Modification non autorisée');
        const updated = await this.prisma.parcel.update({
            where: { id },
            data: {
                ...dto,
                geometry: dto.geometry,
                gpsPoints: dto.gpsPoints,
                version: { increment: 1 },
            },
            include: {
                owner: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        return updated;
    }
    async remove(id, user) {
        const parcel = await this.prisma.parcel.findFirst({
            where: { id, deletedAt: null },
        });
        if (!parcel)
            throw new common_1.NotFoundException(`Parcelle ${id} introuvable`);
        if (user.role === client_1.Role.PRODUCTEUR && parcel.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Suppression non autorisée');
        }
        if (user.role === client_1.Role.AGENT_TERRAIN) {
            throw new common_1.ForbiddenException('Les agents terrain ne peuvent pas supprimer de parcelles');
        }
        await this.prisma.parcel.update({
            where: { id },
            data: { deletedAt: new Date(), syncStatus: client_1.SyncStatus.DELETED },
        });
        this.logger.log(`Parcelle ${id} supprimée (soft) par ${user.id}`);
    }
    async getStatsByRegion() {
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
    async getGeoJson(query, user) {
        const { data } = await this.findAll({ ...query, limit: 5000 }, user);
        return {
            type: 'FeatureCollection',
            features: data.map((p) => ({
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
};
exports.ParcelsService = ParcelsService;
exports.ParcelsService = ParcelsService = ParcelsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ParcelsService);
//# sourceMappingURL=parcels.service.js.map