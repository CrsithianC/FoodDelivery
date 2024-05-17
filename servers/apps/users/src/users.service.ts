/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { ActivationDto, LoginDto, RegisterDto } from './dto/users.dto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/Prisma.service';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { EmailService } from './email/email.service';
import { TokenSender } from './utils/sendToken';
interface UserData {
  name: string;
  email: string;
  password: string;
  phone_number: number;
}
@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}
  async register(RegisterDto: RegisterDto, response: Response) {
    const { name, email, password, phone_number } = RegisterDto;
    const isEmailExist = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if(isEmailExist){
      throw new BadRequestException('User already exist with this email!');
    }

    const isPhoneNumberExist = await this.prisma.user.findUnique({
      where: {
        phone_number,
      },
    });

    if(isPhoneNumberExist){
      throw new BadRequestException('User already exist with this phone number');
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user ={
        name,
        email,
        password: hashedPassword,
        phone_number,
    };

    const activationToken = await this.createActivationToken(user);
    const activation_Token = activationToken.token;

    const activationCode = activationToken.activationCode;

    await this.emailService.sendMail({
      email,
      subject:'Activate your account',
      template: './email-templates/activation-mail',
      name,
      activationCode,
    });
    return {activation_Token, response};
  }

  async createActivationToken(user: UserData) {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = this.jwtService.sign(
      {
        user,
        activationCode,
      },
      {
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
        expiresIn: '5m',
      },
    );
    return { token, activationCode };
  }

    async activateUser(activationDto: ActivationDto, response: Response) {
		const {activationToken, activatitonCode} = activationDto;
		const newUser: { user: UserData, activationCode: string} = this.jwtService.verify(
			activationToken,
			{secret: this.configService.get<string>('ACTIVATION_SECRET')} as JwtVerifyOptions,
		);

		if(newUser.activationCode !== activatitonCode) {
			throw new BadRequestException('Invalid Activation Code');
		}

		const {name, email, password,phone_number} = newUser.user;
		const existUser = await this.prisma.user.findUnique({
			where: {
				email,
			},
		});
		if (existUser) {
			throw new BadRequestException('User already exist with this email!')
		}

		const user = await this.prisma.user.create({
			data: {
				name, email, password, phone_number,
			},
		});

		return {user, response}
    }

  async Login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if ( user && await this.comparePassword(password, user.password)) {
      const tokenSender = new TokenSender(this.configService, this.jwtService);
      tokenSender.sendToken(user);
    } else {
      throw new BadRequestException('Invalid credentials');
    }
  }

  async comparePassword( password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
    
  async getUsers() {
    return this.prisma.user.findMany({});
  }
}
