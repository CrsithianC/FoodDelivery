/* eslint-disable prettier/prettier */
import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../entities/users.entity';

@ObjectType()
export class ErrorType {
    @Field()
    message: string;

    @Field({nullable: true})
    code?: string;
}

@ObjectType()
export class RegisterResponse {
    @Field()
    activation_Token: string;

    @Field(() => ErrorType, {nullable: true})
    error?: ErrorType;
}

@ObjectType()
export class ActivationResponse {
	@Field(() => User)
	user: User | any;

	@Field(() => ErrorType, {nullable: true})
	error?: ErrorType;
}

@ObjectType()
export class LoginResponse {
  @Field(() => User)
  user?: User | any;

  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => ErrorType)
  error?: ErrorType;
}