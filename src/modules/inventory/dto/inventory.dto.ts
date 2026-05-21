// ============================================================
// RNA Guide - DTOs Inventaire RNA
// ============================================================

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsEnum, IsArray,
  IsBoolean, IsUUID, Min, Max, ValidateNested, IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Season } from '@prisma/client';

// ── Relevé d'une espèce ───────────────────────────────────────

export class CreateInventorySpeciesDto {
  @ApiProperty({ description: "ID de l'espèce RNA" })
  @IsUUID()
  speciesId: string;

  @ApiProperty({ example: 2, description: 'Nombre de pieds h ≤ 1m' })
  @IsInt()
  @Min(0)
  piedsH1: number;

  @ApiProperty({ example: 3, description: 'Nombre de pieds 1m < h ≤ 2m' })
  @IsInt()
  @Min(0)
  piedsH2: number;

  @ApiProperty({ example: 1, description: 'Nombre de pieds h > 2m' })
  @IsInt()
  @Min(0)
  piedsH3: number;

  @ApiProperty({ example: 4, description: 'Nombre de pieds sélectionnés RNA' })
  @IsInt()
  @Min(0)
  selectedPieds: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

// ── Créer un inventaire ───────────────────────────────────────

export class CreateInventoryDto {
  @ApiPropertyOptional({ description: 'UUID local généré offline' })
  @IsUUID()
  @IsOptional()
  localId?: string;

  @ApiProperty({ description: 'ID de la parcelle' })
  @IsUUID()
  parcelId: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  @Min(2015)
  @Max(2100)
  year: number;

  @ApiProperty({ enum: Season })
  @IsEnum(Season)
  season: Season;

  @ApiPropertyOptional({ example: 'Bonne densité de Faidherbia observée en zone nord.' })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiProperty({ type: [CreateInventorySpeciesDto], description: 'Relevés par espèce' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInventorySpeciesDto)
  species: CreateInventorySpeciesDto[];
}

// ── Modifier un inventaire ────────────────────────────────────

export class UpdateInventoryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiPropertyOptional({ type: [CreateInventorySpeciesDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInventorySpeciesDto)
  @IsOptional()
  species?: CreateInventorySpeciesDto[];
}

// ── Query inventaires ─────────────────────────────────────────

export class QueryInventoryDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  parcelId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  agentId?: string;

  @ApiPropertyOptional({ example: 2024 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({ enum: Season })
  @IsEnum(Season)
  @IsOptional()
  season?: Season;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  validatedOnly?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
