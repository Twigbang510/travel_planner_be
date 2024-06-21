import { Module } from '@nestjs/common';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from './module/config/config.module';

import { AppConfigService } from './module/config/app-config.service';
import { TokenModule } from './module/token/token.module';
import { GooglemapsPlaceModule } from './module/googlemaps-place/googlemaps-place.module';
import { PlanModule } from './module/plan/plan.module';
import { PlaceModule } from './module/place/place.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        dialect: configService.sqlDialect,
        host: configService.sqlHost,
        port: configService.sqlPort,
        username: configService.sqlUsername,
        password: configService.sqlPassword,
        database: configService.sqlDatabase,
        autoLoadModels: true,
        synchronize: true,
      }),
      inject: [AppConfigService],
    }),

    TokenModule,

    GooglemapsPlaceModule,

    PlaceModule,

    PlanModule,
  ],
})
export class AppModule {}
