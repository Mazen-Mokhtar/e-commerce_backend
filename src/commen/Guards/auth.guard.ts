import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { ITokenTypes, IUserPayload, TokenService } from "../jwt";
import { RoleTypes, TUser } from "src/DB/models/User/user.schema";
import { UserRepository } from "src/DB/models/User/user.repository";
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly tokenService: TokenService, private readonly userRepository: UserRepository) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest() as Request

        let { authorization } = request.headers
        if (!authorization) {
            throw new UnauthorizedException('Missing Authorization header');
        }
        let payload: IUserPayload;
        let token: string[] = authorization.split(" ")

        if (authorization?.startsWith(RoleTypes.USER)) {
            payload = this.tokenService.verify(token[1], RoleTypes.USER, ITokenTypes.access)
        } else if (authorization?.startsWith(RoleTypes.ADMIN)) {
            payload = this.tokenService.verify(token[1], RoleTypes.ADMIN, ITokenTypes.access)
        } else {
            throw new UnauthorizedException("Invalid authorization")
        }
        const user = await this.userRepository.findById(payload.userId)
        request["user"] = user
        if (!user)
            throw new NotFoundException("User Not Found")
        return true
    }
}