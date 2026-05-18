// ============================================================
// RNA Guide - Module Synchronisation Offline-First
// Le cœur critique du système
// ============================================================

import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
