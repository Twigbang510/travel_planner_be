import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { DatabaseModule } from '../database/database.module';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class AuthService {
  constructor (
    private userService : UserService,
    private configService : AppConfigService
  )
  {}
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.configService.salt);
    return await bcrypt.hash(password, salt);
  }
  async register(authDto: AuthDto): Promise<User> {
    const userData = await this.userService.findOneByEmail(authDto.email)
    if (!!userData) throw new ForbiddenException('Email has exist')
    return await this.userService.create(authDto)
  }
}
