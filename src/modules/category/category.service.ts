import { BadRequestException, Body, ConflictException, Injectable, NotFoundException, Param } from "@nestjs/common";
import { categoryRepository } from "src/DB/models/Category/category.repository";
import { TUser } from "src/DB/models/User/user.schema";
import { CreatCategoryDTO, ParamCategoryDTO, QueryCategoryDTO, UpdateCategoryDTO } from "./dto";
import { cloudService, IAttachments } from "src/commen/multer/cloud.service";
import { log } from "console";
import { FilterQuery } from "mongoose";
import { Tcategory } from "src/DB/models/Category/category.schema";
import { ProductRepository } from "src/DB/models/Product/product.repository";

@Injectable()
export class CategoryService {
    constructor(private readonly categoryRepository: categoryRepository, private readonly cloudService: cloudService, private readonly productRepository: ProductRepository) { }
    async creat(user: TUser, body: CreatCategoryDTO, file: Express.Multer.File) {
        if (!file)
            throw new BadRequestException("Missing file")
        if (await this.categoryRepository.findOne({ name: body.name }))
            throw new ConflictException("name already exist")
        let folderId = String(Math.floor(100000 + Math.random() * 900000))
        const { secure_url, public_id } = await this.cloudService.uploadFile(file , {folder : `${process.env.APP_NAME}/Category/${folderId}`})
        const category = await this.categoryRepository.create({ name: body.name, logo: { secure_url, public_id }, createdBy: user._id , folderId })
        return { data: category }
    }
    async update(params: ParamCategoryDTO, body?: UpdateCategoryDTO, file?: Express.Multer.File) {
        log(body)
        const category = await this.categoryRepository.findById(params.categoryId);
        if (!category)
            throw new BadRequestException("In-valid-category_Id");
        if (body?.name && await this.categoryRepository.findOne({ name: body.name, _id: { $ne: params.categoryId } }))
            throw new ConflictException("This name already exist")
        let logo: IAttachments = category.logo;
        if (file) {
            const { secure_url, public_id } = await this.cloudService.uploadFile(file, {folder : `${process.env.APP_NAME}/Category/${category.folderId}`})
            if (category.logo.public_id)
                await this.cloudService.destroyFile(category.logo.public_id)
            logo = { secure_url, public_id }
        }
        const check = await this.categoryRepository.updateOne({ _id: category }, { name: body?.name, logo: logo })
        log(check)
        return { messgae: "Category updated successffuly" }
    }
    async getCategory(params: ParamCategoryDTO) {
        const category = await this.categoryRepository.findById(params.categoryId)
        if (!category)
            throw new NotFoundException("Not found Category")
        await category.populate([{ path: "createdBy", select: "-password" }])
        return { success: true, data: category }
    }
    async getAllCategory(query: QueryCategoryDTO) {
        let filter: FilterQuery<Tcategory> = {}
        if (query.name) {
            filter = {
                $or: [
                    { name: { $regex: query.name, $options: "i" } },
                    { slug: { $regex: query.name, $options: "i" } }
                ]
            }
        }
        const data = await this.categoryRepository.find(filter , "" , {sort : query.sort}, query.page)
        return {success : true , data}
    }

    async deleteCategory(params: ParamCategoryDTO) {
        const category = await this.categoryRepository.findById(params.categoryId);
        if (!category) {
            throw new BadRequestException("Category not found");
        }

        // Check if category has products
        const productCount = await this.productRepository.countDocuments({ categoryId: params.categoryId });
        if (productCount > 0) {
            throw new BadRequestException("Cannot delete category with existing products");
        }

        // Delete logo from cloud
        if (category.logo?.public_id) {
            await this.cloudService.destroyFile(category.logo.public_id);
        }

        // Delete category from database
        await this.categoryRepository.findByIdAndDelete(params.categoryId.toString(), {});

        return { success: true, message: "Category deleted successfully" };
    }
}