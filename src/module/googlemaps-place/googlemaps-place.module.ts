import { Module } from '@nestjs/common';
import { GooglemapsPlaceService } from './googlemaps-place.service';
import { GooglemapsPlaceController } from './googlemaps-place.controller';
import { ConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/app-config.service';
import { PlacesModule } from '../places/places.module';

@Module({
  imports: [ConfigModule, PlacesModule],
  controllers: [GooglemapsPlaceController],
  providers: [GooglemapsPlaceService, AppConfigService],
})
export class GooglemapsPlaceModule {}
