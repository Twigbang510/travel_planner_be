import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Client } from '@googlemaps/google-maps-services-js';
import { AppConfigService } from '../config/app-config.service';
import { NearbySearchDto } from './dto/nearby-search.dto';
import { SentimentResult } from './interface/sentiment-result.interface';
import { sleep } from 'src/utils/helpers';

@Injectable()
export class GooglemapsPlaceService {
  private googleMapsClient: Client;
  private language = require('@google-cloud/language');
  private client = new this.language.LanguageServiceClient();
  private currentDate = 1;
  private currentTime = new Date().setHours(6, 0, 0, 0);
  private endTime = new Date().setHours(20, 0, 0, 0);

  private readonly averageVisitTimes = {
    accounting: 30,
    airport: 120,
    amusement_park: 240,
    aquarium: 90,
    art_gallery: 60,
    atm: 5,
    bakery: 15,
    bank: 30,
    bar: 120,
    beauty_salon: 90,
    bicycle_store: 30,
    book_store: 60,
    bowling_alley: 120,
    bus_station: 30,
    cafe: 60,
    campground: 180,
    car_dealer: 90,
    car_rental: 45,
    car_repair: 60,
    car_wash: 30,
    casino: 240,
    cemetery: 30,
    church: 60,
    city_hall: 45,
    clothing_store: 45,
    convenience_store: 15,
    courthouse: 60,
    dentist: 60,
    department_store: 90,
    doctor: 60,
    electrician: 45,
    electronics_store: 45,
    embassy: 60,
    fire_station: 30,
    florist: 15,
    funeral_home: 60,
    furniture_store: 60,
    gas_station: 10,
    gym: 90,
    hair_care: 60,
    hardware_store: 30,
    hindu_temple: 60,
    home_goods_store: 60,
    hospital: 90,
    insurance_agency: 45,
    jewelry_store: 30,
    laundry: 45,
    lawyer: 60,
    library: 90,
    light_rail_station: 30,
    liquor_store: 15,
    local_government_office: 60,
    locksmith: 30,
    lodging: 120,
    meal_delivery: 15,
    meal_takeaway: 15,
    mosque: 60,
    movie_rental: 15,
    movie_theater: 120,
    moving_company: 60,
    museum: 120,
    night_club: 180,
    painter: 45,
    park: 60,
    parking: 10,
    pet_store: 30,
    pharmacy: 15,
    physiotherapist: 60,
    plumber: 45,
    police: 60,
    post_office: 30,
    real_estate_agency: 60,
    restaurant: 90,
    roofing_contractor: 45,
    rv_park: 180,
    school: 60,
    shoe_store: 30,
    shopping_mall: 180,
    spa: 90,
    stadium: 180,
    storage: 30,
    store: 45,
    subway_station: 30,
    supermarket: 45,
    synagogue: 60,
    taxi_stand: 10,
    train_station: 30,
    transit_station: 30,
    travel_agency: 45,
    veterinary_care: 60,
    zoo: 180,
  };

  constructor(private configService: AppConfigService) {
    this.googleMapsClient = new Client({});
  }

  /**
   * Format time to 'HH:mm:ss' string.
   * @param date - The date in milliseconds.
   * @returns Formatted time string.
   */
  private formatTime(date: number): string {
    return new Date(date).toLocaleTimeString('en-US', { hour12: false });
  }

  /**
   * Calculate the next time and date based on the current time and average visit time for a place type.
   * @param currentTime - The current time in milliseconds.
   * @param localCurrentDate - The current date as a number.
   * @param type - The place type.
   * @returns The next time and date.
   */
  private getNextTime(
    currentTime: number,
    localCurrentDate: number,
    type: string,
  ): { fromTime: number; nextTime: number; nextDate: number } {
    const averageTime = this.averageVisitTimes[type] || 0;
    let fromTime = currentTime;
    let nextTime = currentTime + averageTime * 60000;

    // If next time exceeds the end time, move to the next day and reset the time.
    if (nextTime > this.endTime) {
      localCurrentDate += 1;
      fromTime = new Date().setHours(6, 0, 0, 0);
      nextTime = fromTime + averageTime * 60000;
    }

    return { fromTime, nextTime, nextDate: localCurrentDate };
  }

  /**
   * Get the place with the highest sentiment score from the results.
   * @param results - Array of sentiment results.
   * @returns The place with the highest score or null if no results.
   */
  private async getBestPlace(
    results: SentimentResult[],
  ): Promise<{ place_id: string; score: number } | null> {
    return results.length
      ? results.reduce((best, current) =>
          current.score > best.score ? current : best,
        )
      : null;
  }

  /**
   * Get reviews for a specific place.
   * @param placeId - The place ID.
   * @returns The place ID and its reviews or null if no reviews.
   */
  private async getPlaceReviews(placeId: string) {
    const { data } = await this.googleMapsClient.placeDetails({
      params: {
        place_id: placeId,
        key: this.configService.googleMapsKey,
      },
    });

    return data.result.reviews?.length
      ? { place_id: placeId, reviews: data.result.reviews }
      : null;
  }

