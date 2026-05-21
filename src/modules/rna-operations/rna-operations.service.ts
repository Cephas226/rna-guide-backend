import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SyncStatus } from '@prisma/client';
import { CreateRnaOperationDto } from './dto/rna-operation.dto';

@Injectable()
export class RnaOperationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByParcel(parcelId: string) {
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

  async delete(id: string) {
    return this.prisma.rnaOperation.update({
      where: { id },
      data: { syncStatus: SyncStatus.DELETED },
    });
  }
}
