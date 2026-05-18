// ============================================================
// RNA Guide - Module Parcelles RNA (Complet)
// ============================================================

// ── parcels.module.ts ────────────────────────────────────────
import { Module } from '@nestjs/common';
import { ParcelsController } from './parcels.controller';
import { ParcelsService } from './parcels.service';

// @Module export
const ParcelsModule_config = {
  controllers: [ParcelsController],
  providers: [ParcelsService],
  exports: [ParcelsService],
};

export { ParcelsModule_config as ParcelsModuleConfig };

// ── Re-exports ────────────────────────────────────────────────
export { ParcelsController } from './parcels.controller';
export { ParcelsService } from './parcels.service';
