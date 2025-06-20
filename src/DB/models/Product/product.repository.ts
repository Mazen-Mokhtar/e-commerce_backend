import { InjectModel } from "@nestjs/mongoose";
import { DBService } from "../db.service";
import { Product, TProduct } from "./product.schema";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
@Injectable()
export class ProductRepository extends DBService<TProduct>{
    constructor(@InjectModel(Product.name) private readonly productModel : Model<TProduct>){
        super(productModel)
    }
}