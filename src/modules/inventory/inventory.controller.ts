// ============================================================
// RNA Guide - Inventory Controller (complet)
// ============================================================

import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto, QueryInventoryDto } from './dto/inventory.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, Roles } from '../../common/decorators/current-user.decorator';

@ApiTags('inventory')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles(Role.AGENT_TERRAIN, Role.SUPERVISEUR, Role.ADMIN)
  @ApiOperation({ summary: 'Créer un inventaire RNA pour une parcelle' })
  create(@Body() dto: CreateInventoryDto, @CurrentUser() user: any) {
    return this.inventoryService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les inventaires (filtres: parcelId, year, season, agentId)' })
  findAll(@Query() query: QueryInventoryDto, @CurrentUser() user: any) {
    return this.inventoryService.findAll(query, user);
  }

  @Get('parcel/:parcelId')
  @ApiOperation({ summary: 'Inventaires d\'une parcelle spécifique' })
  @ApiParam({ name: 'parcelId', description: 'ID de la parcelle' })
  findByParcel(
    @Param('parcelId') parcelId: string,
    @Query('year') year?: string,
    @CurrentUser() user?: any,
  ) {
    return this.inventoryService.findByParcel(parcelId, year ? +year : undefined, user);
  }

  @Get('parcel/:parcelId/stats')
  @ApiOperation({ summary: 'Statistiques et évolution RNA d\'une parcelle' })
  getStats(@Param('parcelId') parcelId: string) {
    return this.inventoryService.getStats(parcelId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail complet d\'un inventaire' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inventoryService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.AGENT_TERRAIN, Role.SUPERVISEUR, Role.ADMIN)
  @ApiOperation({ summary: 'Modifier un inventaire (observations + espèces)' })
  update(@Param('id') id: string, @Body() dto: UpdateInventoryDto, @CurrentUser() user: any) {
    return this.inventoryService.update(id, dto, user);
  }

  @Patch(':id/validate')
  @Roles(Role.SUPERVISEUR, Role.ADMIN)
  @ApiOperation({ summary: 'Valider un inventaire (Superviseur/Admin uniquement)' })
  validate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inventoryService.validate(id, user.id);
  }

  @Patch(':id/invalidate')
  @Roles(Role.SUPERVISEUR, Role.ADMIN)
  @ApiOperation({ summary: 'Annuler la validation d\'un inventaire' })
  invalidate(@Param('id') id: string) {
    return this.inventoryService.invalidate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.AGENT_TERRAIN, Role.SUPERVISEUR, Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer un inventaire (non validé uniquement, sauf Admin)' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inventoryService.remove(id, user);
  }
}
