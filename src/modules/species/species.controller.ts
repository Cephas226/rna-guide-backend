import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { SpeciesService, CreateSpeciesDto } from './species.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/current-user.decorator';

@ApiTags('species')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('species')
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les espèces RNA (recherche multilingue: fr, mooré, dioula)' })
  findAll(@Query('search') search?: string, @Query('category') category?: string) {
    return this.speciesService.findAll({ search, category });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une espèce avec ses observations terrain' })
  findOne(@Param('id') id: string) {
    return this.speciesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPERVISEUR)
  @ApiOperation({ summary: 'Ajouter une nouvelle espèce RNA au référentiel' })
  create(@Body() dto: CreateSpeciesDto) {
    return this.speciesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERVISEUR)
  @ApiOperation({ summary: 'Modifier une espèce RNA' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateSpeciesDto>) {
    return this.speciesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer une espèce (impossible si référencée dans des inventaires)' })
  remove(@Param('id') id: string) {
    return this.speciesService.remove(id);
  }
}
