import { Body, Controller, Post } from '@nestjs/common';
import { GooglemapsPlaceService } from './googlemaps-place.service';
import { GetPlaceIdDto } from './dto/place-detail.dto';
import { NearbySearchDto } from './dto/nearby-search.dto';

@Controller('googlemaps-place')
export class GooglemapsPlaceController {
  constructor(
    private readonly googlemapsPlaceService: GooglemapsPlaceService,
  ) {}

  @Post('details')
  getPlace(@Body() getPlaceIdDto: GetPlaceIdDto): Promise<any> {
    return this.googlemapsPlaceService.getPlaceDetails(getPlaceIdDto.placeId);
  }

  @Post('nearby')
  getNearbyPlaces(@Body() nearbySearchDto: NearbySearchDto): Promise<any> {
    return this.googlemapsPlaceService.getNearbyPlaces(nearbySearchDto);
  }
}
