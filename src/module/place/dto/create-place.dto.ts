import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

export class CreatePlaceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  formatted_address: string;

  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lng: number;

  @IsNumber()
  @IsNotEmpty()
  viewport_northeast_lat: number;

  @IsNumber()
  @IsNotEmpty()
  viewport_northeast_lng: number;

  @IsNumber()
  @IsNotEmpty()
  viewport_southwest_lat: number;

  @IsNumber()
  @IsNotEmpty()
  viewport_southwest_lng: number;

  @IsString()
  @IsNotEmpty()
  photos: string;

  @IsString()
  @IsNotEmpty()
  place_id: string;

  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @IsInt()
  @IsOptional()
  user_ratings_total: number;

  @IsUrl()
  @IsOptional()
  website: string;
}