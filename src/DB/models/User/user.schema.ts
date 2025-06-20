import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { generateHash } from "src/commen/security/hash";
export enum RoleTypes{
    USER = "user",
    ADMIN = "admin",
    DELIVERY = "delivery"
}
@Schema()
export class User {
    @Prop({ type: String, required: true })
    name: string;
    @Prop({ type: String, unique: true, required: true })
    email: string;
    @Prop({ type: String, required: true })
    password: string;
    @Prop({ type: String, required: true })
    phone: string
    @Prop({ type: String })
    code: string | undefined
    @Prop({ type: String, enum: RoleTypes, default: "user" })
    role: string
    @Prop({ type: Boolean})
    isConfirm: boolean
}

// schema

export const userSchema = SchemaFactory.createForClass(User)
userSchema.pre("save", function (next) {
    if (this.isModified("password"))
        this.password = generateHash(this.password)
    next()
})
// user type 
export type TUser = HydratedDocument<User>


