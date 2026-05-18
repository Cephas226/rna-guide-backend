// ============================================================
// RNA Guide - DTOs Parcelles
// ============================================================

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString, IsNumber, IsOptional, IsEnum, IsArray,
  Min, Max, MinLength, MaxLength, IsObject, IsUUID,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SyncStatus } from '@prisma/client';

// ── GPS Point ────────────────────────────────────────────────

export class GpsPointDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

// ── Create Parcel ────────────────────────────────────────────

export class CreateParcelDto {
  @ApiPropertyOptional({ description: 'UUID généré en offline sur le téléphone' })
  @IsUUID()
  @IsOptional()
  localId?: string;

  @ApiProperty({ example: 'Champ RNA Koudtenga 1' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Centre-Nord' })
  @IsString()
  region: string;

  @ApiProperty({ example: 'Bam' })
  @IsString()
  province: string;

  @ApiProperty({ example: 'Kongoussi' })
  @IsString()
  commune: string;

  @ApiProperty({ example: 'Koudtenga' })
  @IsString()
  village: string;

  @ApiProperty({ example: 2.4, description: 'Superficie en hectares' })
  @IsNumber()
  @Min(0.01)
  @Max(1000)
  @Type(() => Number)
  superficie: number;

  @ApiProperty({ example: 13.5247 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude: number;

  @ApiProperty({ example: -1.5247 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude: number;

  @ApiPropertyOptional({ description: 'GeoJSON polygon' })
  @IsObject()
  @IsOptional()
  geometry?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Points GPS délimitant la parcelle' })
  @IsArray()
  @IsOptional()
  gpsPoints?: GpsPointDto[];

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @IsOptional()
  notes?: string;
}

// ── Update Parcel ────────────────────────────────────────────

export class UpdateParcelDto extends PartialType(CreateParcelDto) {}

// ── Query Parcel ─────────────────────────────────────────────

export class QueryParcelDto {
  @ApiPropertyOptional({ example: 'Centre-Nord' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({ example: 'Bam' })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  commune?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  village?: string;

  @ApiPropertyOptional({ description: 'ID du propriétaire (admin/superviseur seulement)' })
  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @ApiPropertyOptional({ enum: SyncStatus })
  @IsEnum(SyncStatus)
  @IsOptional()
  syncStatus?: SyncStatus;

  @ApiPropertyOptional({ description: 'Recherche texte libre' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Latitude centre (pour filtre géographique)' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @ApiPropertyOptional({ description: 'Longitude centre (pour filtre géographique)' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lng?: number;

  @ApiPropertyOptional({ description: 'Rayon en km (pour filtre géographique)' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  radiusKm?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 200 })
  @IsNumber()
  @Min(1)
  @Max(200)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
