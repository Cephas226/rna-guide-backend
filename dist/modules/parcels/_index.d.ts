import { ParcelsController } from './parcels.controller';
import { ParcelsService } from './parcels.service';
declare const ParcelsModule_config: {
    controllers: (typeof ParcelsController)[];
    providers: (typeof ParcelsService)[];
    exports: (typeof ParcelsService)[];
};
export { ParcelsModule_config as ParcelsModuleConfig };
export { ParcelsController } from './parcels.controller';
export { ParcelsService } from './parcels.service';
