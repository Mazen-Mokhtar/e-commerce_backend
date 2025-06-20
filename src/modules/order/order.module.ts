import { Module } from "@nestjs/common";
import { orderController } from "./order.controller";
import { SharedModule } from "src/commen/sharedModules";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { CartService } from "../cart/cart.service";
import { CartRepository } from "src/DB/models/Cart/cart.repository";
import { orderRepository } from "src/DB/models/Order/order.repository";
import { productModel } from "src/DB/models/Product/product.model";
import { cartModel } from "src/DB/models/Cart/cart.model";
import { orderModel } from "src/DB/models/Order/order.model";
import { orderService } from "./order.service";
import { StripeService } from "src/commen/service/stripe.service";
import { CouponModule } from "../coupon/coupon.module";

@Module({
    imports : [SharedModule,productModel,cartModel,orderModel,CouponModule],
    controllers : [orderController],
    providers : [ProductRepository,CartService,CartRepository,orderRepository,orderService,StripeService],
})
export class OrderModule {}