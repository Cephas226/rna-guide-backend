// ============================================================
// RNA Guide - Parcels Controller
// ============================================================

import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ParcelsService } from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { QueryParcelDto } from './dto/query-parcel.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/current-user.decorator';

@ApiTags('parcels')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('parcels')
export class ParcelsController {
  constructor(private readonly parcelsService: ParcelsService) {}

  // ── POST /parcels ─────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle parcelle RNA' })
  @ApiResponse({ status: 201, description: 'Parcelle créée avec succès' })
  async create(@Body() dto: CreateParcelDto, @CurrentUser() user: any) {
    return this.parcelsService.create(dto, user.id);
  }

  // ── GET /parcels ──────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Lister les parcelles avec filtres et pagination' })
  async findAll(@Query() query: QueryParcelDto, @CurrentUser() user: any) {
    return this.parcelsService.findAll(query, user);
  }

  // ── GET /parcels/geojson ──────────────────────────────────

  @Get('geojson')
  @ApiOperation({ summary: 'Exporter les parcelles en format GeoJSON (pour Leaflet)' })
  async getGeoJson(@Query() query: QueryParcelDto, @CurrentUser() user: any) {
    return this.parcelsService.getGeoJson(query, user);
  }

  // ── GET /parcels/stats/regions ────────────────────────────

  @Get('stats/regions')
  @Roles(Role.SUPERVISEUR, Role.ADMIN, Role.AGENT_TERRAIN)
  @ApiOperation({ summary: 'Statistiques des parcelles par région' })
  async getStatsByRegion() {
    return this.parcelsService.getStatsByRegion();
  }

  // ── GET /parcels/:id ──────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir le détail complet d\'une parcelle' })
  @ApiResponse({ status: 404, description: 'Parcelle introuvable' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.parcelsService.findOne(id, user);
  }

  // ── PATCH /parcels/:id ────────────────────────────────────

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une parcelle RNA' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateParcelDto,
    @CurrentUser() user: any,
  ) {
    return this.parcelsService.update(id, dto, user);
  }

  // ── DELETE /parcels/:id ───────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.SUPERVISEUR, Role.ADMIN, Role.PRODUCTEUR)
  @ApiOperation({ summary: 'Supprimer une parcelle (soft delete)' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.parcelsService.remove(id, user);
  }
}
