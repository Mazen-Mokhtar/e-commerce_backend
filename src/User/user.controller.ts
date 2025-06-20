import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { userService } from "./user.service";
import { AuthGuard } from "src/commen/Guards/auth.guard";
import { Request } from "express";
import { RolesGuard } from "src/commen/Guards/role.guard";
import { Roles } from "src/commen/Decorator/roles.decorator";

@Controller("user")
export class userController {
    constructor(private readonly userService: userService) { }
    
    @Get("profile")
    @UseGuards(AuthGuard)
    getProfile(@Req() req: Request) {
        return this.userService.getProfile(req)
    }
}