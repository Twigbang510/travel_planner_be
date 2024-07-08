import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GooglemapsPlaceService } from './googlemaps-place.service';
import { GetPlaceIdDto } from './dto/place-detail.dto';
import { NearbySearchDto } from './dto/nearby-search.dto';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { UserData } from 'src/decorators/user-data.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('googlemaps-place')
@ApiBearerAuth()
@Controller('googlemaps-place')
@UseGuards(JwtAuthGuard)
export class GooglemapsPlaceController {
  constructor(
    private readonly googlemapsPlaceService: GooglemapsPlaceService,
  ) {}

  @Post('details')
  @ApiOperation({ summary: 'Get place details by place ID' })
  getPlace(@Body() getPlaceIdDto: GetPlaceIdDto): Promise<any> {
    return this.googlemapsPlaceService.getPlaceDetails(getPlaceIdDto.placeId);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Get city autocomplete suggestions' })
  async getCityAutocomplete(@Query('input') input: string) {
    if (!input) {
      throw new HttpException('Input is required', HttpStatus.BAD_REQUEST);
    }
    return this.googlemapsPlaceService.getCityAutocomplete(input);
  }

  @Get('hotels')
  @ApiOperation({ summary: 'Find hotels by city place ID' })
  async findHotelsByCity(@Query('placeId') placeId: string) {
    if (!placeId) {
      throw new HttpException('Place ID is required', HttpStatus.BAD_REQUEST);
    }
    return this.googlemapsPlaceService.findHotelsByCity(placeId);
  }

  @Post('getplan')
  @ApiOperation({ summary: 'Get travel itinerary plan' })
  getPlan(
    @Body() nearbySearchDto: NearbySearchDto,
    @UserData() user: any,
  ): Promise<any> {
    return this.googlemapsPlaceService.getItinerary(nearbySearchDto, user.id);
  }
}
