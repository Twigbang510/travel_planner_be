import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Client, TravelMode } from '@googlemaps/google-maps-services-js';
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
  private DANANG_BOUNDING_BOX = {
    north: 16.154564,
    south: 15.975568,
    east: 108.276413,
    west: 107.985724,
  };
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
  private readonly placeTypes = {
    outdoor: ['zoo', 'aquarium', 'cafe', 'bowling_alley'],
    art: ['art_gallery', 'painter'],
    park: ['amusement_park', 'park'],
    shopping: ['convenience_store', 'shopping_mall'],
    historical: ['church', 'hindu_temple', 'museum'],
    nightlife: ['bar', 'night_club', 'casino'],
    food: ['restaurant', 'cafe', 'bakery', 'food'],
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
  private async getNextTime(
    currentTime: number,
    localCurrentDate: number,
    type: string,
    totalDates: number,
    previousPlaceId: string | null,
    bestPlace: { place_id: string },
    firstTime: boolean,
    currentDate: Date,
  ): Promise<{
    fromTime: number;
    nextTime: number;
    nextDate: number;
    travelTime: number;
    previousPlaceId: string | null;
    firstTime: boolean;
    currentDate: Date;
  }> {
    const averageTime = this.averageVisitTimes[type] || 0;
    let fromTime = currentTime;
    let nextTime = currentTime + averageTime * 60000;
    let travelTime = 0;

    // If next time exceeds the end time, move to the next day and reset the time.
    if (nextTime > this.endTime) {
      localCurrentDate += 1;
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
      fromTime = new Date().setHours(6, 0, 0, 0);
      nextTime = fromTime + averageTime * 60000;
    }

    // Calculate travel time and update previousPlaceId and firstTime if localCurrentDate is within totalDates
    if (localCurrentDate <= totalDates) {
      travelTime = previousPlaceId
        ? (await this.calculateTravelTime(
            previousPlaceId,
            bestPlace.place_id,
          )) / 60
        : 0;
      previousPlaceId = bestPlace.place_id;
      firstTime = false;
    }

    return {
      fromTime,
      nextTime,
      nextDate: localCurrentDate,
      travelTime,
      previousPlaceId,
      firstTime,
      currentDate,
    };
  }
  /**
   * Get the place with the highest sentiment score from the results.
   * @param draftPlaceList - List of locations of each type.
   * @param type - The type of the location
   * @param firstTime - Boolean data type, checks whether it has moved to a new date or not
   * @param startPlaceId - ID of the starting location
   * @param previousPlaceId - ID of the best location found previously
   * @returns The place with the highest score or null if no results.
   */
  private async getBestPlace(
    draftPlaceList: { [key: string]: any[] },
    type: string,
    firstTime: boolean,
    startPlaceId: string,
    previousPlaceId: string | null,
  ): Promise<any> {
    const bestPlace = await draftPlaceList[type].reduce(
      async (bestPromise, current) => {
        const best = await bestPromise;
        const currentTravelTime = await this.calculateTravelTime(
          firstTime ? startPlaceId : previousPlaceId,
          current.place_id,
        );
        if (!best || currentTravelTime < best.travelTime) {
          current.travelTime = currentTravelTime;
          return current;
        }
        return best;
      },
      Promise.resolve(null),
    );

    if (bestPlace) {
      draftPlaceList[type] = draftPlaceList[type].filter(
        (place) => place.place_id !== bestPlace.place_id,
      );
    }
    return bestPlace;
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
  ): Promise<{
    nextPage: string;
    places: { place_id: string; location: { lat: number; lng: number } }[];
  }> {
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
      await sleep(500); // Sleep to avoid exceeding API rate limits
      const response = await this.googleMapsClient.placesNearby({ params });
      const filteredPlaces = response.data.results.filter((place) => {
        const placeLat = place.geometry.location.lat;
        const placeLng = place.geometry.location.lng;
        return (
          placeLat <= this.DANANG_BOUNDING_BOX.north &&
          placeLat >= this.DANANG_BOUNDING_BOX.south &&
          placeLng <= this.DANANG_BOUNDING_BOX.east &&
          placeLng >= this.DANANG_BOUNDING_BOX.west
        );
      });
      return {
        nextPage: response.data.next_page_token || '',
        places: filteredPlaces.map((place) => ({
          place_id: place.place_id,
          location: place.geometry.location,
        })),
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
   * Get details for a specific place.
   * @param originPlaceId - The previous place ID.
   * @param destinationPlaceId - The destination place ID.
   * @returns time in milliseconds from the previous place to the destination place.
   */
  private async calculateTravelTime(
    originPlaceId: string,
    destinationPlaceId: string,
  ): Promise<number> {
    try {
      const response = await this.googleMapsClient.distancematrix({
        params: {
          origins: [`place_id:${originPlaceId}`],
          destinations: [`place_id:${destinationPlaceId}`],
          key: this.configService.googleMapsKey,
          mode: TravelMode.driving,
        },
      });
      const travelTimeInSeconds =
        response.data.rows[0].elements[0].duration.value;
      return travelTimeInSeconds;
    } catch (err) {
      console.error(err.message);
      throw new HttpException(
        'Error calculating travel time',
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
    const {
      lat,
      lng,
      types,
      date_range,
      radius = 1500,
      placeId: startPlaceId,
    } = nearbySearchDto;
    const startDate = new Date(date_range[0]);
    const endDate = new Date(date_range[1]);
    const totalDates =
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    const placeList = [];
    const draftPlaceList: { [key: string]: any[] } = {};
    try {
      let localCurrentTime = this.currentTime;
      let localCurrentDate = 0;
      let previousDate = 1;
      const nextPageToken: { [key: string]: string } = {};
      let previousPlaceId: string | null = null;
      let travelTime = 0;
      let firstTime = true;
      let position = 0;
      let currentDate = new Date(startDate);
      const positions = {};
      types.forEach(key => {
        positions[key] = 0;
      });
      while (localCurrentDate <= totalDates) {
        const typePromises: Promise<any>[] = [];
        for (const key of types) {
          if (localCurrentDate > totalDates) break; 
          const array = this.placeTypes[key];
          const pos = positions[key];
          const type = array[pos];
          positions[key] = (pos + 1) % array.length;
          if (localCurrentDate !== previousDate) {
            travelTime = 0;
            firstTime = true;
            previousDate = localCurrentDate;
            position = 0;
          }
          if (travelTime) localCurrentTime += travelTime * 60000;
          if (!draftPlaceList[type]) {
            const { nextPage, places } = await this.fetchNearbyPlaces(
              lat,
              lng,
              type,
              radius,
              nextPageToken[type],
            );
            nextPageToken[type] = nextPage;
            const placeIds = places.map((place) => place.place_id);
            const reviewScores = await this.fetchPlaceReviewsAndAnalyzeSentiment(placeIds);
            draftPlaceList[type] = reviewScores.map((score, index) => ({
              ...score,
              location: places[index].location,
            }));
          }
          const bestPlace = await this.getBestPlace(
            draftPlaceList,
            type,
            firstTime,
            startPlaceId,
            previousPlaceId,
          );
          if (bestPlace) {
            draftPlaceList[type] = draftPlaceList[type].filter(
              (place) => place.place_id !== bestPlace.place_id,
            );
            const {
              fromTime,
              nextTime,
              nextDate,
              travelTime: newTravelTime,
              previousPlaceId: newPreviousPlaceId,
              firstTime: newFirstTime,
              currentDate: newCurrentDate,
            } = await this.getNextTime(
              localCurrentTime,
              localCurrentDate,
              type,
              totalDates,
              previousPlaceId,
              bestPlace,
              firstTime,
              currentDate,
            );
            localCurrentTime = nextTime;
            localCurrentDate = nextDate;
            travelTime = newTravelTime;
            previousPlaceId = newPreviousPlaceId;
            firstTime = newFirstTime;
            position += 1;
            currentDate = newCurrentDate;
            typePromises.push(
              new Promise((resolve,reject) => {
                resolve({
                  bestPlace,
                  type,
                  indexOfDate: localCurrentDate,
                  averageTime: this.averageVisitTimes[type],
                  fromTime: this.formatTime(fromTime),
                  nextTime: this.formatTime(nextTime),
                  position: position,
                  currentDate: newCurrentDate,
                })
              })
            );
          }
        }
        const results = await Promise.all(typePromises);
        placeList.push(...results);
      }

      return placeList;
    } catch (error) {
      console.error(error.message);
      throw new HttpException(
        'Error fetching places',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
