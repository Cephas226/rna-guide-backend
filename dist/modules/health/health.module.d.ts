import { PrismaService } from '../../prisma/prisma.service';
export declare class HealthController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    check(): Promise<{
        status: string;
        timestamp: string;
        version: string;
        environment: string;
        uptime: {
            seconds: number;
            human: string;
        };
        database: {
            status: string;
            latencyMs: number;
        };
        memory: {
            usedMb: number;
            totalMb: number;
        };
    }>;
}
export declare class HealthModule {
}
