import { Module } from "@nestjs/common";
import { UserRepository } from "src/DB/models/User/user.repository";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserModel } from "src/DB/models/User/user.model";
import { EmailEvents } from "src/commen/event/send-email";
import { TokenService } from "src/commen/jwt";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [UserModel],
    controllers: [AuthController],
    providers: [AuthService, UserRepository, EmailEvents, JwtService, TokenService]
})
export class AuthModule {}
