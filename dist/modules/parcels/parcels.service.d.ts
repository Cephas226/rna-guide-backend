import { PrismaService } from '../../prisma/prisma.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { QueryParcelDto } from './dto/query-parcel.dto';
export declare class ParcelsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreateParcelDto, userId: string): Promise<any>;
    findAll(query: QueryParcelDto, user: any): Promise<any>;
    findOne(id: string, user: any): Promise<any>;
    update(id: string, dto: UpdateParcelDto, user: any): Promise<any>;
    remove(id: string, user: any): Promise<void>;
    getStatsByRegion(): Promise<any>;
    getGeoJson(query: QueryParcelDto, user: any): Promise<any>;
}
