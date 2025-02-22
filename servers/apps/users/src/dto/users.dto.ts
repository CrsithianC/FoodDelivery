/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

@InputType()
export class RegisterDto {
    @Field()
    @IsNotEmpty({ message: 'Name is required.'})
    @IsString({ message: 'Name must need to be one string.'})
    name: string;

    @Field()
    @IsNotEmpty({ message: 'Password is required.'})
    @MinLength(8, { message: 'Password must be at leat 8 characters.'})
    password: string;

    @Field()
    @IsNotEmpty({ message: 'Email is required.'})
    @IsEmail({}, {message: 'Email is invalid.'})
    email: string;


    @Field()
    @IsNotEmpty({ message: 'Phone number is required.'})
    phone_number: number;
}
@InputType()

@InputType()
export class ActivationDto{
    @Field()
    @IsNotEmpty({ message: 'Activation Token is required'})
    activationToken: string;
    @Field()
    @IsNotEmpty({ message: 'Activation Code is required'})
    activatitonCode: string;
}

export class LoginDto {
    @Field()
    @IsNotEmpty({ message: 'Email is required.'})
    @IsEmail({}, { message: 'Email must be valid.'})
    email: string;

    @Field()
    @IsNotEmpty({ message: 'Password is required. '})
    password: string;
}