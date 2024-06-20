import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Place } from './entities/place.entity';

@Injectable()
export class PlaceService {
  constructor(
    @InjectModel(Place)
    private placeModel: typeof Place,
  ) {}

  async createPlace(place: any): Promise<Place> {
    return this.placeModel.create(place);
  }

  async findAll(): Promise<Place[]> {
    return this.placeModel.findAll();
  }

  async findOne(id: string): Promise<Place> {
    return this.placeModel.findOne({
      where: {
        id,
      },
    });
  }
}
