"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthModule = exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../prisma/prisma.service");
let HealthController = class HealthController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async check() {
        const start = Date.now();
        let dbStatus = 'ok';
        let dbLatencyMs = 0;
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            dbLatencyMs = Date.now() - start;
        }
        catch (e) {
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
};
exports.HealthController = HealthController;
__decorate([
    (0, common_2.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check — vérifie API + base de données' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
exports.HealthController = HealthController = __decorate([
    (0, common_2.Controller)('health'),
    (0, swagger_1.ApiTags)('health'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HealthController);
let HealthModule = class HealthModule {
};
exports.HealthModule = HealthModule;
exports.HealthModule = HealthModule = __decorate([
    (0, common_1.Module)({
        controllers: [HealthController],
        providers: [prisma_service_1.PrismaService],
    })
], HealthModule);
//# sourceMappingURL=health.module.js.map