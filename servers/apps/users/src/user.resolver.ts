/* eslint-disable prettier/prettier */
import { BadRequestException } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  ActivationResponse,
  LoginResponse,
  RegisterResponse,
} from './types/user.types';
import {
  ActivationDto,
  RegisterDto,
} from './dto/users.dto';
import { Response } from 'express';
import { UsersService } from './users.service';
import { User } from './entities/users.entity';

@Resolver('User')
// @UseFilters
export class UsersResolver {
    constructor(private readonly userService: UsersService) {}

    @Mutation(() => RegisterResponse)
    async register(
        @Args('registerDto') registerDto: RegisterDto,
        @Context() context: { res: Response },
    ): Promise<RegisterResponse> {
        if (!registerDto.name || !registerDto.email || !registerDto.password) {
        throw new BadRequestException('Please fill the all fields');
    }

    const  {activation_Token}  = await this.userService.register(
        registerDto,
        context.res,
    );

        return { activation_Token };
    }

    @Mutation(() => ActivationResponse)
    async activateUser(
        @Args('activationDto') activationDto: ActivationDto,
        @Context() context: { res: Response },
    ): Promise<ActivationResponse> {
        return await this.userService.activateUser(activationDto, context.res);
    }

    @Mutation(() => LoginResponse)
    async Login(
        @Args('email') email: string,
        @Args('password') password: string,
    ): Promise<LoginResponse> {
        return await this.userService.Login({email, password})
    }

    @Query(() => [User])
    async getUsers() {
        return this.userService.getUsers();
    }
}