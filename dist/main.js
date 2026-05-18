"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const compression = require("compression");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { logger: ['error', 'warn', 'log'] });
    app.use((0, helmet_1.default)({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: false,
    }));
    app.use(compression());
    app.enableCors({
        origin: process.env.FRONTEND_URL?.split(',') ?? ['http://localhost:4200', 'http://localhost:3000'],
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID', 'X-App-Version'],
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_interceptor_1.TransformInterceptor());
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
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
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
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
//# sourceMappingURL=main.js.map