import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsArray, IsMongoId, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min, MinLength } from "class-validator";
import { Types } from "mongoose";
import { QueryFilterDTO } from "src/commen/dto";
import { productSize } from "src/DB/models/Product/product.schema";

export class CreatProductDTO {
    @IsString()
    @MaxLength(100)
    @MinLength(1)
    name: string;
    @IsString()
    description: string;
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    stock: number;
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    orginalPrice: number;
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    discountPrecent: number;
    @IsArray()
    @IsOptional()
    colors?: string[];
    @IsArray()
    @IsOptional()
    size?: productSize[];
    @IsMongoId()
    categoryId: Types.ObjectId
}

export class updateProductDTO extends PartialType(CreatProductDTO) { }
export class ParamProductIdDTO {
    @IsMongoId()
    ProductId: Types.ObjectId
}
export class QueryProductDTO extends QueryFilterDTO {
    @IsString()
    @MaxLength(100)
    @MinLength(1)
    @IsOptional()
    name: string;
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(1)
    minPrice: number;
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(1)
    maxPrice: number;
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(1)
    stock: number
    @IsMongoId()
    @IsOptional()
    categoryId : string

}

export class LikeProductDTO {
    @IsMongoId()
    ProductId: Types.ObjectId
}