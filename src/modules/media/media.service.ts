// ============================================================
// RNA Guide - Media Service (complet)
// Upload Supabase + compression + suppression + listing
// ============================================================

import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SyncStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo

@Injectable()
export class MediaService {
  private readonly supabase: SupabaseClient | null = null;
  private readonly bucket: string;
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const url = this.config.get<string>('app.supabase.url');
    const key = this.config.get<string>('app.supabase.serviceKey');
    this.bucket = this.config.get<string>('app.supabase.bucket') ?? 'rna-photos';

    if (url && key && url.startsWith('https://')) {
      this.supabase = createClient(url, key);
      this.logger.log('✅ Supabase Storage configuré');
    } else {
      this.logger.warn('⚠️  Supabase non configuré — mode placeholder actif');
    }
  }

  // ── Upload photo ──────────────────────────────────────────

  async uploadPhoto(
    file: Express.Multer.File,
    dto: {
      localId?: string;
      parcelId: string;
      photoPointId?: string;
      latitude?: number;
      longitude?: number;
      takenAt?: string;
      notes?: string;
      year?: number;
    },
    userId: string,
  ) {
    if (!file) throw new BadRequestException('Fichier image requis');

    // Validation MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Format non supporté: ${file.mimetype}. Formats acceptés: JPEG, PNG, WebP`,
      );
    }

    // Validation taille
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(1)} Mo. Maximum: 10 Mo`,
      );
    }

    // Vérifier que la parcelle existe
    const parcel = await this.prisma.parcel.findFirst({
      where: { id: dto.parcelId, deletedAt: null },
      select: { id: true, name: true },
    });
    if (!parcel) throw new NotFoundException(`Parcelle ${dto.parcelId} introuvable`);

    const localId = dto.localId ?? uuidv4();
    const year = dto.year ?? new Date().getFullYear();
    const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const fileName = `parcels/${dto.parcelId}/${year}/${localId}.${ext}`;

    let storageUrl = `https://placeholder.rna-guide.bf/${fileName}`;
    let thumbnailUrl: string | null = null;

    // Upload vers Supabase
    if (this.supabase) {
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
          cacheControl: '31536000', // 1 an
        });

      if (error) {
        this.logger.error(`Erreur upload Supabase: ${error.message}`);
        throw new BadRequestException(`Erreur upload: ${error.message}`);
      }

      const { data: urlData } = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(fileName);
      storageUrl = urlData.publicUrl;

      // URL thumbnail (Supabase transform)
      thumbnailUrl = `${storageUrl}?width=400&height=300&resize=contain`;

      this.logger.log(`Photo uploadée: ${fileName} (${(file.size / 1024).toFixed(0)} KB)`);
    }

    // Sauvegarder en base
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
        syncStatus: SyncStatus.SYNCED,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        photoPoint: true,
      },
    });
  }

  // ── Lister les photos d'une parcelle ──────────────────────

  async getPhotosByParcel(parcelId: string, options?: { year?: number; limit?: number }) {
    const parcel = await this.prisma.parcel.findFirst({
      where: { id: parcelId, deletedAt: null },
    });
    if (!parcel) throw new NotFoundException(`Parcelle ${parcelId} introuvable`);

    return this.prisma.photo.findMany({
      where: {
        parcelId,
        syncStatus: { not: SyncStatus.DELETED },
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

  // ── Comparer avant/après (même photo point, années différentes) ──

  async getBeforeAfter(parcelId: string, photoPointId?: string) {
    const where: any = { parcelId, syncStatus: { not: SyncStatus.DELETED } };
    if (photoPointId) where.photoPointId = photoPointId;

    const photos = await this.prisma.photo.findMany({
      where,
      orderBy: [{ photoPointId: 'asc' }, { takenAt: 'asc' }],
      include: { photoPoint: true, author: { select: { firstName: true, lastName: true } } },
    });

    // Grouper par point photo
    const grouped: Record<string, any[]> = {};
    for (const photo of photos) {
      const key = photo.photoPointId ?? 'sans_point';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(photo);
    }

    return Object.entries(grouped).map(([pointId, photos]) => ({
      photoPointId: pointId !== 'sans_point' ? pointId : null,
      photoPointName: photos[0]?.photoPoint?.name ?? 'Sans point de référence',
      photos,
      hasComparison: photos.length >= 2,
    }));
  }

  // ── Supprimer une photo ───────────────────────────────────

  async deletePhoto(id: string, userId: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException(`Photo ${id} introuvable`);

    // Supprimer de Supabase si configuré et pas un placeholder
    if (this.supabase && !photo.storageUrl.includes('placeholder')) {
      const path = photo.storageUrl.split(`/${this.bucket}/`)[1];
      if (path) {
        const { error } = await this.supabase.storage.from(this.bucket).remove([path]);
        if (error) this.logger.warn(`Erreur suppression Supabase: ${error.message}`);
        else this.logger.log(`Photo supprimée de Supabase: ${path}`);
      }
    }

    // Soft delete en base
    await this.prisma.photo.update({
      where: { id },
      data: { syncStatus: SyncStatus.DELETED },
    });
  }

  // ── Générer une URL signée (accès temporaire) ─────────────

  async getSignedUrl(id: string, expiresInSeconds = 3600) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException(`Photo ${id} introuvable`);

    if (!this.supabase || photo.storageUrl.includes('placeholder')) {
      return { signedUrl: photo.storageUrl, expiresIn: expiresInSeconds };
    }

    const path = photo.storageUrl.split(`/${this.bucket}/`)[1];
    if (!path) return { signedUrl: photo.storageUrl, expiresIn: expiresInSeconds };

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error) throw new BadRequestException(`Erreur génération URL: ${error.message}`);
    return { signedUrl: data.signedUrl, expiresIn: expiresInSeconds };
  }

  // ── Statistiques photos ───────────────────────────────────

  async getPhotoStats(parcelId: string) {
    const photos = await this.prisma.photo.findMany({
      where: { parcelId, syncStatus: { not: SyncStatus.DELETED } },
      select: { year: true, sizeBytes: true, takenAt: true },
    });

    const byYear: Record<number, number> = {};
    let totalSize = 0;

    for (const p of photos) {
      if (p.year) byYear[p.year] = (byYear[p.year] ?? 0) + 1;
      if (p.sizeBytes) totalSize += p.sizeBytes;
    }

    return {
      total: photos.length,
      totalSizeMb: Math.round(totalSize / 1024 / 1024 * 10) / 10,
      byYear: Object.entries(byYear).map(([year, count]) => ({ year: +year, count })).sort((a, b) => a.year - b.year),
      lastPhotoAt: photos.sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime())[0]?.takenAt ?? null,
    };
  }
}
