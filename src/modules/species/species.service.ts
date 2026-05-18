import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpeciesDto {
  @ApiProperty({ example: 'Faidherbia albida' })
  @IsString() scientificName: string;
  @ApiPropertyOptional({ example: 'Gonakier' }) @IsString() @IsOptional() localNameFr?: string;
  @ApiPropertyOptional({ example: 'Zaanré' }) @IsString() @IsOptional() localNameMoore?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() localNameDioula?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() localNameFulfule?: string;
  @ApiProperty({ example: 'arbre', description: 'arbre | arbuste | liane' }) @IsString() category: string;
  @ApiPropertyOptional({ default: true }) @IsBoolean() @IsOptional() isNative?: boolean;
  @ApiPropertyOptional() @IsString() @IsOptional() ecologicalRole?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() usageDescription?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() imageUrl?: string;
}

@Injectable()
export class SpeciesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { search?: string; category?: string; isNative?: boolean }) {
    const { search, category, isNative } = query;
    const where: any = {};
    if (category) where.category = category;
    if (isNative !== undefined) where.isNative = isNative;
    if (search) {
      where.OR = [
        { scientificName: { contains: search, mode: 'insensitive' } },
        { localNameFr: { contains: search, mode: 'insensitive' } },
        { localNameMoore: { contains: search, mode: 'insensitive' } },
        { localNameDioula: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.species.findMany({
      where,
      orderBy: { localNameFr: 'asc' },
      include: { _count: { select: { inventorySpecies: true } } },
    });
  }

  async findOne(id: string) {
    const species = await this.prisma.species.findUnique({
      where: { id },
      include: {
        _count: { select: { inventorySpecies: true } },
        inventorySpecies: {
          take: 5,
          orderBy: { totalPieds: 'desc' },
          include: { inventory: { include: { parcel: { select: { name: true, region: true } } } } },
        },
      },
    });
    if (!species) throw new NotFoundException(`Espèce ${id} introuvable`);
    return species;
  }

  async create(dto: CreateSpeciesDto) {
    const existing = await this.prisma.species.findUnique({ where: { scientificName: dto.scientificName } });
    if (existing) throw new ConflictException(`Espèce "${dto.scientificName}" déjà enregistrée`);
    return this.prisma.species.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateSpeciesDto>) {
    const species = await this.prisma.species.findUnique({ where: { id } });
    if (!species) throw new NotFoundException(`Espèce ${id} introuvable`);
    return this.prisma.species.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const species = await this.prisma.species.findUnique({
      where: { id },
      include: { _count: { select: { inventorySpecies: true } } },
    });
    if (!species) throw new NotFoundException(`Espèce ${id} introuvable`);
    if (species._count.inventorySpecies > 0) {
      throw new ConflictException(`Impossible de supprimer: cette espèce est référencée dans ${species._count.inventorySpecies} inventaire(s)`);
    }
    await this.prisma.species.delete({ where: { id } });
  }
}
