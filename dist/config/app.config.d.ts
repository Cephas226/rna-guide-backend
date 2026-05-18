declare const _default: (() => {
    port: number;
    env: string;
    frontendUrl: string;
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
    };
    database: {
        url: string | undefined;
    };
    supabase: {
        url: string;
        serviceKey: string;
        bucket: string;
    };
    upload: {
        maxFileSizeMb: number;
        allowedMimeTypes: string[];
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    env: string;
    frontendUrl: string;
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
    };
    database: {
        url: string | undefined;
    };
    supabase: {
        url: string;
        serviceKey: string;
        bucket: string;
    };
    upload: {
        maxFileSizeMb: number;
        allowedMimeTypes: string[];
    };
}>;
export default _default;
