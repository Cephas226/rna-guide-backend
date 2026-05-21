import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto, QueryInventoryDto } from './dto/inventory.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    create(dto: CreateInventoryDto, user: any): Promise<{
        parcel: {
            id: string;
            region: string;
            village: string;
            name: string;
        };
        agent: {
            id: string;
            firstName: string;
            lastName: string;
        };
        species: ({
            species: {
                id: string;
                createdAt: Date;
                scientificName: string;
                localNameFr: string | null;
                localNameMoore: string | null;
                localNameDioula: string | null;
                localNameFulfule: string | null;
                commonName: string | null;
                category: string;
                isNative: boolean;
                ecologicalRole: string | null;
                usageDescription: string | null;
                imageUrl: string | null;
            };
        } & {
            id: string;
            totalPieds: number;
            selectedPieds: number;
            piedsH1: number;
            piedsH2: number;
            piedsH3: number;
            notes: string | null;
            speciesId: string;
            inventoryId: string;
        })[];
    } & {
        id: string;
        localId: string | null;
        year: number;
        season: import(".prisma/client").$Enums.Season;
        totalPieds: number;
        selectedPieds: number;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        version: number;
        observations: string | null;
        validatedAt: Date | null;
        validatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        parcelId: string;
        agentId: string;
    }>;
    findAll(query: QueryInventoryDto, user: any): Promise<{
        data: ({
            parcel: {
                id: string;
                region: string;
                village: string;
                name: string;
                superficie: number;
            };
            agent: {
                id: string;
                firstName: string;
                lastName: string;
            };
            _count: {
                species: number;
            };
        } & {
            id: string;
            localId: string | null;
            year: number;
            season: import(".prisma/client").$Enums.Season;
            totalPieds: number;
            selectedPieds: number;
            syncStatus: import(".prisma/client").$Enums.SyncStatus;
            version: number;
            observations: string | null;
            validatedAt: Date | null;
            validatedBy: string | null;
            createdAt: Date;
            updatedAt: Date;
            parcelId: string;
            agentId: string;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNext: boolean;
        };
    }>;
    findByParcel(parcelId: string, year?: string, user?: any): Promise<({
        agent: {
            id: string;
            firstName: string;
            lastName: string;
        };
        species: ({
            species: {
                id: string;
                scientificName: string;
                localNameFr: string | null;
                localNameMoore: string | null;
                category: string;
            };
        } & {
            id: string;
            totalPieds: number;
            selectedPieds: number;
            piedsH1: number;
            piedsH2: number;
            piedsH3: number;
            notes: string | null;
            speciesId: string;
            inventoryId: string;
        })[];
    } & {
        id: string;
        localId: string | null;
        year: number;
        season: import(".prisma/client").$Enums.Season;
        totalPieds: number;
        selectedPieds: number;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        version: number;
        observations: string | null;
        validatedAt: Date | null;
        validatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        parcelId: string;
        agentId: string;
    })[]>;
    getStats(parcelId: string): Promise<{
        totalInventaires: number;
        evolution: {
            year: number;
            season: import(".prisma/client").$Enums.Season;
            totalPieds: number;
            selectedPieds: number;
            nbEspeces: number;
            validated: boolean;
        }[];
        speciesRichesse: any[];
        tendance: number;
    }>;
    findOne(id: string, user: any): Promise<{
        parcel: {
            id: string;
            region: string;
            village: string;
            name: string;
            superficie: number;
            ownerId: string;
        };
        agent: {
            id: string;
            firstName: string;
            lastName: string;
        };
        species: ({
            species: {
                id: string;
                createdAt: Date;
                scientificName: string;
                localNameFr: string | null;
                localNameMoore: string | null;
                localNameDioula: string | null;
                localNameFulfule: string | null;
                commonName: string | null;
                category: string;
                isNative: boolean;
                ecologicalRole: string | null;
                usageDescription: string | null;
                imageUrl: string | null;
            };
        } & {
            id: string;
            totalPieds: number;
            selectedPieds: number;
            piedsH1: number;
            piedsH2: number;
            piedsH3: number;
            notes: string | null;
            speciesId: string;
            inventoryId: string;
        })[];
    } & {
        id: string;
        localId: string | null;
        year: number;
        season: import(".prisma/client").$Enums.Season;
        totalPieds: number;
        selectedPieds: number;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        version: number;
        observations: string | null;
        validatedAt: Date | null;
        validatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        parcelId: string;
        agentId: string;
    }>;
    update(id: string, dto: UpdateInventoryDto, user: any): Promise<{
        agent: {
            id: string;
            firstName: string;
            lastName: string;
        };
        species: ({
            species: {
                id: string;
                createdAt: Date;
                scientificName: string;
                localNameFr: string | null;
                localNameMoore: string | null;
                localNameDioula: string | null;
                localNameFulfule: string | null;
                commonName: string | null;
                category: string;
                isNative: boolean;
                ecologicalRole: string | null;
                usageDescription: string | null;
                imageUrl: string | null;
            };
        } & {
            id: string;
            totalPieds: number;
            selectedPieds: number;
            piedsH1: number;
            piedsH2: number;
            piedsH3: number;
            notes: string | null;
            speciesId: string;
            inventoryId: string;
        })[];
    } & {
        id: string;
        localId: string | null;
        year: number;
        season: import(".prisma/client").$Enums.Season;
        totalPieds: number;
        selectedPieds: number;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        version: number;
        observations: string | null;
        validatedAt: Date | null;
        validatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        parcelId: string;
        agentId: string;
    }>;
    validate(id: string, user: any): Promise<{
        parcel: {
            name: string;
        };
        agent: {
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        localId: string | null;
        year: number;
        season: import(".prisma/client").$Enums.Season;
        totalPieds: number;
        selectedPieds: number;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        version: number;
        observations: string | null;
        validatedAt: Date | null;
        validatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        parcelId: string;
        agentId: string;
    }>;
    invalidate(id: string): Promise<{
        id: string;
        localId: string | null;
        year: number;
        season: import(".prisma/client").$Enums.Season;
        totalPieds: number;
        selectedPieds: number;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        version: number;
        observations: string | null;
        validatedAt: Date | null;
        validatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        parcelId: string;
        agentId: string;
    }>;
    remove(id: string, user: any): Promise<void>;
}
