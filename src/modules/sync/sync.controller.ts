// ============================================================
// RNA Guide - Sync Controller
// ============================================================

import {
  Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SyncService, SyncPushDto, SyncPullDto } from './sync.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('sync')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  /**
   * PUSH: envoyer les mutations offline du mobile vers le serveur.
   * Corps: { items: SyncPushItem[], deviceId, lastSyncAt }
   */
  @Post('push')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'PUSH: envoyer les mutations offline vers le serveur',
    description: 'Traite un batch de créations/mises à jour/suppressions faites hors ligne',
  })
  @ApiResponse({ status: 200, description: 'Résultat de synchronisation avec statut par item' })
  async push(@Body() dto: SyncPushDto, @CurrentUser() user: any) {
    return this.syncService.push(dto, user.id);
  }

  /**
   * PULL: télécharger les deltas depuis lastSyncAt.
   * Le mobile appelle cet endpoint au retour en ligne.
   */
  @Get('pull')
  @ApiOperation({
    summary: 'PULL: télécharger les deltas depuis lastSyncAt',
    description: 'Retourne toutes les entités modifiées depuis la dernière synchronisation',
  })
  async pull(
    @Query('lastSyncAt') lastSyncAt: string,
    @Query('entityTypes') entityTypesRaw: string,
    @CurrentUser() user: any,
  ) {
    const dto: SyncPullDto = {
      lastSyncAt: lastSyncAt ?? new Date(0).toISOString(),
      entityTypes: entityTypesRaw ? entityTypesRaw.split(',') : undefined,
    };
    return this.syncService.pull(dto, user.id);
  }

  /**
   * STATUS: état de synchronisation de l'appareil courant
   */
  @Get('status')
  @ApiOperation({ summary: 'Statut de synchronisation de l\'appareil' })
  async getStatus(@CurrentUser() user: any) {
    return this.syncService.getDeviceStatus(user.id);
  }

  /**
   * RESOLVE: résoudre manuellement un conflit
   */
  @Post('resolve/:syncLogId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Résoudre manuellement un conflit de synchronisation' })
  async resolve(
    @Param('syncLogId') syncLogId: string,
    @Body() body: { resolution: 'client_wins' | 'server_wins'; clientPayload?: any },
    @CurrentUser() user: any,
  ) {
    return this.syncService.resolveConflict(syncLogId, body.resolution, body.clientPayload);
  }
}
