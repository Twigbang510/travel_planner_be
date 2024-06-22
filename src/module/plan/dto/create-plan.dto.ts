import { IsNumber, IsString, IsArray, ValidateNested, IsDateString } from 'class-validator';
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
  @IsNumber()
  userId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  startPlaceId: string;

  @IsArray()
  @IsString({ each: true })
  types: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaceWithDetailsDto)
  places: PlaceWithDetailsDto[];
}
