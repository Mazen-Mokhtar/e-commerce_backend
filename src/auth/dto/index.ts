import { IsEmail, IsString, IsStrongPassword, Max, MaxLength, Min, MinLength, Validate } from "class-validator";


import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: "match-password", async: false })
export class IsMisMatchPassowrd implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        const argsObj = args.object as any
        if (argsObj.password !== value) {
            return false
        }
        return true
    }
    defaultMessage(validationArguments?: ValidationArguments): string {
        return "Password misMatch cPassword"
    }
}

export class loginDTO {
    @IsString()
    @IsEmail()
    email: string;
    @IsString()
    @IsStrongPassword()
    password: string;
}

export class SignupDTO extends loginDTO {
    @IsString()
    @MinLength(2)
    @MaxLength(30)
    name: string
    @Validate(IsMisMatchPassowrd)
    cPassword: string;
    @IsString()
    phone: string

}
export class ConfirmDTO {
    @IsString()
    @IsEmail()
    email: string;
    @IsString()
    code: string;
}
