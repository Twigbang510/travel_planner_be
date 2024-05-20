import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
import { AppConfigService } from '../config/app-config.service';
@Module({
  imports:[DatabaseModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, AppConfigService],
  exports: [AuthService]
})
export class AuthModule {}
