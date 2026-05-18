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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverview() {
        const [totalUsers, totalParcels, totalInventories, totalPhotos, totalExploitations, pendingSync, conflicts, superficieAgg, parcelsThisMonth, usersThisMonth,] = await Promise.all([
            this.prisma.user.count({ where: { isActive: true, deletedAt: null } }),
            this.prisma.parcel.count({ where: { deletedAt: null } }),
            this.prisma.inventory.count(),
            this.prisma.photo.count({ where: { syncStatus: { not: client_1.SyncStatus.DELETED } } }),
            this.prisma.exploitation.count({ where: { syncStatus: { not: client_1.SyncStatus.DELETED } } }),
            this.prisma.parcel.count({ where: { syncStatus: client_1.SyncStatus.PENDING, deletedAt: null } }),
            this.prisma.syncLog.count({ where: { resolution: null, conflictWith: { not: client_1.Prisma.AnyNull } } }),
            this.prisma.parcel.aggregate({ _sum: { superficie: true }, where: { deletedAt: null } }),
            this.prisma.parcel.count({
                where: {
                    deletedAt: null,
                    createdAt: { gte: new Date(new Date().setDate(1)) },
                },
            }),
            this.prisma.user.count({
                where: {
                    createdAt: { gte: new Date(new Date().setDate(1)) },
                    deletedAt: null,
                },
            }),
        ]);
        const usersByRole = await this.prisma.user.groupBy({
            by: ['role'],
            where: { isActive: true, deletedAt: null },
            _count: { _all: true },
        });
        return {
            kpis: {
                totalUsers,
                totalParcels,
                totalInventories,
                totalPhotos,
                totalExploitations,
                totalSuperficieHa: Math.round((superficieAgg._sum.superficie ?? 0) * 10) / 10,
                avgSuperficieHa: totalParcels > 0
                    ? Math.round(((superficieAgg._sum.superficie ?? 0) / totalParcels) * 10) / 10
                    : 0,
                pendingSync,
                unresolvedConflicts: conflicts,
                newParcelsThisMonth: parcelsThisMonth,
                newUsersThisMonth: usersThisMonth,
            },
            usersByRole: usersByRole.reduce((acc, r) => {
                acc[r.role] = r._count._all;
                return acc;
            }, {}),
        };
    }
    async getParcelEvolution(years = 5) {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - years + 1;
        const data = [];
        for (let year = startYear; year <= currentYear; year++) {
            const [count, superficie] = await Promise.all([
                this.prisma.parcel.count({
                    where: {
                        deletedAt: null,
                        createdAt: { lte: new Date(`${year}-12-31`) },
                    },
                }),
                this.prisma.parcel.aggregate({
                    _sum: { superficie: true },
                    where: {
                        deletedAt: null,
                        createdAt: { lte: new Date(`${year}-12-31`) },
                    },
                }),
            ]);
            data.push({
                year,
                parcels: count,
                superficieHa: Math.round((superficie._sum.superficie ?? 0) * 10) / 10,
            });
        }
        return data;
    }
    async getParcelsByRegion() {
        const stats = await this.prisma.parcel.groupBy({
            by: ['region', 'province'],
            where: { deletedAt: null },
            _count: { _all: true },
            _sum: { superficie: true },
            orderBy: { _count: { region: 'desc' } },
        });
        const byRegion = {};
        for (const s of stats) {
            if (!byRegion[s.region]) {
                byRegion[s.region] = { region: s.region, totalParcels: 0, totalSuperficie: 0, provinces: [] };
            }
            byRegion[s.region].totalParcels += s._count._all;
            byRegion[s.region].totalSuperficie += s._sum.superficie ?? 0;
            byRegion[s.region].provinces.push({
                province: s.province,
                parcels: s._count._all,
                superficieHa: Math.round((s._sum.superficie ?? 0) * 10) / 10,
            });
        }
        return Object.values(byRegion).map((r) => ({
            ...r,
            totalSuperficie: Math.round(r.totalSuperficie * 10) / 10,
        }));
    }
    async getSpeciesDistribution(limit = 10) {
        const speciesStats = await this.prisma.inventorySpecies.groupBy({
            by: ['speciesId'],
            _sum: { totalPieds: true, selectedPieds: true },
            _count: { _all: true },
            orderBy: { _sum: { totalPieds: 'desc' } },
            take: limit,
        });
        const speciesDetails = await this.prisma.species.findMany({
            where: { id: { in: speciesStats.map(s => s.speciesId) } },
        });
        const speciesMap = new Map(speciesDetails.map(s => [s.id, s]));
        return speciesStats.map(s => ({
            species: speciesMap.get(s.speciesId),
            totalPieds: s._sum.totalPieds ?? 0,
            selectedPieds: s._sum.selectedPieds ?? 0,
            inventoriesCount: s._count._all,
        }));
    }
    async getDataQuality() {
        const totalParcels = await this.prisma.parcel.count({ where: { deletedAt: null } });
        if (totalParcels === 0)
            return { score: 0 };
        const [withGps, withPhotos, withInventory, withExploitation, validated,] = await Promise.all([
            this.prisma.parcel.count({
                where: { deletedAt: null, latitude: { not: 0 }, longitude: { not: 0 } },
            }),
            this.prisma.parcel.count({
                where: { deletedAt: null, photos: { some: {} } },
            }),
            this.prisma.parcel.count({
                where: { deletedAt: null, inventories: { some: {} } },
            }),
            this.prisma.parcel.count({
                where: { deletedAt: null, exploitations: { some: {} } },
            }),
            this.prisma.inventory.count({ where: { validatedAt: { not: null } } }),
        ]);
        const totalInventories = await this.prisma.inventory.count();
        const metrics = {
            gpsComplet: Math.round((withGps / totalParcels) * 100),
            photosJointes: Math.round((withPhotos / totalParcels) * 100),
            inventaireFait: Math.round((withInventory / totalParcels) * 100),
            exploitationSuivie: Math.round((withExploitation / totalParcels) * 100),
            donneesValidees: totalInventories > 0 ? Math.round((validated / totalInventories) * 100) : 0,
        };
        const score = Math.round(metrics.gpsComplet * 0.25 +
            metrics.photosJointes * 0.20 +
            metrics.inventaireFait * 0.25 +
            metrics.exploitationSuivie * 0.15 +
            metrics.donneesValidees * 0.15);
        return { ...metrics, score };
    }
    async getExploitationStats() {
        const byProduct = await this.prisma.exploitation.groupBy({
            by: ['productType', 'destination'],
            _count: { _all: true },
            _sum: { quantity: true, priceXOF: true },
        });
        const totalRevenue = await this.prisma.exploitation.aggregate({
            _sum: { priceXOF: true },
            where: { destination: 'vente', priceXOF: { not: null } },
        });
        return {
            byProduct,
            totalRevenueXOF: totalRevenue._sum.priceXOF ?? 0,
        };
    }
    async getAgentActivity(limit = 10) {
        const agents = await this.prisma.user.findMany({
            where: { role: client_1.Role.AGENT_TERRAIN, isActive: true },
            select: {
                id: true, firstName: true, lastName: true, region: true, lastSyncAt: true,
                _count: { select: { inventories: true, photos: true } },
            },
            orderBy: { lastSyncAt: 'desc' },
            take: limit,
        });
        return agents;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map