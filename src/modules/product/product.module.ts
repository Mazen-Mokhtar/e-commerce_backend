import { Module } from "@nestjs/common";
import { productController } from "./product.controller";
import { ProductService } from "./product.service";
import { productModel } from "src/DB/models/Product/product.model";
import { categoryRepository } from "src/DB/models/Category/category.repository";
import { cloudService } from "src/commen/multer/cloud.service";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { categoryModel } from "src/DB/models/Category/category.model";
import { SharedModule } from "src/commen/sharedModules";

@Module({
    imports : [productModel,categoryModel,SharedModule],
    controllers : [productController],
    providers : [ProductService,cloudService,categoryRepository,ProductRepository]
})
export class ProductModule {}