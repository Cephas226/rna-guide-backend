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
exports.SyncController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sync_service_1 = require("./sync.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SyncController = class SyncController {
    constructor(syncService) {
        this.syncService = syncService;
    }
    async push(dto, user) {
        return this.syncService.push(dto, user.id);
    }
    async pull(lastSyncAt, entityTypesRaw, user) {
        const dto = {
            lastSyncAt: lastSyncAt ?? new Date(0).toISOString(),
            entityTypes: entityTypesRaw ? entityTypesRaw.split(',') : undefined,
        };
        return this.syncService.pull(dto, user.id);
    }
    async getStatus(user) {
        return this.syncService.getDeviceStatus(user.id);
    }
    async resolve(syncLogId, body, user) {
        return this.syncService.resolveConflict(syncLogId, body.resolution, body.clientPayload);
    }
};
exports.SyncController = SyncController;
__decorate([
    (0, common_1.Post)('push'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'PUSH: envoyer les mutations offline vers le serveur',
        description: 'Traite un batch de créations/mises à jour/suppressions faites hors ligne',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Résultat de synchronisation avec statut par item' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "push", null);
__decorate([
    (0, common_1.Get)('pull'),
    (0, swagger_1.ApiOperation)({
        summary: 'PULL: télécharger les deltas depuis lastSyncAt',
        description: 'Retourne toutes les entités modifiées depuis la dernière synchronisation',
    }),
    __param(0, (0, common_1.Query)('lastSyncAt')),
    __param(1, (0, common_1.Query)('entityTypes')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "pull", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Statut de synchronisation de l\'appareil' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('resolve/:syncLogId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Résoudre manuellement un conflit de synchronisation' }),
    __param(0, (0, common_1.Param)('syncLogId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "resolve", null);
exports.SyncController = SyncController = __decorate([
    (0, swagger_1.ApiTags)('sync'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sync'),
    __metadata("design:paramtypes", [sync_service_1.SyncService])
], SyncController);
//# sourceMappingURL=sync.controller.js.map