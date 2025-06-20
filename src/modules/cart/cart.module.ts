import { Module } from "@nestjs/common";
import { CartRepository } from "src/DB/models/Cart/cart.repository";
import { CartController } from "./cart.controller";
import { cartModel } from "src/DB/models/Cart/cart.model";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { productModel } from "src/DB/models/Product/product.model";
import { CartService } from "./cart.service";
import { SharedModule } from "src/commen/sharedModules";

@Module({
    imports : [cartModel , productModel, SharedModule],
    controllers : [CartController],
    providers : [CartRepository, ProductRepository,CartService]
})
export class CartModule {}