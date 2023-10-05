import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';

import * as bcryptjs from 'bcryptjs';

import { CreateUserDto, LoginDto, RegisterUserDto, UpdateAuthDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {

    try {

      const { password, ...userData } = createUserDto;

      const newUser = new this.userModel({
        // 1.- Encriptar la contraseña
        password: bcryptjs.hashSync(password, 10),
        ...userData
      });

      // 2.- Guardar el usuario
      await newUser.save();

      // 3.- Eliminamos la contraseña del objeto de salida
      const { password: _, ...user } = newUser.toJSON();

      return user;
    } catch (error) {
      console.error(error);
      if (error.code === 11000) {
        // Clave duplicada
        throw new BadRequestException(`${createUserDto.email} already exists!`);
      }
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
  }

  async register(registerDto: RegisterUserDto): Promise<LoginResponse> {

    const user = await this.create(registerDto);

    return {
      user,
      token: this.getJwtToken({ id: user._id })
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {

    console.log({ loginDto });

    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Not valid credentials - email');
    }

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials - password');
    }

    const { password: _, ...rest } = user.toJSON();

    return {
      user: rest,
      token: this.getJwtToken({ id: user.id })
    };
  }

  getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    console.log({ token });
    return token;
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById( id: string) {
    const user = await this.userModel.findById(id);

    const {password, ...rest} = user.toJSON();
    return rest;
  }




  
  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
