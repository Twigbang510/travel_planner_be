import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { AppConfigService } from '../config/app-config.service';
import { ConfigModule } from '../config/config.module';
@Module({
  imports: [UserModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, AppConfigService],
  exports: [AuthService],
})
export class AuthModule {}
