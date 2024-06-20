import { Controller } from '@nestjs/common';
import { PlaceService } from './places.service';

@Controller('places')
export class PlacesController {
  constructor(private readonly placeService: PlaceService) {}
}
