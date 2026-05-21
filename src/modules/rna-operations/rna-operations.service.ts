import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SyncStatus } from '@prisma/client';
import { CreateRnaOperationDto } from './dto/rna-operation.dto';

@Injectable()
export class RnaOperationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByParcel(parcelId: string, userId: string, userRole: string) {
    const parcel = await this.prisma.parcel.findFirst({
      where: { id: parcelId, deletedAt: null },
    });
    if (!parcel) throw new NotFoundException(`Parcelle ${parcelId} introuvable`);
    if (userRole === 'PRODUCTEUR' && parcel.ownerId !== userId) {
      throw new ForbiddenException('Accès refusé à cette parcelle');
    }
    return this.prisma.rnaOperation.findMany({
      where: { parcelId, syncStatus: { not: SyncStatus.DELETED } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async create(dto: CreateRnaOperationDto, userId: string) {
    return this.prisma.rnaOperation.create({
      data: {
        localId: dto.localId,
        parcelId: dto.parcelId,
        userId,
        category: dto.category,
        operationType: dto.operationType,
        month: dto.month,
        year: dto.year,
        notes: dto.notes,
        syncStatus: SyncStatus.SYNCED,
      },
    });
  }

  async delete(id: string, userId: string, userRole: string) {
    const operation = await this.prisma.rnaOperation.findUnique({ where: { id } });
    if (!operation) throw new NotFoundException(`Opération RNA ${id} introuvable`);
    if (userRole === 'PRODUCTEUR' && operation.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres opérations');
    }
    return this.prisma.rnaOperation.update({
      where: { id },
      data: { syncStatus: SyncStatus.DELETED },
    });
  }
}
