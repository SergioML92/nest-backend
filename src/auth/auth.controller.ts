import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';

import { CreateUserDto, LoginDto, RegisterUserDto } from './dto';
import { User } from './entities/user.entity';
import { AuthGuard } from './guards/auth.guard';
import { LoginResponse } from './interfaces/login-response';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.authService.create(createUserDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Post('/register')
  register(@Body() registerDto: RegisterUserDto): Promise<LoginResponse> {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(): Promise<User[]> {
    return this.authService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('/check-token')
  checkToken(@Req() req: Request): LoginResponse {

    const user: User = req['user'] as User;

    return {
      user,
      token: this.authService.getJwtToken({ id: user._id })
    };
  }

  /*
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
  */
}