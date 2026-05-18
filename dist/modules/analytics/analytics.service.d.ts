import { PrismaService } from '../../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getOverview(): Promise<any>;
    getParcelEvolution(years?: number): Promise<any>;
    getParcelsByRegion(): Promise<any>;
    getSpeciesDistribution(limit?: number): Promise<any>;
    getDataQuality(): Promise<any>;
    getExploitationStats(): Promise<any>;
    getAgentActivity(limit?: number): Promise<any>;
}
