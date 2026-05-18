// ============================================================
// RNA Guide - Point d'entrée NestJS
// ============================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });

  // ── Sécurité ──
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  }));
  app.use(compression());

  // ── CORS ──
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') ?? ['http://localhost:4200', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID', 'X-App-Version'],
    credentials: true,
  });

  // ── Prefix global ──
  app.setGlobalPrefix('api/v1');

  // ── Validation globale ──
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,          // strip propriétés non déclarées
    forbidNonWhitelisted: false,
    transform: true,          // auto-cast types
    transformOptions: { enableImplicitConversion: true },
  }));

  // ── Filtres & Interceptors globaux ──
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // ── Swagger Documentation ──
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('RNA Guide API')
      .setDescription('API complète pour la Régénération Naturelle Assistée - Burkina Faso')
      .setVersion('1.0.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
      .addTag('auth', 'Authentification & tokens')
      .addTag('users', 'Gestion des utilisateurs')
      .addTag('parcels', 'Parcelles RNA')
      .addTag('inventory', 'Inventaires RNA')
      .addTag('exploitation', 'Exploitation des produits')
      .addTag('media', 'Photos et médias')
      .addTag('sync', 'Synchronisation offline')
      .addTag('analytics', 'Statistiques & dashboard')
      .addTag('formations', 'Guides et formations RNA')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log(`📚 Swagger disponible : http://localhost:${process.env.PORT ?? 3000}/api/docs`);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 RNA Guide API démarrée sur : http://localhost:${port}`);
  logger.log(`🌱 Environnement : ${process.env.NODE_ENV ?? 'development'}`);
}

bootstrap();
