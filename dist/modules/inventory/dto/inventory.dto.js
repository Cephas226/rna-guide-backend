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
exports.QueryInventoryDto = exports.UpdateInventoryDto = exports.CreateInventoryDto = exports.CreateInventorySpeciesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class CreateInventorySpeciesDto {
}
exports.CreateInventorySpeciesDto = CreateInventorySpeciesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de l\'espèce RNA' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateInventorySpeciesDto.prototype, "speciesId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45, description: 'Nombre total de pieds observés' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateInventorySpeciesDto.prototype, "totalPieds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 18, description: 'Nombre de pieds sélectionnés RNA' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateInventorySpeciesDto.prototype, "selectedPieds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.HealthState, default: client_1.HealthState.BON }),
    (0, class_validator_1.IsEnum)(client_1.HealthState),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInventorySpeciesDto.prototype, "healthState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 185.5, description: 'Hauteur moyenne en cm' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(3000),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateInventorySpeciesDto.prototype, "heightCm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInventorySpeciesDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false, description: 'Espèce nouvellement observée sur cette parcelle' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateInventorySpeciesDto.prototype, "isNewSpecies", void 0);
class CreateInventoryDto {
}
exports.CreateInventoryDto = CreateInventoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'UUID local généré offline' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "localId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la parcelle' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "parcelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2024 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2015),
    (0, class_validator_1.Max)(2100),
    __metadata("design:type", Number)
], CreateInventoryDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.Season }),
    (0, class_validator_1.IsEnum)(client_1.Season),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "season", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Bonne densité de Faidherbia observée en zone nord.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInventoryDto.prototype, "observations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CreateInventorySpeciesDto], description: 'Relevés par espèce' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateInventorySpeciesDto),
    __metadata("design:type", Array)
], CreateInventoryDto.prototype, "species", void 0);
class UpdateInventoryDto {
}
exports.UpdateInventoryDto = UpdateInventoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateInventoryDto.prototype, "observations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [CreateInventorySpeciesDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateInventorySpeciesDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateInventoryDto.prototype, "species", void 0);
class QueryInventoryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.QueryInventoryDto = QueryInventoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryInventoryDto.prototype, "parcelId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryInventoryDto.prototype, "agentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2024 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryInventoryDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.Season }),
    (0, class_validator_1.IsEnum)(client_1.Season),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryInventoryDto.prototype, "season", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], QueryInventoryDto.prototype, "validatedOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryInventoryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 20 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryInventoryDto.prototype, "limit", void 0);
//# sourceMappingURL=inventory.dto.js.map