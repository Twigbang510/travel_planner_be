// create-plan.dto.ts
import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsNumber,
  ValidateNested,
  ArrayNotEmpty,
  IsArray,
  IsUrl
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePlaceDto } from 'src/module/place/dto/create-place.dto';

export class CreatePlaceDetailDto {
  @IsInt()
  @IsNotEmpty()
  placeId: number;

  @IsInt()
  @IsNotEmpty()
  indexOfDate: number;

  @IsInt()
  @IsNotEmpty()
  averageTime: number;

  @IsString()
  @IsNotEmpty()
  fromTime: string;

  @IsString()
  @IsNotEmpty()
  nextTime: string;

  @IsInt()
  @IsNotEmpty()
  position: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  currentDate: Date;
}

export class CreatePlanDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PlaceWithDetailsDto)
  places: PlaceWithDetailsDto[];
}

export class PlaceWithDetailsDto {
  @ValidateNested()
  @Type(() => CreatePlaceDto)
  place: CreatePlaceDto;

  @ValidateNested()
  @Type(() => CreatePlaceDetailDto)
  placeDetails: CreatePlaceDetailDto;
}
