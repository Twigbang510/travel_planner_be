import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Client } from '@googlemaps/google-maps-services-js';
import { AppConfigService } from '../config/app-config.service';
import { NearbySearchDto } from './dto/nearby-search.dto';
import { LanguageServiceClient } from '@google-cloud/language';

@Injectable()
export class GooglemapsPlaceService {
  private googleMapsClient: Client;
  private client: LanguageServiceClient;

  constructor(private configService: AppConfigService) {
    this.googleMapsClient = new Client({});
    this.client = new LanguageServiceClient();
  }

  async getPlaceDetails(placeId: string) {
    try {
      if (!placeId) {
        throw new HttpException('Place ID is required', HttpStatus.BAD_REQUEST);
      }
      const response = await this.googleMapsClient.placeDetails({
        params: {
          place_id: placeId,
          key: this.configService.googleMapsKey,
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'rating',
            'place_id',
          ],
        },
      });
      return response.data.result;
    } catch (error) {
      console.log(error.message);
      throw new HttpException(
        'Error fetching place details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getNearbyPlaces(nearbySearchDto: NearbySearchDto): Promise<any[]> {
    const { lat, lng, type, radius = 1500 } = nearbySearchDto;
    try {
      const response = await this.googleMapsClient.placesNearby({
        params: {
          location: { lat, lng },
          radius,
          type,
          key: this.configService.googleMapsKey,
        },
      });

      const results = await Promise.all(
        response.data.results.map(async (place) => ({
          ...place,
          reviews: await this.getPlaceReviews(place.place_id),
        })),
      );

      return results;
    } catch (error) {
      throw new HttpException(
        'Error fetching nearby places',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPlaceReviews(placeId: string) {
    try {
      const response = await this.googleMapsClient.placeDetails({
        params: {
          place_id: placeId,
          key: this.configService.googleMapsKey,
        },
      });

      const reviews = response.data.result.reviews || [];

      return {
        place_id: placeId,
        reviews: reviews,
      };
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw new HttpException(
        'Error fetching place details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}
