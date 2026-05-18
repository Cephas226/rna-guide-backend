// ============================================================
// RNA Guide - Users Controller (complet)
// ============================================================

import {
  Controller, Get, Patch, Delete, Post, Body, Param,
  Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import {
  UpdateUserDto, ChangePasswordDto, AdminChangeRoleDto,
  QueryUserDto, RequestPasswordResetDto, ResetPasswordDto,
} from './dto/user.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, Roles } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth('JWT')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── Endpoints publics (reset password) ───────────────────

  @Post('password/request-reset')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demander une réinitialisation de mot de passe (email ou téléphone)' })
  requestReset(@Body() dto: RequestPasswordResetDto) {
    return this.usersService.requestPasswordReset(dto);
  }

  @Post('password/reset')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Réinitialiser le mot de passe avec le token reçu' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(dto);
  }

  // ── Endpoints authentifiés ────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERVISEUR, Role.AGENT_TERRAIN)
  @ApiOperation({ summary: 'Lister les utilisateurs (filtres: rôle, région, recherche)' })
  findAll(@Query() query: QueryUserDto, @CurrentUser() user: any) {
    return this.usersService.findAll(query, user);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Statistiques globales des utilisateurs (Admin uniquement)' })
  getStats() {
    return this.usersService.getGlobalStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Profil complet d\'un utilisateur' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Modifier le profil d\'un utilisateur (soi-même ou Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: any) {
    return this.usersService.update(id, dto, user);
  }

  @Patch(':id/password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Changer son mot de passe' })
  changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto, @CurrentUser() user: any) {
    return this.usersService.changePassword(id, dto, user);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Changer le rôle d\'un utilisateur (Admin uniquement)' })
  changeRole(@Param('id') id: string, @Body() dto: AdminChangeRoleDto, @CurrentUser() user: any) {
    return this.usersService.changeRole(id, dto, user.id);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERVISEUR)
  @ApiOperation({ summary: 'Activer ou désactiver un compte utilisateur' })
  toggleActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
    @CurrentUser() user: any,
  ) {
    return this.usersService.toggleActive(id, isActive, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un compte utilisateur (soft delete, Admin uniquement)' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.remove(id, user.id);
  }
}
