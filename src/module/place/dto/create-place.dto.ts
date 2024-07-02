import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
  IsOptional
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

class ViewportDto {
  @ValidateNested()
  @Type(() => LocationDto)
  northeast: LocationDto;

  @ValidateNested()
  @Type(() => LocationDto)
  southwest: LocationDto;
}

class GeometryDto {
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ValidateNested()
  @Type(() => ViewportDto)
  viewport: ViewportDto;
}

export class CreatePlaceDto {
  @IsString()
  formatted_address: string;

  @ValidateNested()
  @Type(() => GeometryDto)
  geometry: GeometryDto;

  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  photos: string[];

  @IsString()
  place_id: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsNumber()
  user_ratings_total?: number;

  @IsOptional()
  @IsString()
  website?: string;
}
