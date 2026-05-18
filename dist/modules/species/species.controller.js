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
exports.SpeciesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const species_service_1 = require("./species.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SpeciesController = class SpeciesController {
    constructor(speciesService) {
        this.speciesService = speciesService;
    }
    findAll(search, category) {
        return this.speciesService.findAll({ search, category });
    }
    findOne(id) {
        return this.speciesService.findOne(id);
    }
    create(dto) {
        return this.speciesService.create(dto);
    }
    update(id, dto) {
        return this.speciesService.update(id, dto);
    }
    remove(id) {
        return this.speciesService.remove(id);
    }
};
exports.SpeciesController = SpeciesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les espèces RNA (recherche multilingue: fr, mooré, dioula)' }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SpeciesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'une espèce avec ses observations terrain' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SpeciesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, current_user_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISEUR),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter une nouvelle espèce RNA au référentiel' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [species_service_1.CreateSpeciesDto]),
    __metadata("design:returntype", void 0)
], SpeciesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, current_user_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISEUR),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une espèce RNA' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SpeciesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, current_user_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une espèce (impossible si référencée dans des inventaires)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SpeciesController.prototype, "remove", null);
exports.SpeciesController = SpeciesController = __decorate([
    (0, swagger_1.ApiTags)('species'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, common_1.Controller)('species'),
    __metadata("design:paramtypes", [species_service_1.SpeciesService])
], SpeciesController);
//# sourceMappingURL=species.controller.js.map