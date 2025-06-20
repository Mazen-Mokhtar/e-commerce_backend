import { Module } from "@nestjs/common";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";
import { categoryRepository } from "src/DB/models/Category/category.repository";
import { cloudService } from "src/commen/multer/cloud.service";
import { categoryModel } from "src/DB/models/Category/category.model";
import { SharedModule } from "src/commen/sharedModules";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { productModel } from "src/DB/models/Product/product.model";

@Module({
    imports: [SharedModule, categoryModel, productModel],
    controllers: [CategoryController],
    providers: [CategoryService, categoryRepository, cloudService, ProductRepository]
})
export class categoryModule { }