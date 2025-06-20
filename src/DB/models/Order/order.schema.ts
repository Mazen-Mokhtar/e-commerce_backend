import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "src/commen/Decorator/user.decorator";
import { Product } from "../Product/product.schema";
export enum OrderStatus {
    pending = "pending",
    placed = "placed",
    onWay = "on_way",
    delivered = "delivered",
    canceled = "canceled"
}
export enum IPaymentMethod {
    card = "card",
    cash = "cash"
}
export interface IProducts {
    _id?: Types.ObjectId;
    name: string;
    quantity: number;
    unitPrice: number;
    finalPrice: number;
    productId : Types.ObjectId;
}
@Schema()
export class Order {
    @Prop({ type: String, required: true })
    address: string;
    @Prop({ type: Number,default : function(){
        return Math.floor(Math.random()* (999999 -100000 + 1)+100000)
    } })
    orderId: string;
    @Prop({ type: String, required: true })
    phone: string;
    @Prop({ type: String, required: false })
    note?: string;
    @Prop({ type: Number, required: false })
    refundAmount?: number;
    @Prop({ type: Date, required: false })
    refundDate?: Date;
    @Prop({ type: String, required: false })
    intent?: string;
    @Prop({ type: Types.ObjectId, required: true, ref: User.name })
    createdBy: Types.ObjectId;
    @Prop({ type: Types.ObjectId, required: false, ref: User.name })
    updatedBy?: Types.ObjectId;
    @Prop({ type: Date, required: false })
    paidAt: Date;
    @Prop({ type: String, required: false })
    rejectedReason?: string;
    @Prop(raw([{
        name: {type :String, required : true },
        productId : {type :Types.ObjectId, required : true , ref : Product.name },
        quantity: {type :Number, required : true },
        unitPrice: {type :Number, required : true },
        finalPrice: {type :Number, required : true }
    }]))
    products: IProducts[];
    @Prop({ type: String, enum: OrderStatus, default: OrderStatus.pending })
    status: OrderStatus;
    @Prop({ type: String, enum: IPaymentMethod, default: IPaymentMethod.cash })
    paymentMethod: IPaymentMethod
    @Prop({ type: Number, required: true })
    sub_Total: number;
    @Prop({ type: Number, required: false })
    discountAmount: number;
    @Prop({ type: Number, required: true })
    finalPrice: number;
    @Prop({ type: Types.ObjectId, ref: 'Coupon', required: false })
    appliedCoupon?: Types.ObjectId;
    @Prop({ type: String, required: false })
    couponCode?: string;
}
export const orderSchema = SchemaFactory.createForClass(Order)
export type TOrder = HydratedDocument<Order>