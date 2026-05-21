import { IsString, IsInt, Min, Max, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { RnaCategory } from '@prisma/client';

export class CreateRnaOperationDto {
  @IsUUID()
  parcelId: string;

  @IsEnum(RnaCategory)
  category: RnaCategory;

  @IsString()
  operationType: string;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  year: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  localId?: string;
}
