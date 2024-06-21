import { Injectable } from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Place } from './entities/place.entity';

@Injectable()
export class PlaceService {
  constructor(
    @InjectModel(Place)
    private placeModel: typeof Place,
  ) {}
  create(createPlaceDto: CreatePlaceDto) {
    return this.placeModel.create(createPlaceDto);
  }

  findAll() {
    return `This action returns all place`;
  }

  findOne(id: number) {
    return `This action returns a #${id} place`;
  }

  update(id: number, updatePlaceDto: UpdatePlaceDto) {
    return `This action updates a #${id} place`;
  }

  remove(id: number) {
    return `This action removes a #${id} place`;
  }
}
