import {
  Controller, Get, Post, Delete, Body, Param,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RnaOperationsService } from './rna-operations.service';
import { CreateRnaOperationDto } from './dto/rna-operation.dto';

@ApiTags('rna-operations')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('rna-operations')
export class RnaOperationsController {
  constructor(private readonly service: RnaOperationsService) {}

  @Get('parcel/:parcelId')
  @ApiOperation({ summary: 'Lister les opérations RNA d\'une parcelle' })
  findByParcel(@Param('parcelId') parcelId: string) {
    return this.service.findByParcel(parcelId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une opération RNA' })
  create(@Body() dto: CreateRnaOperationDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer (soft) une opération RNA' })
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
