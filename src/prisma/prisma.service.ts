// ============================================================
// RNA Guide - Prisma Service
// ============================================================

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error']
        : ['warn', 'error'],
      errorFormat: 'colorless',
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Connexion PostgreSQL établie');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Soft delete helper - applique deletedAt au lieu de supprimer
   */
  async softDelete(model: string, id: string): Promise<void> {
    await (this as any)[model].update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Filtre automatique des soft-deleted dans les requêtes
   */
  excludeDeleted<T extends { deletedAt?: Date | null }>(data: T[]): T[] {
    return data.filter(item => !item.deletedAt);
  }
}