  /**
   * Analyze the sentiment of the reviews.
   * @param reviews - The place reviews.
   * @returns The sentiment result.
   */
  private async analyzeSentiment(reviews: {
    place_id: string;
    reviews: { text: string }[];
  }): Promise<SentimentResult> {
    const text = reviews.reviews.map((review) => review.text).join('\n');
    const [result] = await this.client.analyzeSentiment({
      document: { content: text, type: 'PLAIN_TEXT' },
    });
    return {
      place_id: reviews.place_id,
      score: result.documentSentiment.score,
    };
  }

  /**
   * Fetch place reviews and analyze their sentiment.
   * @param placeIds - Array of place IDs.
   * @returns Array of sentiment results sorted by score.
   */
  private async fetchPlaceReviewsAndAnalyzeSentiment(
    placeIds: string[],
  ): Promise<SentimentResult[]> {
    const placeReviewsPromises = placeIds.map((placeId) =>
      this.getPlaceReviews(placeId),
    );
    const placeReviews = await Promise.all(placeReviewsPromises);
    const filteredReviews = placeReviews.filter((reviews) => reviews !== null);

    const scores = await Promise.all(
      filteredReviews.map((reviews) => this.analyzeSentiment(reviews)),
    );
    const filteredScores = scores.filter((result) => result.score >= 0);

    // Sort scores in descending order
    const sortedScores = filteredScores.sort((a, b) => b.score - a.score);
    return sortedScores;
  }

  /**
   * Fetch nearby places based on location, type, and radius.
   * @param lat - Latitude of the location.
   * @param lng - Longitude of the location.
   * @param type - The place type.
   * @param radius - Search radius.
   * @param nextPageToken - Token for the next page of results.
   * @returns The next page token and array of place IDs.
   */
  private async fetchNearbyPlaces(
    lat: number,
    lng: number,
    type: string,
    radius: number,
    nextPageToken: string,
  ): Promise<{ nextPage: string; placeId: string[] }> {
    try {
      const params: any = {
        location: { lat, lng },
        radius,
        type,
        key: this.configService.googleMapsKey,
      };
      if (nextPageToken) {
        params.pagetoken = nextPageToken;
      }
      await sleep(1000); // Sleep to avoid exceeding API rate limits
      const response = await this.googleMapsClient.placesNearby({ params });

      return {
        nextPage: response.data.next_page_token || '',
        placeId: response.data.results.map((place) => place.place_id),
      };
    } catch (err) {
      console.error(err.message);
      throw new HttpException(
        'Error fetching nearby places',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get details for a specific place.
   * @param placeId - The place ID.
   * @returns The place details.
   */
  async getPlaceDetails(placeId: string) {
    if (!placeId) {
      throw new HttpException('Place ID is required', HttpStatus.BAD_REQUEST);
    }

    try {
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
      console.error(error.message);
      throw new HttpException(
        'Error fetching place details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get nearby places and plan the visit itinerary based on sentiment analysis.
   * @param nearbySearchDto - The DTO containing search parameters.
   * @returns The planned place visit itinerary.
   */
  async getNearbyPlaces(nearbySearchDto: NearbySearchDto) {
    const { lat, lng, types, date_range, radius = 1500 } = nearbySearchDto;
    const startDate = new Date(date_range[0]);
    const endDate = new Date(date_range[1]);
    const totalDates =
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    const placeList = [];
    const draftPlaceList: { [key: string]: any[] } = {};

    try {
      let localCurrentTime = this.currentTime;
      let localCurrentDate = this.currentDate;
      const nextPageToken: { [key: string]: string } = {};

      while (localCurrentDate <= totalDates) {
        const typePromises = types.map(async (type) => {
          if (localCurrentDate > totalDates) return null;

          if (!draftPlaceList[type]) {
            const { nextPage, placeId } = await this.fetchNearbyPlaces(
              lat,
              lng,
              type,
              radius,
              nextPageToken[type],
            );
            nextPageToken[type] = nextPage;
            const reviewScores =
              await this.fetchPlaceReviewsAndAnalyzeSentiment(placeId);
            draftPlaceList[type] = reviewScores;
          }

          const bestPlace = draftPlaceList[type]?.shift();
          const { fromTime, nextTime, nextDate } = this.getNextTime(
            localCurrentTime,
            localCurrentDate,
            type,
          );
          localCurrentTime = nextTime;
          localCurrentDate = nextDate;

          if (localCurrentDate > totalDates) return null;

          return bestPlace
            ? {
                bestPlace,
                type,
                indexOfDate: nextDate,
                averageTime: this.averageVisitTimes[type],
                fromTime: this.formatTime(fromTime),
                nextTime: this.formatTime(nextTime),
              }
            : null;
        });

        const results = await Promise.all(typePromises);
        placeList.push(...results.filter((result) => result !== null));
      }
      return placeList;
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw new HttpException(
        'Error fetching nearby places',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
