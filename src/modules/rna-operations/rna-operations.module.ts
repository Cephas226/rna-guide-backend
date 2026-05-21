import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RnaOperationsController } from './rna-operations.controller';
import { RnaOperationsService } from './rna-operations.service';

@Module({
  imports: [PrismaModule],
  controllers: [RnaOperationsController],
  providers: [RnaOperationsService],
  exports: [RnaOperationsService],
})
export class RnaOperationsModule {}
