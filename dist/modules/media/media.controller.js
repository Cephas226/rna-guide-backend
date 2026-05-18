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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const media_service_1 = require("./media.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let MediaController = class MediaController {
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    uploadPhoto(file, dto, user) {
        return this.mediaService.uploadPhoto(file, dto, user.id);
    }
    getByParcel(parcelId, year, limit) {
        return this.mediaService.getPhotosByParcel(parcelId, {
            year: year ? +year : undefined,
            limit: limit ? +limit : undefined,
        });
    }
    getBeforeAfter(parcelId, photoPointId) {
        return this.mediaService.getBeforeAfter(parcelId, photoPointId);
    }
    getStats(parcelId) {
        return this.mediaService.getPhotoStats(parcelId);
    }
    getSignedUrl(id, expires) {
        return this.mediaService.getSignedUrl(id, expires ? +expires : 3600);
    }
    deletePhoto(id, user) {
        return this.mediaService.deletePhoto(id, user.id);
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('photos/upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Uploader une photo terrain (JPEG/PNG/WebP, max 10 Mo)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                parcelId: { type: 'string', format: 'uuid' },
                photoPointId: { type: 'string', format: 'uuid' },
                latitude: { type: 'number' },
                longitude: { type: 'number' },
                takenAt: { type: 'string', format: 'date-time' },
                notes: { type: 'string' },
                year: { type: 'integer' },
            },
            required: ['file', 'parcelId'],
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "uploadPhoto", null);
__decorate([
    (0, common_1.Get)('photos/parcel/:parcelId'),
    (0, swagger_1.ApiOperation)({ summary: 'Photos d\'une parcelle (optionnel: filtrer par année)' }),
    __param(0, (0, common_1.Param)('parcelId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "getByParcel", null);
__decorate([
    (0, common_1.Get)('photos/parcel/:parcelId/comparison'),
    (0, swagger_1.ApiOperation)({ summary: 'Comparaison avant/après par point photo (suivi pluriannuel)' }),
    __param(0, (0, common_1.Param)('parcelId')),
    __param(1, (0, common_1.Query)('photoPointId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "getBeforeAfter", null);
__decorate([
    (0, common_1.Get)('photos/parcel/:parcelId/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques photos d\'une parcelle' }),
    __param(0, (0, common_1.Param)('parcelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('photos/:id/signed-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir une URL signée temporaire pour une photo privée' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('expires')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "getSignedUrl", null);
__decorate([
    (0, common_1.Delete)('photos/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une photo (soft delete + suppression Supabase)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "deletePhoto", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('media'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map