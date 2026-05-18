import { PrismaService } from '../../prisma/prisma.service';
export declare class CreateSpeciesDto {
    scientificName: string;
    localNameFr?: string;
    localNameMoore?: string;
    localNameDioula?: string;
    localNameFulfule?: string;
    category: string;
    isNative?: boolean;
    ecologicalRole?: string;
    usageDescription?: string;
    imageUrl?: string;
}
export declare class SpeciesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: {
        search?: string;
        category?: string;
        isNative?: boolean;
    }): Promise<({
        _count: {
            inventorySpecies: number;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        inventorySpecies: ({
            inventory: {
                parcel: {
                    name: string;
                    region: string;
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
        _count: {
            inventorySpecies: number;
        };
    } & {
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
    }>;
    create(dto: CreateSpeciesDto): Promise<{
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
    }>;
    update(id: string, dto: Partial<CreateSpeciesDto>): Promise<{
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
    }>;
    remove(id: string): Promise<void>;
}
