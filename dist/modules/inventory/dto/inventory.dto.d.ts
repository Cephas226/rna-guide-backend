import { Season, HealthState } from '@prisma/client';
export declare class CreateInventorySpeciesDto {
    speciesId: string;
    totalPieds: number;
    selectedPieds: number;
    healthState?: HealthState;
    heightCm?: number;
    notes?: string;
    isNewSpecies?: boolean;
}
export declare class CreateInventoryDto {
    localId?: string;
    parcelId: string;
    year: number;
    season: Season;
    observations?: string;
    species: CreateInventorySpeciesDto[];
}
export declare class UpdateInventoryDto {
    observations?: string;
    species?: CreateInventorySpeciesDto[];
}
export declare class QueryInventoryDto {
    parcelId?: string;
    agentId?: string;
    year?: number;
    season?: Season;
    validatedOnly?: boolean;
    page?: number;
    limit?: number;
}
