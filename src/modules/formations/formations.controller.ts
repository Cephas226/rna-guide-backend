import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { FormationsService } from './formations.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/jwt-auth.guard';
import { Roles, Public } from '../../common/decorators/current-user.decorator';

@ApiTags('formations') @ApiBearerAuth('JWT') @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('formations')
export class FormationsController {
  constructor(private readonly formationsService: FormationsService) {}
  @Get() findAll(@Query() query: any) { return this.formationsService.findAll(query); }
  @Get(':id') findOne(@Param('id') id: string) { return this.formationsService.findOne(id); }
  @Post() @Roles(Role.ADMIN, Role.SUPERVISEUR) create(@Body() dto: any) { return this.formationsService.create(dto); }
  @Patch(':id') @Roles(Role.ADMIN, Role.SUPERVISEUR) update(@Param('id') id: string, @Body() dto: any) { return this.formationsService.update(id, dto); }
}
