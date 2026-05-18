import {
  Controller, Get, Post, Delete, Param, Query, Body,
  UseGuards, UseInterceptors, UploadedFile, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('media')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('photos/upload')
  @ApiOperation({ summary: 'Uploader une photo terrain (JPEG/PNG/WebP, max 10 Mo)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        parcelId: { type: 'string', format: 'uuid' },
        photoPointId: { type: 'string', format: 'uuid' },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        takenAt: { type: 'string', format: 'date-time' },
        notes: { type: 'string' },
        year: { type: 'integer' },
      },
      required: ['file', 'parcelId'],
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.mediaService.uploadPhoto(file, dto, user.id);
  }

  @Get('photos/parcel/:parcelId')
  @ApiOperation({ summary: 'Photos d\'une parcelle (optionnel: filtrer par année)' })
  getByParcel(
    @Param('parcelId') parcelId: string,
    @Query('year') year?: string,
    @Query('limit') limit?: string,
  ) {
    return this.mediaService.getPhotosByParcel(parcelId, {
      year: year ? +year : undefined,
      limit: limit ? +limit : undefined,
    });
  }

  @Get('photos/parcel/:parcelId/comparison')
  @ApiOperation({ summary: 'Comparaison avant/après par point photo (suivi pluriannuel)' })
  getBeforeAfter(
    @Param('parcelId') parcelId: string,
    @Query('photoPointId') photoPointId?: string,
  ) {
    return this.mediaService.getBeforeAfter(parcelId, photoPointId);
  }

  @Get('photos/parcel/:parcelId/stats')
  @ApiOperation({ summary: 'Statistiques photos d\'une parcelle' })
  getStats(@Param('parcelId') parcelId: string) {
    return this.mediaService.getPhotoStats(parcelId);
  }

  @Get('photos/:id/signed-url')
  @ApiOperation({ summary: 'Obtenir une URL signée temporaire pour une photo privée' })
  getSignedUrl(@Param('id') id: string, @Query('expires') expires?: string) {
    return this.mediaService.getSignedUrl(id, expires ? +expires : 3600);
  }

  @Delete('photos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une photo (soft delete + suppression Supabase)' })
  deletePhoto(@Param('id') id: string, @CurrentUser() user: any) {
    return this.mediaService.deletePhoto(id, user.id);
  }
}
