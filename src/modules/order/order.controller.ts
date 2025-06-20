import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe, Query } from "@nestjs/common";
import { orderService } from "./order.service";
import { User } from "src/commen/Decorator/user.decorator";
import { TUser } from "src/DB/models/User/user.schema";
import { creatOrderDTO, orderIdDTO, UpdateOrderStatusDTO, AdminOrderQueryDTO } from "./dto";
import { Roles } from "src/commen/Decorator/roles.decorator";
import { AuthGuard } from "src/commen/Guards/auth.guard";
import { RolesGuard } from "src/commen/Guards/role.guard";
import { Request } from "express";
import { Types } from "mongoose";
import { RoleTypes } from "src/DB/models/User/user.schema";
@UsePipes(new ValidationPipe({ whitelist: false }))
@Controller("order")
export class orderController {
    constructor(private readonly orderService: orderService) { }
    @Get("admin/stats")
    @Roles([RoleTypes.ADMIN])
    @UseGuards(AuthGuard, RolesGuard)
    async getOrderStats() {
        return await this.orderService.getOrderStats();
    }
    @Get()
    @Roles(["user"])
    @UseGuards(AuthGuard, RolesGuard)
    async getOrders(@User() user: TUser) {
        return await this.orderService.getUserOrders(user._id);
    }
    @Get("admin/all")
    @Roles([RoleTypes.ADMIN, RoleTypes.DELIVERY])
    @UseGuards(AuthGuard, RolesGuard)
    async getAllOrders(@User() user: TUser, @Query() query: AdminOrderQueryDTO) {
        return await this.orderService.getAllOrders(query, user);
    }
    @Post("/")
    @Roles(["user"])
    @UseGuards(AuthGuard, RolesGuard)
    async creatOrder(@User() user: TUser, @Body() body: creatOrderDTO) {
        return await this.orderService.creatOrder(user, body)
    }
    @Post("/webhook")
    async webhook(@Req() req: Request) {
        return await this.orderService.webhook(req)
    }
    @Post("/:orderId")
    @Roles(["user"])
    @UseGuards(AuthGuard, RolesGuard)
    async cheakout(@User() user: TUser, @Param() param: orderIdDTO) {
        return await this.orderService.cheakout(user, param.orderId)
    }
    @Patch("/:orderId/cancel")
    @Roles(["user"])
    @UseGuards(AuthGuard, RolesGuard)
    async refund(@User() user: TUser, @Param() param: orderIdDTO) {
        return await this.orderService.cancelOrder(user, param.orderId)
    }
    
    @Get(':orderId')
    @Roles(["user"])
    @UseGuards(AuthGuard, RolesGuard)
    async getOrderDetails(@User() user, @Param() params: orderIdDTO) {
        const orderId = new Types.ObjectId(params.orderId);
        return this.orderService.getOrderDetails(user, orderId);
    }

    // Admin Dashboard Endpoints
    

    @Get("admin/:orderId")
    @Roles([RoleTypes.ADMIN, RoleTypes.DELIVERY])
    @UseGuards(AuthGuard, RolesGuard)
    async getOrderById(@User() user: TUser, @Param() params: orderIdDTO) {
        const orderId = new Types.ObjectId(params.orderId);
        return await this.orderService.getOrderById(orderId, user);
    }

    @Patch("admin/:orderId/status")
    @Roles([RoleTypes.ADMIN, RoleTypes.DELIVERY])
    @UseGuards(AuthGuard, RolesGuard)
    async updateOrderStatus(@User() admin: TUser, @Param() params: orderIdDTO, @Body() body: UpdateOrderStatusDTO) {
        const orderId = new Types.ObjectId(params.orderId);
        return await this.orderService.updateOrderStatus(admin, orderId, body);
    }

    
}