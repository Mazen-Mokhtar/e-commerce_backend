import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import slugify from "slugify";
import { User } from "src/commen/Decorator/user.decorator";
import { IAttachments } from "src/commen/multer/cloud.service";
import { Category } from "../Category/category.schema";
export enum productSize {
    l = "l",
    m = "m",
    s = "s"
}
@Schema()
export class Product {
    @Prop({ type: String, required: true, maxlength: 100 })
    name: string;
    @Prop({
        type: String, maxlength: 150, default: function () {
            return slugify(this.name, { trim: true })
        }
    })
    slug: string;
    @Prop({type : String})
    description : string
    @Prop({ type: Number, required: true })
    stock: number;
    @Prop({ type: Number, required: true })
    orginalPrice: number;
    @Prop({ type: Number, required: true })
    discountPrecent: number;
    @Prop({ type: Number, required: true })
    finalPrice: number
    @Prop({ type: Array<String> })
    colors: string[]
    @Prop({ type: Array<productSize> })
    size: productSize[]
    @Prop(raw({
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true }
    }))
    image: IAttachments;
    @Prop(raw([{
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true }
    }]))
    gallery: IAttachments[];
    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    createdBy: Types.ObjectId
    @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
    categoryId: Types.ObjectId
    @Prop({type : String , required : true })
    folderId : string
    @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
    likes: Types.ObjectId[]
}

export const productSchema = SchemaFactory.createForClass(Product)

productSchema.pre("updateOne", function (next) {
    const update = this.getUpdate()
    if (update && update["name"]) {
        update["slug"] = slugify(update["name"], { trim: true })
        this.setUpdate(update)
    }
    next()
})

export type TProduct = HydratedDocument<Product>