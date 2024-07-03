import {
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePlaceDto } from '../../place/dto/create-place.dto';

class PlaceDetailDto {
  @IsString()
  type: string;

  @IsNumber()
  indexOfDate: number;

  @IsNumber()
  averageTime: number;

  @IsString()
  fromTime: string;

  @IsString()
  nextTime: string;

  @IsNumber()
  position: number;

  @IsDateString()
  currentDate: string;
}

class PlaceWithDetailsDto {
  @ValidateNested()
  @Type(() => CreatePlaceDto)
  place: CreatePlaceDto;

  @ValidateNested()
  @Type(() => PlaceDetailDto)
  placeDetails: PlaceDetailDto;
}

export class CreatePlanDto {
  userId: number;
  date_range: [string, string];
  startPlaceId: string;
  startLocation: {
    lat: number;
    lng: number;
  };
  types: string[];
  city: string;
  placeList: {
    [key: string]: Array<{
      type: string;
      place_id: string;
      lat: number;
      lng: number;
      score: number;
      visitTime: number;
      position: number;
      fromTime: string;
      nextTime: string;
      currentDate: string;
      details: {
        formatted_address: string;
        geometry: {
          location: {
            lat: number;
            lng: number;
          };
          viewport: {
            northeast: {
              lat: number;
              lng: number;
            };
            southwest: {
              lat: number;
              lng: number;
            };
          };
        };
        name: string;
        photos: string[];
        place_id: string;
        rating?: number;
        user_ratings_total?: number;
        website?: string;
      };
    }>;
  };
}
