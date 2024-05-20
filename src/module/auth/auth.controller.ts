import { Controller, Post, Get, Req, Param, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto';
import { UserDto } from '../user/dto/login-user.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() user: CreateUserDto) {
    try {
      const createdUser = await this.authService.register(user);
      delete createdUser.password;
      console.log('Tao o day', createdUser);
      return createdUser;
    } catch (err) {
      return err.response;
    }
  }

}
