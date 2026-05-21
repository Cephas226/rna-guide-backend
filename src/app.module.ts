import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ParcelsModule } from './modules/parcels/parcels.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ExploitationModule } from './modules/exploitation/exploitation.module';
import { MediaModule } from './modules/media/media.module';
import { SyncModule } from './modules/sync/sync.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { FormationsModule } from './modules/formations/formations.module';
import { SpeciesModule } from './modules/species/species.module';
import { HealthModule } from './modules/health/health.module';
import { RnaOperationsModule } from './modules/rna-operations/rna-operations.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig], envFilePath: ['.env.local', '.env'] }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60000, limit: 200 },
      { name: 'long', ttl: 3600000, limit: 2000 },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ParcelsModule,
    InventoryModule,
    ExploitationModule,
    MediaModule,
    SyncModule,
    AnalyticsModule,
    FormationsModule,
    SpeciesModule,
    HealthModule,
    RnaOperationsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
