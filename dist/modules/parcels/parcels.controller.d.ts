import { ParcelsService } from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { QueryParcelDto } from './dto/query-parcel.dto';
export declare class ParcelsController {
    private readonly parcelsService;
    constructor(parcelsService: ParcelsService);
    create(dto: CreateParcelDto, user: any): Promise<any>;
    findAll(query: QueryParcelDto, user: any): Promise<any>;
    getGeoJson(query: QueryParcelDto, user: any): Promise<any>;
    getStatsByRegion(): Promise<any>;
    findOne(id: string, user: any): Promise<any>;
    update(id: string, dto: UpdateParcelDto, user: any): Promise<any>;
    remove(id: string, user: any): Promise<void>;
}
