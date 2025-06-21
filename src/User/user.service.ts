import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { Request } from "express";
import { UserRepository } from "src/DB/models/User/user.repository";
import { UpdateProfileDto, ChangePasswordDto, UpdateUserRoleDto, GetUsersQueryDto } from "./dto";
import { compareHash } from "src/commen/security/compare";
import { generateHash } from "src/commen/security/hash";
import { TUser } from "src/DB/models/User/user.schema";

@Injectable()
export class userService {
    constructor(private readonly userRepository: UserRepository) { }

    getProfile(request: Request) {
        // Return the user data without the password
        const user = request["user"];
        if (user) {
            const { password, code, ...userWithoutSensitiveData } = user.toObject ? user.toObject() : user;
            return userWithoutSensitiveData;
        }
        return { sucess: true, data: user };
    }

    async updateProfile(request: Request, updateProfileDto: UpdateProfileDto) {
        const user = request["user"] as TUser;
        
        // Check if email is being updated and if it's already taken
        if (updateProfileDto.email && updateProfileDto.email !== user.email) {
            const existingUser = await this.userRepository.findByEmail({ email: updateProfileDto.email });
            if (existingUser) {
                throw new BadRequestException("Email already exists");
            }
        }

        // Update user profile
        const updatedUser = await this.userRepository.findByIdAndUpdate(
            user._id,
            updateProfileDto,
            { new: true }
        );

        if (!updatedUser) {
            throw new NotFoundException("User not found");
        }

        const { password, code, ...userWithoutSensitiveData } = updatedUser.toObject();
        return {
            success: true,
            message: "Profile updated successfully",
            data: userWithoutSensitiveData
        };
    }

    // async changePassword(request: Request, changePasswordDto: ChangePasswordDto) {
    //     const user = request["user"] as TUser;

    //     // Verify current password
    //     const isCurrentPasswordValid = await compareHash(changePasswordDto.currentPassword, user.password);
    //     if (!isCurrentPasswordValid) {
    //         throw new BadRequestException("Current password is incorrect");
    //     }

    //     // Hash new password
    //     const hashedNewPassword = generateHash(changePasswordDto.newPassword);

    //     // Update password
    //     await this.userRepository.findByIdAndUpdate(
    //         user._id,
    //         { password: hashedNewPassword }
    //     );

    //     return {
    //         success: true,
    //         message: "Password changed successfully"
    //     };
    // }

    async getAllUsers(query: GetUsersQueryDto) {
        const page = parseInt(query.page || '1') || 1;
        const limit = parseInt(query.limit || '10') || 10;
        const skip = (page - 1) * limit;

        // Build filter
        const filter: any = {};
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { email: { $regex: query.search, $options: 'i' } }
            ];
        }
        if (query.role) {
            filter.role = query.role;
        }

        // Get users with pagination
        const users = await this.userRepository.find(filter, '-password -code', { skip, limit });
        const total = await this.userRepository.countDocuments(filter);

        return {
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getUserById(userId: string) {
        const user = await this.userRepository.findById(userId, '-password -code');
        
        if (!user) {
            throw new NotFoundException("User not found");
        }

        return {
            success: true,
            data: user
        };
    }

    async updateUserRole(userId: string, updateUserRoleDto: UpdateUserRoleDto) {
        const user = await this.userRepository.findById(userId);
        
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const updatedUser = await this.userRepository.findByIdAndUpdate(
            userId,
            { role: updateUserRoleDto.role },
            { new: true }
        );

        if (!updatedUser) {
            throw new NotFoundException("Failed to update user");
        }

        const { password, code, ...userWithoutSensitiveData } = updatedUser.toObject();
        
        return {
            success: true,
            message: "User role updated successfully",
            data: userWithoutSensitiveData
        };
    }

    async deleteUser(userId: string) {
        const user = await this.userRepository.findById(userId);
        
        if (!user) {
            throw new NotFoundException("User not found");
        }

        await this.userRepository.findByIdAndDelete(userId, {});

        return {
            success: true,
            message: "User deleted successfully"
        };
    }
}