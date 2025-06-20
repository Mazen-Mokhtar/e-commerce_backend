import { Type } from "class-transformer";
import { IsMongoId, IsNumber, IsOptional, IsPositive, Validate, validate } from "class-validator";
import { Types } from "mongoose"


import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'vlidationArryOfIds', async: false })
export class VlidationArryOfIds implements ValidatorConstraintInterface {
    validate(value: Types.ObjectId[], args: ValidationArguments): boolean {
        for (const id of value) {
            if (!Types.ObjectId.isValid(id)) {
                return false
            }
        }
        return true
    }

    defaultMessage(args: ValidationArguments) {
        // here you can provide default error message if validation failed
        return 'please enter valid ids';
    }
}
export class addToCartDTO {
    @IsMongoId()
    productId: Types.ObjectId;
    @IsNumber()
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    quantity: number
}
export class removeItemToCartDTO{
    @Validate(VlidationArryOfIds)
    productsIds : Types.ObjectId[]
}
