import { IsString } from 'class-validator';

export class GetPlaceIdDto {
  @IsString()
  placeId: string;
}
