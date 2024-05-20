import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AppConfigService } from '../config/app-config.service';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { TokenService } from '../token/token.service';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private configService: AppConfigService,
    private tokenService: TokenService
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.configService.salt);
    return await bcrypt.hash(password, salt);
  }
  async checkPassword(
    plainPassword: string,
    encryptedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, encryptedPassword);
  }

  async validateUser({ email, password }: LoginUserDto): Promise<boolean> {
    const user = await this.userService.findOneByEmail(email);
    
    if (!user) return false;

    const isValid = await this.checkPassword(password, user.password);

    if (isValid) return true;

    return false;
  }
  async register(authDto: AuthDto): Promise<User> {
    const userData = await this.userService.findOneByEmail(authDto.email);
    // Check if user exist
    if (!!userData) throw new ForbiddenException('Email has exist');

    return await this.userService.create({
      ...authDto,
      password: await this.hashPassword(authDto.password),
    });
  }

  async login({ email, password }: LoginUserDto): Promise<string> {
    const checkUser: boolean = await this.validateUser({ email, password });
    console.log( checkUser)
    if (!checkUser) throw new UnauthorizedException();

    const userData: User = await this.userService.findOneByEmail(email);

    return await this.tokenService.getToken(userData.id);
  }
}
