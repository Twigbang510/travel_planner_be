import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GooglemapsPlaceService } from './googlemaps-place.service';
import { GetPlaceIdDto } from './dto/place-detail.dto';
import { NearbySearchDto } from './dto/nearby-search.dto';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { UserData } from 'src/decorators/user-data.decorator';

@Controller('googlemaps-place')
@UseGuards(JwtAuthGuard)
export class GooglemapsPlaceController {
  constructor(
    private readonly googlemapsPlaceService: GooglemapsPlaceService,
  ) {}

  @Post('details')
  getPlace(@Body() getPlaceIdDto: GetPlaceIdDto): Promise<any> {
    return this.googlemapsPlaceService.getPlaceDetails(getPlaceIdDto.placeId);
  }

  @Post('nearby')
  getNearbyPlaces(@Body() nearbySearchDto: NearbySearchDto,  @UserData() user: any ): Promise<any> {
    return this.googlemapsPlaceService.getNearbyPlaces(nearbySearchDto, user.id);
  }
}
