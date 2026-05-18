// ============================================================
// RNA Guide - DTOs Authentification
// ============================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail, IsOptional, IsString, MinLength, MaxLength,
  IsEnum, Matches, IsPhoneNumber,
} from 'class-validator';
import { Role } from '@prisma/client';

// ── Register ─────────────────────────────────────────────────

export class RegisterDto {
  @ApiPropertyOptional({ example: 'aminata.ouedraogo@gmail.com' })
  @IsEmail({}, { message: 'Email invalide' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+22670123456' })
  @IsString()
  @IsOptional()
  @Matches(/^\+[1-9]\d{7,14}$/, { message: 'Format téléphone invalide (ex: +22670123456)' })
  phone?: string;

  @ApiProperty({ example: 'Aminata' })
  @IsString()
  @MinLength(2, { message: 'Prénom trop court' })
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Ouédraogo' })
  @IsString()
  @MinLength(2, { message: 'Nom trop court' })
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: 'Rna2024!' })
  @IsString()
  @MinLength(8, { message: 'Mot de passe minimum 8 caractères' })
  @MaxLength(100)
  password: string;

  @ApiPropertyOptional({ enum: Role, default: Role.PRODUCTEUR })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({ example: 'Centre-Nord' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({ example: 'Bam' })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ example: 'Kongoussi' })
  @IsString()
  @IsOptional()
  commune?: string;

  @ApiPropertyOptional({ example: 'Koudtenga' })
  @IsString()
  @IsOptional()
  village?: string;
}

// ── Login ────────────────────────────────────────────────────

export class LoginDto {
  @ApiPropertyOptional({ example: 'aminata@gmail.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+22670123456' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Rna2024!' })
  @IsString()
  @MinLength(1)
  password: string;
}

// ── Refresh Token ────────────────────────────────────────────

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
