import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { UserRepository } from "src/DB/models/User/user.repository";

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
}