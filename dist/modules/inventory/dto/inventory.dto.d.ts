import { Season } from '@prisma/client';
export declare class CreateInventorySpeciesDto {
    speciesId: string;
    piedsH1: number;
    piedsH2: number;
    piedsH3: number;
    selectedPieds: number;
    notes?: string;
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
