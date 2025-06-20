import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { IAttachments } from "src/commen/multer/cloud.service";
import { User } from "../User/user.schema";
import slugify from "slugify";

@Schema({ timestamps: true })
export class Category {
    @Prop({ type: String, required: true, maxlength: 50 })
    name: string;
    @Prop({
        type: String, maxlength: 75, default: function () {
            return slugify(this.name, { trim: true })
        }
    })
    slug: string;
    @Prop(raw({
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true }
    }))
    logo: IAttachments;
    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    createdBy: Types.ObjectId;
    @Prop({ type: String, required: true })
    folderId : string
}
export const categorySchema = SchemaFactory.createForClass(Category);

categorySchema.pre("updateOne", function (next) {
    const update = this.getUpdate()
    if (update && update["name"]) {
        update["slug"] = slugify(update["name"], { trim: true })
        this.setUpdate(update)
    }
    next()
})
export type Tcategory = Category & Document