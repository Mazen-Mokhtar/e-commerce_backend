import { Inject, Injectable } from "@nestjs/common";
import { DBService } from "../db.service";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order, TOrder } from "./order.schema";
@Injectable()
export class orderRepository extends DBService<TOrder> {
    constructor(@InjectModel(Order.name) private readonly orderModel: Model<TOrder>){
        super(orderModel)
    }
}