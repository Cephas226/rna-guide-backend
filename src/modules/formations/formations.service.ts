import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class FormationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    const { category, lang = 'fr', updatedSince } = query;
    const where: any = { isPublished: true };
    if (category) where.category = category;
    if (updatedSince) where.updatedAt = { gte: new Date(updatedSince) };
    return this.prisma.formation.findMany({ where, orderBy: { orderIndex: 'asc' } });
  }

  async findOne(id: string) {
    const f = await this.prisma.formation.findUnique({ where: { id } });
    if (!f) throw new NotFoundException('Formation introuvable');
    await this.prisma.formation.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return f;
  }

  async create(dto: any) {
    return this.prisma.formation.create({ data: { ...dto, mediaUrls: dto.mediaUrls ?? [] } });
  }

  async update(id: string, dto: any) {
    return this.prisma.formation.update({ where: { id }, data: dto });
  }
}
