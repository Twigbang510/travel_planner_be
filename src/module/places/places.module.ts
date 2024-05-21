import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { GooglemapsPlaceModule } from '../googlemaps-place/googlemaps-place.module';
import { GooglemapsPlaceService } from '../googlemaps-place/googlemaps-place.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [GooglemapsPlaceModule, ConfigModule],
  controllers: [PlacesController],
  providers: [PlacesService, GooglemapsPlaceService],
})
export class PlacesModule {}
