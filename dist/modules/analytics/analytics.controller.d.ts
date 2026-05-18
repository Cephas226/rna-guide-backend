import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getOverview(): Promise<any>;
    getEvolution(years?: number): Promise<any>;
    getByRegion(): Promise<any>;
    getSpecies(limit?: number): Promise<any>;
    getQuality(): Promise<any>;
    getExploitation(): Promise<any>;
    getAgents(limit?: number): Promise<any>;
}
