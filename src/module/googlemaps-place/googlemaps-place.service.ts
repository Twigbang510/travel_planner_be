import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  Client,
  PlaceAutocompleteType,
  TravelMode,
} from '@googlemaps/google-maps-services-js';
import { AppConfigService } from '../config/app-config.service';
import { NearbySearchDto } from './dto/nearby-search.dto';
import { SentimentResult } from './interface/sentiment-result.interface';
import { sleep } from 'src/utils/helpers';
import { PlaceService } from '../place/place.service';

@Injectable()
export class GooglemapsPlaceService {
  private googleMapsClient: Client;
  private language = require('@google-cloud/language');
  private client = new this.language.LanguageServiceClient();
  private startTime = new Date().setHours(6, 0, 0, 0);
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
  private sentimentAnalysis: any;

  private readonly placeTypes = {
    outdoor: ['zoo', 'aquarium', 'cafe', 'bowling_alley'],
    art: ['art_gallery'],
    park: ['amusement_park', 'park'],
    shopping: ['convenience_store', 'shopping_mall'],
    historical: ['church', 'hindu_temple', 'museum'],
    nightlife: ['bar', 'night_club', 'casino'],
    food: ['restaurant', 'cafe', 'bakery', 'food'],
  };
  constructor(
    private configService: AppConfigService,
    private placeService: PlaceService
  ) {
    this.googleMapsClient = new Client({});
    this.initializeSentimentAnalysis();
  }

