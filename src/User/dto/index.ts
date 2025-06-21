import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { RoleTypes } from "src/DB/models/User/user.schema";

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;
}

export class ChangePasswordDto {
    @IsString()
    @MinLength(6)
    currentPassword: string;

    @IsString()
    @MinLength(6)
    newPassword: string;
}

export class UpdateUserRoleDto {
    @IsEnum(RoleTypes)
    role: RoleTypes;
}

export class GetUsersQueryDto {
    @IsOptional()
    @IsString()
    page?: string;

    @IsOptional()
    @IsString()
    limit?: string;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(RoleTypes)
    role?: RoleTypes;
}
