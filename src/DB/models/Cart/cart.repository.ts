import { InjectModel } from "@nestjs/mongoose";
import { DBService } from "../db.service";
import { Cart, TCart } from "./cart.schema";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
@Injectable()
export class CartRepository extends DBService<TCart> {
    constructor(@InjectModel(Cart.name) cartModel : Model<TCart>){
        super(cartModel)
    }
}