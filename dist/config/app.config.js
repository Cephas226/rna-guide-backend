"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    port: parseInt(process.env.PORT ?? '3000', 10),
    env: process.env.NODE_ENV ?? 'development',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:4200',
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET ?? 'rna-guide-access-secret-change-in-prod',
        refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'rna-guide-refresh-secret-change-in-prod',
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES ?? '30d',
    },
    database: {
        url: process.env.DATABASE_URL,
    },
    supabase: {
        url: process.env.SUPABASE_URL ?? '',
        serviceKey: process.env.SUPABASE_SERVICE_KEY ?? '',
        bucket: process.env.SUPABASE_BUCKET ?? 'rna-photos',
    },
    upload: {
        maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? '10', 10),
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
}));
//# sourceMappingURL=app.config.js.map