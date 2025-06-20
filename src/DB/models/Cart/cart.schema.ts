import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Product } from "../Product/product.schema";
import { User } from "src/commen/Decorator/user.decorator";
export interface IFiledProduct {
    productId : Types.ObjectId,
    quantity : number
}
@Schema({timestamps : true})
export class Cart {
    @Prop(raw([{productId : {type : Types.ObjectId , ref : Product.name} , quantity : Number}]))
    products : IFiledProduct[] ;
    @Prop({type : Types.ObjectId , ref : User.name})
    createdBy : Types.ObjectId
}
export const cartSchema = SchemaFactory.createForClass(Cart)
export type TCart = HydratedDocument<Cart>