// ============================================================
// RNA Guide - Analytics Controller
// ============================================================

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/current-user.decorator';

@ApiTags('analytics')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERVISEUR, Role.ADMIN, Role.AGENT_TERRAIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'KPIs principaux pour le dashboard' })
  getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('evolution')
  @ApiOperation({ summary: 'Évolution annuelle des parcelles' })
  getEvolution(@Query('years') years = 5) {
    return this.analyticsService.getParcelEvolution(+years);
  }

  @Get('regions')
  @ApiOperation({ summary: 'Statistiques par région et province' })
  getByRegion() {
    return this.analyticsService.getParcelsByRegion();
  }

  @Get('species')
  @ApiOperation({ summary: 'Distribution des espèces RNA' })
  getSpecies(@Query('limit') limit = 10) {
    return this.analyticsService.getSpeciesDistribution(+limit);
  }

  @Get('quality')
  @ApiOperation({ summary: 'Score de qualité des données terrain' })
  getQuality() {
    return this.analyticsService.getDataQuality();
  }

  @Get('exploitation')
  @ApiOperation({ summary: 'Statistiques exploitation des produits' })
  getExploitation() {
    return this.analyticsService.getExploitationStats();
  }

  @Get('agents')
  @Roles(Role.SUPERVISEUR, Role.ADMIN)
  @ApiOperation({ summary: 'Activité des agents terrain' })
  getAgents(@Query('limit') limit = 10) {
    return this.analyticsService.getAgentActivity(+limit);
  }
}
