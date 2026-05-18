import { PrismaService } from '../../prisma/prisma.service';
import { CreateInventoryDto, UpdateInventoryDto, QueryInventoryDto } from './dto/inventory.dto';
export declare class InventoryService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreateInventoryDto, userId: string): Promise<{
        parcel: {
            name: string;
            region: string;
            village: string;
            id: string;
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
            notes: string | null;
            speciesId: string;
            totalPieds: number;
            selectedPieds: number;
            healthState: import(".prisma/client").$Enums.HealthState;
            heightCm: number | null;
            isNewSpecies: boolean;
            inventoryId: string;
        })[];
        agent: {
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        localId: string | null;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        version: number;
        year: number;
        totalPieds: number;
        selectedPieds: number;
        parcelId: string;
        season: import(".prisma/client").$Enums.Season;
        observations: string | null;
        agentId: string;
        validatedAt: Date | null;
        validatedBy: string | null;
    }>;
    findAll(query: QueryInventoryDto, user: any): Promise<{
        data: ({
            parcel: {
                name: string;
                region: string;
                village: string;
                id: string;
                superficie: number;
            };
            _count: {
                species: number;
            };
            agent: {
                firstName: string;
                lastName: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            localId: string | null;
            syncStatus: import(".prisma/client").$Enums.SyncStatus;
            version: number;
            year: number;
            totalPieds: number;
            selectedPieds: number;
            parcelId: string;
            season: import(".prisma/client").$Enums.Season;
            observations: string | null;
            agentId: string;
            validatedAt: Date | null;
            validatedBy: string | null;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNext: boolean;
        };
    }>;
    findByParcel(parcelId: string, year?: number, user?: any): Promise<({
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
            notes: string | null;
            speciesId: string;
            totalPieds: number;
            selectedPieds: number;
            healthState: import(".prisma/client").$Enums.HealthState;
            heightCm: number | null;
            isNewSpecies: boolean;
            inventoryId: string;
        })[];
        agent: {
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        localId: string | null;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        version: number;
        year: number;
        totalPieds: number;
        selectedPieds: number;
        parcelId: string;
        season: import(".prisma/client").$Enums.Season;
        observations: string | null;
        agentId: string;
        validatedAt: Date | null;
        validatedBy: string | null;
    })[]>;
    findOne(id: string, user: any): Promise<{
        parcel: {
            name: string;
            region: string;
            village: string;
            id: string;
            superficie: number;
            ownerId: string;
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
            notes: string | null;
            speciesId: string;
            totalPieds: number;
            selectedPieds: number;
            healthState: import(".prisma/client").$Enums.HealthState;
            heightCm: number | null;
            isNewSpecies: boolean;
            inventoryId: string;
        })[];
        agent: {
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        localId: string | null;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        version: number;
        year: number;
        totalPieds: number;
        selectedPieds: number;
        parcelId: string;
        season: import(".prisma/client").$Enums.Season;
        observations: string | null;
        agentId: string;
        validatedAt: Date | null;
        validatedBy: string | null;
    }>;
    update(id: string, dto: UpdateInventoryDto, user: any): Promise<{
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
            notes: string | null;
            speciesId: string;
            totalPieds: number;
            selectedPieds: number;
            healthState: import(".prisma/client").$Enums.HealthState;
            heightCm: number | null;
            isNewSpecies: boolean;
            inventoryId: string;
        })[];
        agent: {
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        localId: string | null;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        version: number;
        year: number;
        totalPieds: number;
        selectedPieds: number;
        parcelId: string;
        season: import(".prisma/client").$Enums.Season;
        observations: string | null;
        agentId: string;
        validatedAt: Date | null;
        validatedBy: string | null;
    }>;
    validate(id: string, validatorId: string): Promise<{
        parcel: {
            name: string;
        };
        agent: {
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        localId: string | null;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        version: number;
        year: number;
        totalPieds: number;
        selectedPieds: number;
        parcelId: string;
        season: import(".prisma/client").$Enums.Season;
        observations: string | null;
        agentId: string;
        validatedAt: Date | null;
        validatedBy: string | null;
    }>;
    invalidate(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        localId: string | null;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        version: number;
        year: number;
        totalPieds: number;
        selectedPieds: number;
        parcelId: string;
        season: import(".prisma/client").$Enums.Season;
        observations: string | null;
        agentId: string;
        validatedAt: Date | null;
        validatedBy: string | null;
    }>;
    remove(id: string, user: any): Promise<void>;
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
}
