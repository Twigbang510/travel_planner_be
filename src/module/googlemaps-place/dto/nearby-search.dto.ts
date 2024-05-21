import { IsNumber, IsString, IsOptional } from 'class-validator';

export class NearbySearchDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  radius?: number;
}
