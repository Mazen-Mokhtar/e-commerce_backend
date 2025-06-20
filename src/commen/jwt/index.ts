import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { RoleTypes } from "src/DB/models/User/user.schema";
export enum ITokenTypes {
    access = "access",
    refresh = "refresh"
}
export interface IUserPayload extends JwtPayload {
    userId: string
}
interface IGenarateToken {
    payload: IUserPayload,
    type: ITokenTypes,
    role: RoleTypes,
    expiresIn?: string
}
@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) { }
    sign({ payload, type = ITokenTypes.access, role, expiresIn }: IGenarateToken) {
        const { accessToken, refreshToken } = this.getSignature(role)
        return this.jwtService.sign(payload, {
            secret: type === ITokenTypes.access ? accessToken : refreshToken,
            expiresIn: type === ITokenTypes.access ? expiresIn : process.env.EXPIRESIN_ADMIN
        })
    }
    private getSignature(role: RoleTypes): { accessToken: string, refreshToken: string } {
        let accessToken: string;
        let refreshToken: string;
        switch (role) {
            case RoleTypes.ADMIN:
                accessToken = process.env.SIGNATURE_ADMIN as string
                refreshToken = process.env.SIGNATURE_REFRESH as string
                break;

            default:
                accessToken = process.env.SIGNATURE_USER as string
                refreshToken = process.env.SIGNATURE_REFRESH as string
                break;
        }
        return { accessToken, refreshToken }
    }
    verify(token: string, role: RoleTypes, type: ITokenTypes) {
        try {
            
            let tokenType: ITokenTypes = type
            let payload: IUserPayload;
            const { accessToken, refreshToken } = this.getSignature(role)
            if (tokenType == ITokenTypes.access) {
                payload = this.jwtService.verify(token, { secret: accessToken })
            } else if (tokenType == ITokenTypes.refresh) {
                payload = this.jwtService.verify(token, { secret: refreshToken })
            } else {
                throw new Error("Invalid token type");
            }
            return payload
        } catch (error) {
            throw new UnauthorizedException(error.message)
        }

    }
}