  private async initializeSentimentAnalysis() {
    const TransformersApi = Function('return import("@xenova/transformers")')();
    const { pipeline } = await TransformersApi;
    this.sentimentAnalysis = await pipeline('sentiment-analysis','Xenova/bert-base-multilingual-uncased-sentiment');
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
   * Group the place list by date.
   * @param placeList - The list of places to be grouped.
   * @returns An object with dates as keys and arrays of places as values.
   */
  private groupByDate(placeList: any[]): any {
    return placeList.reduce((acc, place) => {
      const date = place.currentDate.toISOString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(place);
      return acc;
    }, {});
  }

  /**
   * Fetches autocomplete results for a given city input.
   * @param input - The city name input.
   * @returns A promise that resolves to an array of autocomplete results.
   * @throws HttpException if there is an error fetching the autocomplete results.
   */
  async getCityAutocomplete(input: string) {
    try {
      const response = await this.googleMapsClient.placeAutocomplete({
        params: {
          input,
          types: PlaceAutocompleteType.cities,
          key: this.configService.googleMapsKey,
        },
      });

      return response.data.predictions.map((prediction) => ({
        description: prediction.description,
        place_id: prediction.place_id,
      }));
    } catch (error) {
      console.error(error.message);
      throw new HttpException(
        'Error fetching autocomplete results',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetches hotels near a given city.
   *
   * @param placeId - The place ID of the city.
   * @returns A promise that resolves to an array of hotel details.
   * @throws HttpException if there is an error fetching the hotels.
   */
  async findHotelsByCity(placeId: string) {
    try {
      const placeDetails = await this.getPlaceDetails(placeId);
      const { lat, lng } = placeDetails.geometry.location;

      const response = await this.googleMapsClient.placesNearby({
        params: {
          location: { lat, lng },
          radius: 15000,
          type: 'lodging',
          key: this.configService.googleMapsKey,
        },
      });
      const placeIds = response.data.results.map((place) => place.place_id);

      const reviewScores =
        await this.fetchPlaceReviewsAndAnalyzeSentiment(placeIds);
      const hotelsList = [];
      await Promise.all(
        reviewScores.map(async (place) => {
          const hotelDetail = await this.getPlaceDetails(place.place_id);
          hotelsList.push(hotelDetail);
        }),
      );

      return hotelsList;
    } catch (error) {
      console.error(error.message);
      throw new HttpException(
        'Error fetching hotels',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Calculate the next time and date based on the current time and average visit time for a place type.
   *
   * @param currentTime - The current time in milliseconds.
   * @param localCurrentDate - The current date as a number.
   * @param type - The place type.
   * @param totalDates - The total number of dates in the range.
   * @param previousPlaceId - The ID of the previous place.
   * @param bestPlace - The best place found so far.
   * @param firstTime - A boolean indicating if it's the first time on a new date.
   * @param currentDate - The current date.
   *
   * @returns An object containing the next time, next date, travel time, previous place ID, first time flag, and current date.
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
    draftPlaceList: any[],
    type: string,
    firstTime: boolean,
    startPlaceId: string,
    previousPlaceId: string | null,
  ): Promise<any> {
    let bestPlace = null;
    let minTravelTime = Infinity;

    for (const current of draftPlaceList) {
      const currentTravelTime = await this.calculateTravelTime(
        firstTime ? startPlaceId : previousPlaceId,
        current.place_id,
      );

      if (!bestPlace || currentTravelTime < minTravelTime) {
        minTravelTime = currentTravelTime;
        bestPlace = current;
      }
    }

    if (bestPlace) {
      draftPlaceList.splice(draftPlaceList.indexOf(bestPlace), 1);
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
   * Analyzes the sentiment of the reviews for a specific place.
   *
   * @param reviews - The reviews of a place. It contains the place ID and the reviews.
   * @returns A promise that resolves to a sentiment result. The result contains the place ID and the sentiment score.
   * @throws An error if the sentiment analysis fails.
   */
  private async analyzeSentiment(reviews: {
    place_id: string;
    reviews: { text: string }[];
}): Promise<any> {
    console.log(reviews.reviews);
    let totalStars = 0;
    let totalCount = 0;

    for (const review of reviews.reviews) {
        const result = await this.sentimentAnalysis(review.text);
        console.log(result);
        if (result.length > 0) {
            const sentimentScore = result[0].score;
            const sentimentLabel = result[0].label;

            // Extract the numeric rating from the sentiment label
            const match = sentimentLabel.match(/(\d) stars/);
            if (match) {
                const stars = parseInt(match[1], 10);
                totalStars += stars;
                totalCount += 1;
            }
        }
    }

    const averageStars = totalStars / totalCount;
    return {
        place_id: reviews.place_id,
        averageStars: averageStars,
        totalReviews: totalCount,
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
    if (placeReviews.length === 0) {
      return []; // Trả về mảng trống nếu không có đánh giá nào
    }
    const scores = await Promise.all(
      filteredReviews.map((reviews) => this.analyzeSentiment(reviews)),
    );

    // Sort scores in descending order
    const sortedScores = scores.sort((a, b) => b.score - a.score);
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
    places: {
      place_id: string;
    }[];
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
      const places = response.data.results.map((place) => ({
        place_id: place.place_id,
        place_location: place.geometry.location,
      }));
      return {
        nextPage: response.data.next_page_token || '',
        places: places,
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
            'formatted_address',
            'name',
            'rating',
            'place_id',
            'photos',
            'geometry',
            'rating',
            'price_level',
            'user_ratings_total',
            'website',
          ],
        },
      });
      const placeDetails = response.data.result;
      if (placeDetails.photos) {
        const htmlAttributions = placeDetails.photos.map((photo: any) => {
          return photo.html_attributions[0].match(/href="(.*?)"/)[1];
        });
        placeDetails.photos = htmlAttributions;
      } else {
        placeDetails.photos = []; // Khởi tạo mảng trống nếu không có photos
      }

      return placeDetails;
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
    startPlaceId: string,
    destinationPlaceId: string,
  ): Promise<number> {
    try {
      const { data } = await this.googleMapsClient.directions({
        params: {
          origin: `place_id:${startPlaceId}`,
          destination: `place_id:${destinationPlaceId}`,
          mode: TravelMode.driving,
          key: this.configService.googleMapsKey,
        },
      });
      if (data.routes.length) {
        const travelTime = data.routes[0].legs[0].duration.value;
        return travelTime;
      }
      return 0;
    } catch (error) {
      throw new HttpException(
        'Failed to calculate travel time',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get nearby places and plan the visit itinerary based on sentiment analysis.
   * @param nearbySearchDto - The DTO containing search parameters.
   * @returns The planned place visit itinerary.
   */
  async getPlan(nearbySearchDto: NearbySearchDto, userID: string) {
    const {
      lat,
      lng,
      types,
      date_range,
      radius = 15000,
      placeId: startPlaceId,
    } = nearbySearchDto;
    const startLocation = {
      lat: lat,
      lng: lng,
    };
    const startDate = new Date(date_range[0]);
    const endDate = new Date(date_range[1]);
    const totalDates =
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

    const placeList = [];
    const draftPlaceList: { [key: string]: any[] } = {};
    try {
      let localCurrentTime = this.startTime;
      let localCurrentDate = 0;
      let previousDate = 1;
      const nextPageToken: { [key: string]: string } = {};
      let previousPlaceId: string | null = null;
      let travelTime = 0;
      let firstTime = true;
      let position = 0;
      let currentDate = new Date(startDate);
      const positions = {};
      types.forEach((key) => {
        positions[key] = 0;
      });

      while (localCurrentDate <= totalDates) {
        const fetchPromises = types.map(async (key) => {
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
            const reviewScores =
              await this.fetchPlaceReviewsAndAnalyzeSentiment(placeIds);

            draftPlaceList[type] = reviewScores.map((score, index) => ({
              ...places[index],
            }));
          }

          const bestPlace = await this.getBestPlace(
            draftPlaceList[type],
            type,
            firstTime,
            startPlaceId,
            previousPlaceId,
          );
          if (bestPlace) {
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

            if (nextDate <= totalDates) {
              placeList.push({
                placeId: bestPlace.place_id,
                type,
                indexOfDate: localCurrentDate,
                averageTime: this.averageVisitTimes[type],
                fromTime: this.formatTime(fromTime),
                nextTime: this.formatTime(nextTime),
                position: position,
                currentDate: newCurrentDate,
              });
            } else {
              return;
            }
          }
        });

        await Promise.all(fetchPromises);
      }

      const detailedPlaceList = await Promise.all(
        placeList.map(async (place) => {
          const details = await this.getPlaceDetails(place.placeId);
          return {
            ...place,
            details,
          };
        }),
      );
      const groupedPlaces = this.groupByDate(detailedPlaceList);

      return {
        userID: userID,
        date_range,
        startPlaceId: startPlaceId,
        startLocation: startLocation,
        types: types,
        placeList: groupedPlaces,
      };
    } catch (error) {
      console.error(error.message);
      throw new HttpException(
        'Error fetching places',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getItinerary(nearbySearchDto: NearbySearchDto, userID: string) {
    try {
      const {
        lat,
        lng,
        types,
        date_range,
        radius = 15000,
        placeId: startPlaceId,
      } = nearbySearchDto;

      const draftPlaceList: { [key: string]: any[] } = {};
      const startDate = new Date(date_range[0]);
      const endDate = new Date(date_range[1]);
      const totalDates =
        (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
      const timeLimitperDay = (20 - 6) * 60;
      const nextPageToken: { [key: string]: string } = {};
      const placesPromises: Promise<void>[] = [];

      for (const key of types) {
        const array = this.placeTypes[key];
        for (const type of array) {
          if (!draftPlaceList[type]) {
            try {
              draftPlaceList[type] = [];
              const { nextPage, places } = await this.fetchNearbyPlaces(
                lat,
                lng,
                type,
                radius,
                nextPageToken[type],
              );
              nextPageToken[type] = nextPage;

              const placeIds = places.map((place) => place.place_id);
              const reviewScores =
                await this.fetchPlaceReviewsAndAnalyzeSentiment(placeIds);
              draftPlaceList[type] = reviewScores.map((score, index) => ({
                ...places[index],
                reviewScore: score,
              }));
            } catch (error) {
              console.error(
                `Error fetching or processing places for type '${type}':`,
                error,
              );
            }
          }
        }
      }

      const startPlace = {
        place_id: startPlaceId,
        lat: lat,
        lng: lng,
        visitTime: 0,
      };

      await Promise.all(placesPromises);

      const optimalPaths = await this.findOptimalPathsForDays(
        draftPlaceList,
        startPlace,
        totalDates,
        timeLimitperDay,
        startDate,
      );

      const detailedOptimalPaths = await Object.keys(optimalPaths).reduce(
        async (accPromise, key) => {
          const acc = await accPromise;
          const detailedPlaces = await Promise.all(
            optimalPaths[key].map(async (place) => {
              const details = await this.getPlaceDetails(place.place_id);
              const liked = await this.placeService.getFavorite(
                place.place_id,
                +userID,
              );
              return {
                ...place,
                details,
                liked
              };
            }),
          );
          acc[key] = detailedPlaces;
          return acc;
        },
        Promise.resolve({}),
      );

      const planDetail = {
        userID: userID,
        date_range,
        startPlaceId: startPlaceId,
        startLocation: {
          lat: lat,
          lng: lng,
        },
        types: types,
        placeList: detailedOptimalPaths,
      };

      return planDetail;
    } catch (error) {
      console.error('Error when get Itinerary ', error);
      throw new HttpException(
        'Error when get itinerary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOptimalPathsForDays(
    places,
    startPlace,
    numDays,
    timeLimitperDay,
    startDate,
  ) {
    try {
      const optimalPaths = {};
      let currentDate = new Date(startDate);
      for (let i = 0; i <= numDays; i++) {
        const availablePlaces = Object.keys(places).reduce((acc, key) => {
          if (places[key].length > 0) {
            acc[key] = places[key];
          }
          return acc;
        }, {});

        if (Object.keys(availablePlaces).length === 0) {
          break;
        }
        const optimalPath = await this.nearestNeighborTSPForDay(
          availablePlaces,
          startPlace,
          timeLimitperDay,
          currentDate,
        );
        optimalPaths[currentDate.toISOString()] = optimalPath;

        optimalPath.forEach((node) => {
          if (node.type !== 'start') {
            places[node.type] = places[node.type].filter(
              (place) => place.place_id !== node.place_id,
            );
          }
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return optimalPaths;
    } catch (err) {
      console.error('Error while findOptimalPathsForDays' + err.message);
      throw new HttpException(
        'Error fetching places',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async nearestNeighborTSPForDay(
    places,
    startPlace,
    timeLimitperDay,
    currentDate,
  ) {
    const types = Object.keys(places);
    const nodes = {};

    types.forEach((type) => {
      nodes[type] = places[type].map((place) => ({
        type: type,
        place_id: place.place_id,
        lat: place.place_location.lat,
        lng: place.place_location.lng,
        score: place.reviewScore.score,
        visitTime: this.averageVisitTimes[type],
      }));
    });

    const path = [];
    let current = { ...startPlace, type: 'start' };
    let currentTime = 0;
    let dayOrder = 0;
    let lastVisitedType = null;

    while (currentTime < timeLimitperDay) {
      if (current.type !== 'start') {
        const startTime = await this.convertMinutesToTime(currentTime);
        const endTime = await this.convertMinutesToTime(
          currentTime + current.visitTime,
        );

        path.push({
          ...current,
          fromTime: startTime,
          nextTime: endTime,
          position: dayOrder,
          currentDate: currentDate.toISOString(),
        });
        currentTime += current.visitTime;
      }

      let nearest = null;
      let minTravelTime = Number.MAX_SAFE_INTEGER;
      let nextTypes = types.filter((type) => type !== lastVisitedType);

      if (nextTypes.length === 0) {
        nextTypes = types.filter((type) => type !== lastVisitedType);
      }

      for (const type of nextTypes) {
        for (let i = 0; i < nodes[type].length; i++) {
          const nextNode = nodes[type][i];
          if (nextNode && nextNode !== current) {
            const travel = await this.travelTime(current, nextNode);
            if (currentTime + travel + nextNode.visitTime <= timeLimitperDay) {
              if (travel < minTravelTime) {
                minTravelTime = travel;
                nearest = nextNode;
                lastVisitedType = type;
              }
            }
          }
        }
      }

      if (nearest === null) {
        break;
      }

      current = { ...nearest, position: dayOrder };
      currentTime += minTravelTime;
      nodes[nearest.type] = nodes[nearest.type].filter(
        (node) => node.place_id !== nearest.place_id,
      );
      dayOrder++;
    }

    return path;
  }

  // async travelTime(point1, point2) {
  //   const dist = Math.sqrt(
  //     Math.pow(point1.lat - point2.lat, 2) +
  //       Math.pow(point1.lng - point2.lng, 2),
  //   );
  //   return dist * 10;
  // }
  async travelTime(point1, point2) {
    const R = 6371;
  
    const lat1 = point1.lat;
    const lng1 = point1.lng;
    const lat2 = point2.lat;
    const lng2 = point2.lng;
  
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = R * c; 
  
    const averageSpeed = 50; 
    const travelTime = (distance / averageSpeed) * 60; 
  
    return travelTime;
  }
  private deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
  async convertMinutesToTime(minutes) {
    const hours = Math.floor(minutes / 60) + 6;
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes - Math.floor(minutes)) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
