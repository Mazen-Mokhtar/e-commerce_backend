import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ProductService } from "./product.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { cloudMulter } from "src/commen/multer/cloud.multer";
import { AuthGuard } from "src/commen/Guards/auth.guard";
import { RolesGuard } from "src/commen/Guards/role.guard";
import { Roles } from "src/commen/Decorator/roles.decorator";
import { RoleTypes, TUser } from "src/DB/models/User/user.schema";
import { CreatProductDTO, ParamProductIdDTO, QueryProductDTO, updateProductDTO, LikeProductDTO } from "./dto";
import { log } from "console";
import { User } from "src/commen/Decorator/user.decorator";
import { QueryValidationPipe } from "src/commen/pipes";

@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller("product")
export class productController {
    constructor(private readonly productService: ProductService) { }
    @UseInterceptors(FileFieldsInterceptor([
        { name: "image", maxCount: 1 },
        { name: "gallery", maxCount: 3 }], cloudMulter()))
    @UseGuards(AuthGuard, RolesGuard)
    @Roles([RoleTypes.ADMIN])
    @Post()
    async addProduct(@User() user: TUser, @Body() body: CreatProductDTO, @UploadedFiles() files: {
        image: Express.Multer.File[],
        gallery?: Express.Multer.File[]
    }) {
        return await this.productService.addProduct(user, body, files)
    }
    @UseInterceptors(FileFieldsInterceptor([
        { name: "image", maxCount: 1 },
        { name: "gallery", maxCount: 3 }], cloudMulter()))
    @Patch("update/:ProductId")
    @Roles([RoleTypes.ADMIN])
    @UseGuards(AuthGuard, RolesGuard)
    async updateProduct(@Body() body: updateProductDTO, @Param() params: ParamProductIdDTO, @UploadedFiles() files: {
        image?: Express.Multer.File[],
        gallery?: Express.Multer.File[]
    }) {
        return await this.productService.updateProduct(body, params, files)
    }
    @Get()
    async list(@Query(new QueryValidationPipe()) query: QueryProductDTO) {
        return this.productService.list(query)
    }

    @Post("like/:ProductId")
    @UseGuards(AuthGuard)
    async toggleLike(@User() user: TUser, @Param() params: LikeProductDTO) {
        return await this.productService.toggleLike(user, params);
    }

    @Get("liked")
    @UseGuards(AuthGuard)
    async getLikedProducts(@User() user: TUser) {
        return await this.productService.getLikedProducts(user);
    }

    @Delete(":ProductId")
    @Roles([RoleTypes.ADMIN])
    @UseGuards(AuthGuard, RolesGuard)
    async deleteProduct(@Param() params: ParamProductIdDTO) {
        return await this.productService.deleteProduct(params);
    }
}