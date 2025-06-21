import { Controller, Get, Post, Put, Delete, Req, UseGuards, Body, Param, Query } from "@nestjs/common";
import { userService } from "./user.service";
import { AuthGuard } from "src/commen/Guards/auth.guard";
import { Request } from "express";
import { RolesGuard } from "src/commen/Guards/role.guard";
import { Roles } from "src/commen/Decorator/roles.decorator";
import { UpdateProfileDto, ChangePasswordDto, UpdateUserRoleDto, GetUsersQueryDto } from "./dto";
import { RoleTypes } from "src/DB/models/User/user.schema";

@Controller("user")
export class userController {
    constructor(private readonly userService: userService) { }
    
    @Get("profile")
    @UseGuards(AuthGuard)
    getProfile(@Req() req: Request) {
        return this.userService.getProfile(req)
    }

    @Put("profile")
    @UseGuards(AuthGuard)
    updateProfile(@Req() req: Request, @Body() updateProfileDto: UpdateProfileDto) {
        return this.userService.updateProfile(req, updateProfileDto);
    }

    // @Put("change-password")
    // @UseGuards(AuthGuard)
    // changePassword(@Req() req: Request, @Body() changePasswordDto: ChangePasswordDto) {
    //     return this.userService.changePassword(req, changePasswordDto);
    // }

    // Admin only endpoints
    @Get("all")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles([RoleTypes.ADMIN])
    getAllUsers(@Query() query: GetUsersQueryDto) {
        return this.userService.getAllUsers(query);
    }

    @Get(":id")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles([RoleTypes.ADMIN])
    getUserById(@Param("id") userId: string) {
        return this.userService.getUserById(userId);
    }

    @Put(":id/role")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles([RoleTypes.ADMIN])
    updateUserRole(@Param("id") userId: string, @Body() updateUserRoleDto: UpdateUserRoleDto) {
        return this.userService.updateUserRole(userId, updateUserRoleDto);
    }

    @Delete(":id")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles([RoleTypes.ADMIN])
    deleteUser(@Param("id") userId: string) {
        return this.userService.deleteUser(userId);
    }
}