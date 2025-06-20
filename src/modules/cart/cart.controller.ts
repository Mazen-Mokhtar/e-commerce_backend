import { Body, Controller, Delete, Get, Patch, Post, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { CartService } from "./cart.service";
import { RoleTypes, TUser } from "src/DB/models/User/user.schema";
import { User } from "src/commen/Decorator/user.decorator";
import { addToCartDTO, removeItemToCartDTO } from "./dto";
import { AuthGuard } from "src/commen/Guards/auth.guard";
import { RolesGuard } from "src/commen/Guards/role.guard";
import { Roles } from "src/commen/Decorator/roles.decorator";
@UsePipes(new ValidationPipe({ whitelist: false }))
@Controller("cart")
export class CartController {
    constructor(private readonly cartService: CartService) { }
    @Post()
    @Roles([RoleTypes.USER])
    @UseGuards(AuthGuard, RolesGuard)
    async addToCart(@User() user: TUser, @Body() body: addToCartDTO) {
        return await this.cartService.addToCart(user, body)
    }
    @Patch()
    @Roles([RoleTypes.USER])
    @UseGuards(AuthGuard, RolesGuard)
    async removeItemToCart(@User() user: TUser, @Body() body: removeItemToCartDTO) {
        return await this.cartService.removeItemToCart(user, body)
    }
    @Delete()
    @Roles([RoleTypes.USER])
    @UseGuards(AuthGuard, RolesGuard)
    async clearCart(@User() user: TUser) {
        return await this.cartService.clearCart(user)
    }
    @Get()
    @Roles([RoleTypes.USER , RoleTypes.ADMIN])
    @UseGuards(AuthGuard, RolesGuard)
    async getCart(@User() user: TUser) {
        return await this.cartService.getCart(user)
    }
}