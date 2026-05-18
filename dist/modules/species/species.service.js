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
exports.SpeciesService = exports.CreateSpeciesDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateSpeciesDto {
}
exports.CreateSpeciesDto = CreateSpeciesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Faidherbia albida' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSpeciesDto.prototype, "scientificName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Gonakier' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSpeciesDto.prototype, "localNameFr", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Zaanré' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSpeciesDto.prototype, "localNameMoore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSpeciesDto.prototype, "localNameDioula", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSpeciesDto.prototype, "localNameFulfule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'arbre', description: 'arbre | arbuste | liane' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSpeciesDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateSpeciesDto.prototype, "isNative", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSpeciesDto.prototype, "ecologicalRole", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSpeciesDto.prototype, "usageDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSpeciesDto.prototype, "imageUrl", void 0);
let SpeciesService = class SpeciesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { search, category, isNative } = query;
        const where = {};
        if (category)
            where.category = category;
        if (isNative !== undefined)
            where.isNative = isNative;
        if (search) {
            where.OR = [
                { scientificName: { contains: search, mode: 'insensitive' } },
                { localNameFr: { contains: search, mode: 'insensitive' } },
                { localNameMoore: { contains: search, mode: 'insensitive' } },
                { localNameDioula: { contains: search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.species.findMany({
            where,
            orderBy: { localNameFr: 'asc' },
            include: { _count: { select: { inventorySpecies: true } } },
        });
    }
    async findOne(id) {
        const species = await this.prisma.species.findUnique({
            where: { id },
            include: {
                _count: { select: { inventorySpecies: true } },
                inventorySpecies: {
                    take: 5,
                    orderBy: { totalPieds: 'desc' },
                    include: { inventory: { include: { parcel: { select: { name: true, region: true } } } } },
                },
            },
        });
        if (!species)
            throw new common_1.NotFoundException(`Espèce ${id} introuvable`);
        return species;
    }
    async create(dto) {
        const existing = await this.prisma.species.findUnique({ where: { scientificName: dto.scientificName } });
        if (existing)
            throw new common_1.ConflictException(`Espèce "${dto.scientificName}" déjà enregistrée`);
        return this.prisma.species.create({ data: dto });
    }
    async update(id, dto) {
        const species = await this.prisma.species.findUnique({ where: { id } });
        if (!species)
            throw new common_1.NotFoundException(`Espèce ${id} introuvable`);
        return this.prisma.species.update({ where: { id }, data: dto });
    }
    async remove(id) {
        const species = await this.prisma.species.findUnique({
            where: { id },
            include: { _count: { select: { inventorySpecies: true } } },
        });
        if (!species)
            throw new common_1.NotFoundException(`Espèce ${id} introuvable`);
        if (species._count.inventorySpecies > 0) {
            throw new common_1.ConflictException(`Impossible de supprimer: cette espèce est référencée dans ${species._count.inventorySpecies} inventaire(s)`);
        }
        await this.prisma.species.delete({ where: { id } });
    }
};
exports.SpeciesService = SpeciesService;
exports.SpeciesService = SpeciesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SpeciesService);
//# sourceMappingURL=species.service.js.map