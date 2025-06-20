import { Module } from "@nestjs/common";
import { userController } from "./user.controller";
import { userService } from "./user.service";
import { SharedModule } from "src/commen/sharedModules";

@Module({
    imports: [SharedModule],
    controllers: [userController],
    providers: [userService]
})
export class UserModule {}