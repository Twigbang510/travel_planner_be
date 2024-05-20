import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { AppConfigService } from '../config/app-config.service';
import { ConfigModule } from '../config/config.module';
import { TokenModule } from '../token/token.module';
import { TokenService } from '../token/token.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
@Module({
  imports: [UserModule, ConfigModule, TokenModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, AppConfigService, TokenService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
