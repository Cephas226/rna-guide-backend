// ============================================================
// RNA Guide - DTOs Users
// ============================================================

import { ApiProperty, ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsEnum, IsEmail, IsBoolean,
  MinLength, MaxLength, Matches, IsUUID, IsInt, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Aminata' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Ouédraogo' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+22670123456' })
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, { message: 'Format téléphone invalide (ex: +22670123456)' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Centre-Nord' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional()
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
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Mot de passe actuel' })
  @IsString()
  @MinLength(1)
  currentPassword: string;

  @ApiProperty({ description: 'Nouveau mot de passe (min 8 caractères)' })
  @IsString()
  @MinLength(8, { message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' })
  @MaxLength(100)
  newPassword: string;
}

export class AdminChangeRoleDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role, { message: `Rôle invalide. Valeurs: ${Object.values(Role).join(', ')}` })
  role: Role;
}

export class QueryUserDto {
  @ApiPropertyOptional({ enum: Role })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ description: 'Recherche sur prénom, nom, téléphone, email' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrer par statut actif/inactif' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

export class RequestPasswordResetDto {
  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token reçu par email/SMS' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Nouveau mot de passe' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  newPassword: string;
}
