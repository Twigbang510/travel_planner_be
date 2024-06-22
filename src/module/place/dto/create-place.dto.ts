import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
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

class PhotoDto {
  @IsNumber()
  height: number;

  @IsArray()
  @IsString({ each: true })
  html_attributions: string[];

  @IsString()
  photo_reference: string;

  @IsNumber()
  width: number;
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
  @ValidateNested({ each: true })
  @Type(() => PhotoDto)
  photos: PhotoDto[];

  @IsString()
  place_id: string;

  @IsNumber()
  rating: number;

  @IsNumber()
  user_ratings_total: number;

  @IsString()
  website: string;
}
