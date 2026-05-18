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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const parcels_service_1 = require("./parcels.service");
const create_parcel_dto_1 = require("./dto/create-parcel.dto");
const update_parcel_dto_1 = require("./dto/update-parcel.dto");
const query_parcel_dto_1 = require("./dto/query-parcel.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const current_user_decorator_2 = require("../../common/decorators/current-user.decorator");
let ParcelsController = class ParcelsController {
    constructor(parcelsService) {
        this.parcelsService = parcelsService;
    }
    async create(dto, user) {
        return this.parcelsService.create(dto, user.id);
    }
    async findAll(query, user) {
        return this.parcelsService.findAll(query, user);
    }
    async getGeoJson(query, user) {
        return this.parcelsService.getGeoJson(query, user);
    }
    async getStatsByRegion() {
        return this.parcelsService.getStatsByRegion();
    }
    async findOne(id, user) {
        return this.parcelsService.findOne(id, user);
    }
    async update(id, dto, user) {
        return this.parcelsService.update(id, dto, user);
    }
    async remove(id, user) {
        await this.parcelsService.remove(id, user);
    }
};
exports.ParcelsController = ParcelsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une nouvelle parcelle RNA' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Parcelle créée avec succès' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_parcel_dto_1.CreateParcelDto, Object]),
    __metadata("design:returntype", Promise)
], ParcelsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les parcelles avec filtres et pagination' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_parcel_dto_1.QueryParcelDto, Object]),
    __metadata("design:returntype", Promise)
], ParcelsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('geojson'),
    (0, swagger_1.ApiOperation)({ summary: 'Exporter les parcelles en format GeoJSON (pour Leaflet)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_parcel_dto_1.QueryParcelDto, Object]),
    __metadata("design:returntype", Promise)
], ParcelsController.prototype, "getGeoJson", null);
__decorate([
    (0, common_1.Get)('stats/regions'),
    (0, current_user_decorator_2.Roles)(client_1.Role.SUPERVISEUR, client_1.Role.ADMIN, client_1.Role.AGENT_TERRAIN),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques des parcelles par région' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ParcelsController.prototype, "getStatsByRegion", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir le détail complet d\'une parcelle' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Parcelle introuvable' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ParcelsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une parcelle RNA' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_parcel_dto_1.UpdateParcelDto, Object]),
    __metadata("design:returntype", Promise)
], ParcelsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, current_user_decorator_2.Roles)(client_1.Role.SUPERVISEUR, client_1.Role.ADMIN, client_1.Role.PRODUCTEUR),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une parcelle (soft delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ParcelsController.prototype, "remove", null);
exports.ParcelsController = ParcelsController = __decorate([
    (0, swagger_1.ApiTags)('parcels'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, common_1.Controller)('parcels'),
    __metadata("design:paramtypes", [parcels_service_1.ParcelsService])
], ParcelsController);
//# sourceMappingURL=parcels.controller.js.map