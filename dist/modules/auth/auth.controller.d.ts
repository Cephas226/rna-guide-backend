import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<import("./auth.service").AuthTokens>;
    login(dto: LoginDto, deviceId?: string, appVersion?: string): Promise<import("./auth.service").AuthTokens & {
        user: any;
    }>;
    refresh(dto: RefreshTokenDto): Promise<import("./auth.service").AuthTokens>;
    logout(dto: RefreshTokenDto): Promise<void>;
    logoutAll(user: any): Promise<void>;
    getMe(user: any): Promise<any>;
}
