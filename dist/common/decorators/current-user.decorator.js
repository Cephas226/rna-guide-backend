"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = exports.Public = exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
});
const Public = () => (0, common_1.SetMetadata)(jwt_auth_guard_1.IS_PUBLIC_KEY, true);
exports.Public = Public;
const Roles = (...roles) => (0, common_1.SetMetadata)(jwt_auth_guard_1.ROLES_KEY, roles);
exports.Roles = Roles;
//# sourceMappingURL=current-user.decorator.js.map