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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const analytics_service_1 = require("./analytics.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    getOverview() {
        return this.analyticsService.getOverview();
    }
    getEvolution(years = 5) {
        return this.analyticsService.getParcelEvolution(+years);
    }
    getByRegion() {
        return this.analyticsService.getParcelsByRegion();
    }
    getSpecies(limit = 10) {
        return this.analyticsService.getSpeciesDistribution(+limit);
    }
    getQuality() {
        return this.analyticsService.getDataQuality();
    }
    getExploitation() {
        return this.analyticsService.getExploitationStats();
    }
    getAgents(limit = 10) {
        return this.analyticsService.getAgentActivity(+limit);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, swagger_1.ApiOperation)({ summary: 'KPIs principaux pour le dashboard' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('evolution'),
    (0, swagger_1.ApiOperation)({ summary: 'Évolution annuelle des parcelles' }),
    __param(0, (0, common_1.Query)('years')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getEvolution", null);
__decorate([
    (0, common_1.Get)('regions'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques par région et province' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getByRegion", null);
__decorate([
    (0, common_1.Get)('species'),
    (0, swagger_1.ApiOperation)({ summary: 'Distribution des espèces RNA' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getSpecies", null);
__decorate([
    (0, common_1.Get)('quality'),
    (0, swagger_1.ApiOperation)({ summary: 'Score de qualité des données terrain' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getQuality", null);
__decorate([
    (0, common_1.Get)('exploitation'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques exploitation des produits' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getExploitation", null);
__decorate([
    (0, common_1.Get)('agents'),
    (0, current_user_decorator_1.Roles)(client_1.Role.SUPERVISEUR, client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Activité des agents terrain' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getAgents", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('analytics'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, jwt_auth_guard_1.RolesGuard),
    (0, current_user_decorator_1.Roles)(client_1.Role.SUPERVISEUR, client_1.Role.ADMIN, client_1.Role.AGENT_TERRAIN),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map