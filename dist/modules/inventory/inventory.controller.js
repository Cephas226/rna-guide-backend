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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const inventory_service_1 = require("./inventory.service");
const inventory_dto_1 = require("./dto/inventory.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    create(dto, user) {
        return this.inventoryService.create(dto, user.id);
    }
    findAll(query, user) {
        return this.inventoryService.findAll(query, user);
    }
    findByParcel(parcelId, year, user) {
        return this.inventoryService.findByParcel(parcelId, year ? +year : undefined, user);
    }
    getStats(parcelId) {
        return this.inventoryService.getStats(parcelId);
    }
    findOne(id, user) {
        return this.inventoryService.findOne(id, user);
    }
    update(id, dto, user) {
        return this.inventoryService.update(id, dto, user);
    }
    validate(id, user) {
        return this.inventoryService.validate(id, user.id);
    }
    invalidate(id) {
        return this.inventoryService.invalidate(id);
    }
    remove(id, user) {
        return this.inventoryService.remove(id, user);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Post)(),
    (0, current_user_decorator_1.Roles)(client_1.Role.AGENT_TERRAIN, client_1.Role.SUPERVISEUR, client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un inventaire RNA pour une parcelle' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.CreateInventoryDto, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister tous les inventaires (filtres: parcelId, year, season, agentId)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.QueryInventoryDto, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('parcel/:parcelId'),
    (0, swagger_1.ApiOperation)({ summary: 'Inventaires d\'une parcelle spécifique' }),
    (0, swagger_1.ApiParam)({ name: 'parcelId', description: 'ID de la parcelle' }),
    __param(0, (0, common_1.Param)('parcelId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findByParcel", null);
__decorate([
    (0, common_1.Get)('parcel/:parcelId/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques et évolution RNA d\'une parcelle' }),
    __param(0, (0, common_1.Param)('parcelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail complet d\'un inventaire' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, current_user_decorator_1.Roles)(client_1.Role.AGENT_TERRAIN, client_1.Role.SUPERVISEUR, client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un inventaire (observations + espèces)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inventory_dto_1.UpdateInventoryDto, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/validate'),
    (0, current_user_decorator_1.Roles)(client_1.Role.SUPERVISEUR, client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Valider un inventaire (Superviseur/Admin uniquement)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "validate", null);
__decorate([
    (0, common_1.Patch)(':id/invalidate'),
    (0, current_user_decorator_1.Roles)(client_1.Role.SUPERVISEUR, client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Annuler la validation d\'un inventaire' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "invalidate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, current_user_decorator_1.Roles)(client_1.Role.AGENT_TERRAIN, client_1.Role.SUPERVISEUR, client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un inventaire (non validé uniquement, sauf Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "remove", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)('inventory'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map