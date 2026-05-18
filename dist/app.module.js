"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const parcels_module_1 = require("./modules/parcels/parcels.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const exploitation_module_1 = require("./modules/exploitation/exploitation.module");
const media_module_1 = require("./modules/media/media.module");
const sync_module_1 = require("./modules/sync/sync.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const formations_module_1 = require("./modules/formations/formations.module");
const species_module_1 = require("./modules/species/species.module");
const health_module_1 = require("./modules/health/health.module");
const app_config_1 = require("./config/app.config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, load: [app_config_1.default], envFilePath: ['.env.local', '.env'] }),
            throttler_1.ThrottlerModule.forRoot([
                { name: 'short', ttl: 1000, limit: 10 },
                { name: 'medium', ttl: 60000, limit: 200 },
                { name: 'long', ttl: 3600000, limit: 2000 },
            ]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            parcels_module_1.ParcelsModule,
            inventory_module_1.InventoryModule,
            exploitation_module_1.ExploitationModule,
            media_module_1.MediaModule,
            sync_module_1.SyncModule,
            analytics_module_1.AnalyticsModule,
            formations_module_1.FormationsModule,
            species_module_1.SpeciesModule,
            health_module_1.HealthModule,
        ],
        providers: [{ provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard }],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map