// ============================================================
// RNA Guide - Configuration centralisée
// ============================================================

import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // Serveur
  port: parseInt(process.env.PORT ?? '3000', 10),
  env: process.env.NODE_ENV ?? 'development',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:4200',

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'rna-guide-access-secret-change-in-prod',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'rna-guide-refresh-secret-change-in-prod',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES ?? '30d',
  },

  // Base de données
  database: {
    url: process.env.DATABASE_URL,
  },

  // Supabase Storage
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY ?? '',
    bucket: process.env.SUPABASE_BUCKET ?? 'rna-photos',
  },

  // Upload
  upload: {
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? '10', 10),
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
}));
