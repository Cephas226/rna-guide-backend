// ============================================================
// RNA Guide - Health Check Module
// ============================================================

import { Module } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('health')
@ApiTags('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check — vérifie API + base de données' })
  async check() {
    const start = Date.now();
    let dbStatus = 'ok';
    let dbLatencyMs = 0;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
    } catch (e) {
      dbStatus = 'error';
    }

    const uptime = process.uptime();

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '1.0.0',
      environment: process.env.NODE_ENV ?? 'development',
      uptime: {
        seconds: Math.floor(uptime),
        human: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      },
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      memory: {
        usedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        totalMb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };
  }
}

@Module({
  controllers: [HealthController],
  providers: [PrismaService],
})
export class HealthModule {}
