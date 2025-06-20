import { Type } from "class-transformer";
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsPositive, IsString, Matches, Max, MaxLength, MinLength } from "class-validator";
import { Types } from "mongoose";
import { IPaymentMethod } from "src/DB/models/Order/order.schema";
import { OrderStatus } from "src/DB/models/Order/order.schema";

export class creatOrderDTO {
    @IsString()
    @MinLength(2)
    @MaxLength(1000)
    address: string;

    @IsString()
    @Matches(/^(01)[0-2,5]{1}[0-9]{8}$/, { message: 'Phone number must be a valid Egyptian mobile number' })
    phone: string;

    @IsString()
    @MinLength(2)
    @MaxLength(5000)
    note: string;

    @IsString()
    @IsEnum(IPaymentMethod)
    paymentMethod: IPaymentMethod;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    couponCode?: string;
}

export class orderIdDTO{
    @IsMongoId()
    orderId : Types.ObjectId
}

export class UpdateOrderStatusDTO {
    @IsEnum(OrderStatus)
    status: OrderStatus;
    
    @IsString()
    @IsOptional()
    rejectedReason?: string;
}

export class AdminOrderQueryDTO {
    @IsEnum(OrderStatus)
    @IsOptional()
    status?: OrderStatus;
    
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    page?: number;
    
    @IsString()
    @IsOptional()
    sort?: string;
}