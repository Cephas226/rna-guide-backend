"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelsService = exports.ParcelsController = exports.ParcelsModuleConfig = void 0;
const parcels_controller_1 = require("./parcels.controller");
const parcels_service_1 = require("./parcels.service");
const ParcelsModule_config = {
    controllers: [parcels_controller_1.ParcelsController],
    providers: [parcels_service_1.ParcelsService],
    exports: [parcels_service_1.ParcelsService],
};
exports.ParcelsModuleConfig = ParcelsModule_config;
var parcels_controller_2 = require("./parcels.controller");
Object.defineProperty(exports, "ParcelsController", { enumerable: true, get: function () { return parcels_controller_2.ParcelsController; } });
var parcels_service_2 = require("./parcels.service");
Object.defineProperty(exports, "ParcelsService", { enumerable: true, get: function () { return parcels_service_2.ParcelsService; } });
//# sourceMappingURL=_index.js.map