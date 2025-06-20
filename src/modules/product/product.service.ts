import { BadRequestException, Injectable, Query } from "@nestjs/common";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { categoryRepository } from "src/DB/models/Category/category.repository";
import { CreatProductDTO, ParamProductIdDTO, QueryProductDTO, updateProductDTO, LikeProductDTO } from "./dto";
import { cloudService, IAttachments } from "src/commen/multer/cloud.service";
import { TUser } from "src/DB/models/User/user.schema";
import { FilterQuery } from "mongoose";
import { TProduct } from "src/DB/models/Product/product.schema";

@Injectable()
export class ProductService {
    constructor(private readonly productRepository: ProductRepository,
        private readonly categoryRepository: categoryRepository,
        private readonly cloudService: cloudService) { }
    async addProduct(user: TUser, body: CreatProductDTO, files: {
        image: Express.Multer.File[],
        gallery?: Express.Multer.File[]
    }) {
        if (!files.image?.length)
            throw new BadRequestException("File of Image Missing")
        const category = await this.categoryRepository.findById(body.categoryId)
        if (!category)
            throw new BadRequestException("In-valid-category_Id")
        let folderId = String(Math.floor(100000 + Math.random() * 900000))
        const { secure_url, public_id } = await this.cloudService.uploadFile(files.image[0], { folder: `${process.env.APP_NAME}/Category/${category.folderId}/Product/${folderId}` })
        let image: IAttachments = { secure_url, public_id }
        let gallery: IAttachments[] = [];
        if (files.gallery && files.gallery.length !== 0) {
            gallery = await this.cloudService.uploadFiles(files.gallery, { folder: `${process.env.APP_NAME}/Category/${category.folderId}/Product/${folderId}/gallery` });
        }
        let finalPrice = this.CalcFinalPrice(body.orginalPrice, body.discountPrecent)
        const product = await this.productRepository.create({ ...body, folderId, image, gallery, finalPrice, createdBy: user._id })
        return { seccess: true, data: product }

    }
    async updateProduct(body: updateProductDTO, params: ParamProductIdDTO, files: {
        image?: Express.Multer.File[],
        gallery?: Express.Multer.File[]
    }) {
        const product = await this.productRepository.findById(params.ProductId, {}, { populate: [{ path: "categoryId", select: "folderId" }] })
        if (!product)
            throw new BadRequestException("Product Not Found")
        let finalPrice: number = product.finalPrice;
        if (body.orginalPrice || body.discountPrecent) {
            finalPrice = this.CalcFinalPrice(body.orginalPrice || product.orginalPrice, body.discountPrecent || product.discountPrecent)
        }
        let image: IAttachments = product.image;
        if (files.image?.length) {
            const { secure_url, public_id } = await this.cloudService.uploadFile(files.image[0], { folder: `${process.env.APP_NAME}/Category/${product.categoryId["folderId"]}/Product/${product.folderId}` })
            image = { secure_url, public_id };
        }
        let gallery: IAttachments[] = product.gallery;
        if (files.gallery?.length) {
            gallery = await this.cloudService.uploadFiles(files.gallery, { folder: `${process.env.APP_NAME}/Category/${product.categoryId["folderId"]}/Product/${product.folderId}/gallery` })
        }
        const updateProduct = await this.productRepository.updateOne({ _id: params.ProductId }, { ...body, image, gallery, finalPrice, })
        if (updateProduct.modifiedCount && files.image?.length) {
            await this.cloudService.destroyFile(product.image.public_id)
        }
        if (updateProduct.modifiedCount && files.gallery?.length && product.gallery?.length) {
            let ids = product.gallery.map(obj => obj.public_id)
            await this.cloudService.destroyFiles(ids)
        }
        return { success: true, data: "Product Updated Successfully" }
    }
    async list(query: QueryProductDTO) {
        let filter: FilterQuery<TProduct> = {};
        if (query.name) {
            filter = {
                $or: [
                    { name: { $regex: query.name, $options: "i" } },
                    { slug: { $regex: query.name, $options: "i" } }
                ]
            }
        }
        if (query.categoryId) {
            filter = { ...filter, categoryId: query.categoryId };
        }
        const data = await this.productRepository.find(filter , query.select, { sort: query.sort }, query.page)
        return {success : true , data}
    }
    private CalcFinalPrice(orginalPrice: number, discountPrecent: number) {
        let result = orginalPrice - ((discountPrecent || 0) / 100) * orginalPrice
        return result > 0 ? result : 0
    }

    async toggleLike(user: TUser, params: LikeProductDTO) {
        const product = await this.productRepository.findById(params.ProductId);
        if (!product) {
            throw new BadRequestException("Product not found");
        }

        const userLiked = product.likes.includes(user._id);
        
        if (userLiked) {
            // Unlike: remove user from likes array
            await this.productRepository.updateOne(
                { _id: params.ProductId },
                { $pull: { likes: user._id } }
            );
            return { success: true, message: "Product unliked successfully", liked: false };
        } else {
            // Like: add user to likes array
            await this.productRepository.updateOne(
                { _id: params.ProductId },
                { $addToSet: { likes: user._id } }
            );
            return { success: true, message: "Product liked successfully", liked: true };
        }
    }

    async getLikedProducts(user: TUser) {
        const products = await this.productRepository.find(
            { likes: user._id },
            "",
            { sort: { createdAt: -1 } }
        );
        return { success: true, data: products };
    }

    async deleteProduct(params: ParamProductIdDTO) {
        const product = await this.productRepository.findById(params.ProductId, {}, { 
            populate: [{ path: "categoryId", select: "folderId" }] 
        });
        
        if (!product) {
            throw new BadRequestException("Product not found");
        }

        // Delete image from cloud
        if (product.image?.public_id) {
            await this.cloudService.destroyFile(product.image.public_id);
        }

        // Delete gallery images from cloud
        if (product.gallery?.length) {
            const galleryIds = product.gallery.map(img => img.public_id);
            await this.cloudService.destroyFiles(galleryIds);
        }

        // Delete product from database
        await this.productRepository.findByIdAndDelete(params.ProductId.toString(), {});

        return { success: true, message: "Product deleted successfully" };
    }

    async getProductById(params: ParamProductIdDTO) {
        const product = await this.productRepository.findById(params.ProductId, {}, { populate: [{ path: "categoryId" }] });
        if (!product) {
            throw new BadRequestException("Product not found");
        }
        return { success: true, data: product };
    }
}