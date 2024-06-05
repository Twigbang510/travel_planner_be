import {
  IsNumber,
  IsString,
  IsOptional,
  ArrayNotEmpty,
  IsDateString,
} from 'class-validator';

export class NearbySearchDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsString()
  placeId: string;

  @IsOptional()
  @IsNumber()
  radius?: number;

  @ArrayNotEmpty()
  types: Array<string>;

  @IsDateString({}, { each: true })
  date_range: Date[];
}
