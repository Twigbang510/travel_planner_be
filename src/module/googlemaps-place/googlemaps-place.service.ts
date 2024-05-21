import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Client } from '@googlemaps/google-maps-services-js';
import { AppConfigService } from '../config/app-config.service';
import { NearbySearchDto } from './dto/nearby-search.dto';
import { PredictionServiceClient } from '@google-cloud/aiplatform';

@Injectable()
export class GooglemapsPlaceService {
  private googleMapsClient: Client;
  private aiPlatformClient: PredictionServiceClient;

  constructor(private configService: AppConfigService) {
    this.googleMapsClient = new Client({});
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
      console.log(response.data.result);
      return response.data.result;
    } catch (error) {
      console.log(error.message);
      throw new HttpException(
        'Error fetching place details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getNearbyPlaces(nearbySearchDto: NearbySearchDto) {
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
      const results = response.data.results.map((place) => ({
        place_id: place.place_id,
      }));
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
      return response.data.result.reviews || [];
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw new HttpException(
        'Error fetching place details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async analyzeSentiment(text: string): Promise<number> {
    try {
      const [response] = await this.aiPlatformClient.predict({
        endpoint: `projects/${this.configService.googleProjectId}/locations/${this.configService.googleLocation}/endpoints/${this.configService.googleEndpointId}`,
        instances: [{ content: text }],
      });

      const sentimentScore = response.predictions[0].sentiment || 0;
      return sentimentScore;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error analyzing sentiment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAverageSentimentScore(reviews: string[]) {
    const scores = await Promise.all(
      reviews.map((review) => this.analyzeSentiment(review)),
    );
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    return totalScore / scores.length;
  }

  async getNearbyPlacesWithSentiment(nearbySearchDto: NearbySearchDto) {
    const places = await this.getNearbyPlaces(nearbySearchDto);
    const placeDetails = await Promise.all(
      places.map(async (place) => {
        const reviews = await this.getPlaceReviews(place.place_id);
        const reviewTexts = reviews.map((review) => review.text);
        const averageSentimentScore =
          await this.getAverageSentimentScore(reviewTexts);
        return {
          place_id: place.place_id,
          averageSentimentScore,
        };
      }),
    );
    return placeDetails;
  }
}
