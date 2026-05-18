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
var MediaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const supabase_js_1 = require("@supabase/supabase-js");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
let MediaService = MediaService_1 = class MediaService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.supabase = null;
        this.logger = new common_1.Logger(MediaService_1.name);
        const url = this.config.get('app.supabase.url');
        const key = this.config.get('app.supabase.serviceKey');
        this.bucket = this.config.get('app.supabase.bucket') ?? 'rna-photos';
        if (url && key && url.startsWith('https://')) {
            this.supabase = (0, supabase_js_1.createClient)(url, key);
            this.logger.log('✅ Supabase Storage configuré');
        }
        else {
            this.logger.warn('⚠️  Supabase non configuré — mode placeholder actif');
        }
    }
    async uploadPhoto(file, dto, userId) {
        if (!file)
            throw new common_1.BadRequestException('Fichier image requis');
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Format non supporté: ${file.mimetype}. Formats acceptés: JPEG, PNG, WebP`);
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            throw new common_1.BadRequestException(`Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(1)} Mo. Maximum: 10 Mo`);
        }
        const parcel = await this.prisma.parcel.findFirst({
            where: { id: dto.parcelId, deletedAt: null },
            select: { id: true, name: true },
        });
        if (!parcel)
            throw new common_1.NotFoundException(`Parcelle ${dto.parcelId} introuvable`);
        const localId = dto.localId ?? (0, uuid_1.v4)();
        const year = dto.year ?? new Date().getFullYear();
        const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
        const fileName = `parcels/${dto.parcelId}/${year}/${localId}.${ext}`;
        let storageUrl = `https://placeholder.rna-guide.bf/${fileName}`;
        let thumbnailUrl = null;
        if (this.supabase) {
            const { data, error } = await this.supabase.storage
                .from(this.bucket)
                .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
                cacheControl: '31536000',
            });
            if (error) {
                this.logger.error(`Erreur upload Supabase: ${error.message}`);
                throw new common_1.BadRequestException(`Erreur upload: ${error.message}`);
            }
            const { data: urlData } = this.supabase.storage
                .from(this.bucket)
                .getPublicUrl(fileName);
            storageUrl = urlData.publicUrl;
            thumbnailUrl = `${storageUrl}?width=400&height=300&resize=contain`;
            this.logger.log(`Photo uploadée: ${fileName} (${(file.size / 1024).toFixed(0)} KB)`);
        }
        return this.prisma.photo.create({
            data: {
                localId,
                parcelId: dto.parcelId,
                authorId: userId,
                photoPointId: dto.photoPointId ?? null,
                storageUrl,
                thumbnailUrl,
                originalName: file.originalname,
                sizeBytes: file.size,
                mimeType: file.mimetype,
                latitude: dto.latitude ? Number(dto.latitude) : null,
                longitude: dto.longitude ? Number(dto.longitude) : null,
                takenAt: dto.takenAt ? new Date(dto.takenAt) : new Date(),
                notes: dto.notes,
                year,
                syncStatus: client_1.SyncStatus.SYNCED,
            },
            include: {
                author: { select: { id: true, firstName: true, lastName: true } },
                photoPoint: true,
            },
        });
    }
    async getPhotosByParcel(parcelId, options) {
        const parcel = await this.prisma.parcel.findFirst({
            where: { id: parcelId, deletedAt: null },
        });
        if (!parcel)
            throw new common_1.NotFoundException(`Parcelle ${parcelId} introuvable`);
        return this.prisma.photo.findMany({
            where: {
                parcelId,
                syncStatus: { not: client_1.SyncStatus.DELETED },
                ...(options?.year && { year: options.year }),
            },
            orderBy: { takenAt: 'desc' },
            take: options?.limit ?? 50,
            include: {
                author: { select: { id: true, firstName: true, lastName: true } },
                photoPoint: true,
            },
        });
    }
    async getBeforeAfter(parcelId, photoPointId) {
        const where = { parcelId, syncStatus: { not: client_1.SyncStatus.DELETED } };
        if (photoPointId)
            where.photoPointId = photoPointId;
        const photos = await this.prisma.photo.findMany({
            where,
            orderBy: [{ photoPointId: 'asc' }, { takenAt: 'asc' }],
            include: { photoPoint: true, author: { select: { firstName: true, lastName: true } } },
        });
        const grouped = {};
        for (const photo of photos) {
            const key = photo.photoPointId ?? 'sans_point';
            if (!grouped[key])
                grouped[key] = [];
            grouped[key].push(photo);
        }
        return Object.entries(grouped).map(([pointId, photos]) => ({
            photoPointId: pointId !== 'sans_point' ? pointId : null,
            photoPointName: photos[0]?.photoPoint?.name ?? 'Sans point de référence',
            photos,
            hasComparison: photos.length >= 2,
        }));
    }
    async deletePhoto(id, userId) {
        const photo = await this.prisma.photo.findUnique({ where: { id } });
        if (!photo)
            throw new common_1.NotFoundException(`Photo ${id} introuvable`);
        if (this.supabase && !photo.storageUrl.includes('placeholder')) {
            const path = photo.storageUrl.split(`/${this.bucket}/`)[1];
            if (path) {
                const { error } = await this.supabase.storage.from(this.bucket).remove([path]);
                if (error)
                    this.logger.warn(`Erreur suppression Supabase: ${error.message}`);
                else
                    this.logger.log(`Photo supprimée de Supabase: ${path}`);
            }
        }
        await this.prisma.photo.update({
            where: { id },
            data: { syncStatus: client_1.SyncStatus.DELETED },
        });
    }
    async getSignedUrl(id, expiresInSeconds = 3600) {
        const photo = await this.prisma.photo.findUnique({ where: { id } });
        if (!photo)
            throw new common_1.NotFoundException(`Photo ${id} introuvable`);
        if (!this.supabase || photo.storageUrl.includes('placeholder')) {
            return { signedUrl: photo.storageUrl, expiresIn: expiresInSeconds };
        }
        const path = photo.storageUrl.split(`/${this.bucket}/`)[1];
        if (!path)
            return { signedUrl: photo.storageUrl, expiresIn: expiresInSeconds };
        const { data, error } = await this.supabase.storage
            .from(this.bucket)
            .createSignedUrl(path, expiresInSeconds);
        if (error)
            throw new common_1.BadRequestException(`Erreur génération URL: ${error.message}`);
        return { signedUrl: data.signedUrl, expiresIn: expiresInSeconds };
    }
    async getPhotoStats(parcelId) {
        const photos = await this.prisma.photo.findMany({
            where: { parcelId, syncStatus: { not: client_1.SyncStatus.DELETED } },
            select: { year: true, sizeBytes: true, takenAt: true },
        });
        const byYear = {};
        let totalSize = 0;
        for (const p of photos) {
            if (p.year)
                byYear[p.year] = (byYear[p.year] ?? 0) + 1;
            if (p.sizeBytes)
                totalSize += p.sizeBytes;
        }
        return {
            total: photos.length,
            totalSizeMb: Math.round(totalSize / 1024 / 1024 * 10) / 10,
            byYear: Object.entries(byYear).map(([year, count]) => ({ year: +year, count })).sort((a, b) => a.year - b.year),
            lastPhotoAt: photos.sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime())[0]?.takenAt ?? null,
        };
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = MediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], MediaService);
//# sourceMappingURL=media.service.js.map