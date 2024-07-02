import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigService } from '../config/app-config.service';
import { TokenService } from './token.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (appConfigService: AppConfigService) => ({
        secret: appConfigService.jwtSecretKey,
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [JwtStrategy, AppConfigService, TokenService],
  exports: [TokenService],
})
export class TokenModule {}
