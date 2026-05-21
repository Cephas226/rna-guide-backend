import { IsString, IsInt, Min, Max, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RnaCategory } from '@prisma/client';

export class CreateRnaOperationDto {
  @ApiProperty({ description: 'UUID de la parcelle' })
  @IsUUID()
  parcelId: string;

  @ApiProperty({ enum: RnaCategory })
  @IsEnum(RnaCategory)
  category: RnaCategory;

  @ApiProperty({ description: 'Type d\'opération (ex: TAILLE, ZAI, CORDONS_PIERREUX)' })
  @IsString()
  operationType: string;

  @ApiProperty({ minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ minimum: 2000, maximum: 2100 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'UUID généré offline sur le mobile' })
  @IsString()
  @IsOptional()
  localId?: string;
}
