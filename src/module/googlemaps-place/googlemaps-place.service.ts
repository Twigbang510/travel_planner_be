import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Client } from '@googlemaps/google-maps-services-js';
import { AppConfigService } from '../config/app-config.service';
import { NearbySearchDto } from './dto/nearby-search.dto';
import { PredictionServiceClient } from '@google-cloud/aiplatform';
import { SentimentResult } from './interface/sentiment-result.interface';

@Injectable()
export class GooglemapsPlaceService {
  private googleMapsClient: Client;
  private aiPlatformClient: PredictionServiceClient;
  private language = require('@google-cloud/language');
  private client = new this.language.LanguageServiceClient();
  private currentDate = 1;
  private currentTime = new Date().setHours(6, 0, 0, 0);
  private endTime = new Date().setHours(20, 0, 0, 0);
  private placeList = [];
  private currentTypeIndex: number = 0;

  constructor(private configService: AppConfigService) {
    this.googleMapsClient = new Client({});
  }

  async getBestPlace(results: SentimentResult[]): Promise<{ place_id: string; score: number; }> {
    if (!results.length ) return null;

    const bestPlace = results.reduce((prevBest, current) => {
      return current.score > prevBest.score ? current : prevBest;
    });
    return {place_id: bestPlace.place_id, score: bestPlace.score}
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
    const { lat, lng, types, date_range, radius = 1500 } = nearbySearchDto;
    const startDate = new Date(date_range[0]);
    const endDate = new Date(date_range[1]);
    const total_dates = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    try {
      if (this.currentDate < total_dates) {
        const placePromises = types.map(async (type) => {
          const response = await this.googleMapsClient.placesNearby({
            params: {
              location: { lat, lng },
              radius,
              type: type,
              key: this.configService.googleMapsKey,
            },
          });
  
          const place_reviews = await Promise.all(
            response.data.results.map(async (place) => {
              const reviews = await this.getPlaceReviews(place.place_id);
              return reviews ? reviews : { place_id: place.place_id, reviews: [] };
            }),
          );
  
          const review_scores: SentimentResult[] = await Promise.all(
            place_reviews.map(async (place) => {
              const sentiment = await this.analyzeSentiment(place);
              return sentiment;
            }),
          );
  
          const bestPlace = await this.getBestPlace(review_scores);
          return bestPlace;

        });
  
        this.placeList = await Promise.all(placePromises);
        return this.placeList;
      } else {
        return this.placeList;
      }
  
    } catch (error) {
      console.error(error.response?.data || error.message);
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
      return reviews.length ? { place_id: placeId, reviews } : null;
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw new HttpException(
        'Error fetching place details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async analyzeSentiment(reviews: { place_id: string, reviews: { text: string; }[] }): Promise<SentimentResult> {
    const text = reviews.reviews.map((review) => review.text).join('\n');
    try {
      const document = {
        content: text,
        type: 'PLAIN_TEXT',
      };
      const [result] = await this.client.analyzeSentiment({
        document: document,
      });
      const sentiment = result.documentSentiment;
      return { place_id: reviews.place_id, score: sentiment.score };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error analyzing sentiment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}
