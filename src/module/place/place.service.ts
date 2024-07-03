import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Place } from './entities/place.entity';
import { UserFavoritePlace } from './entities/user-favorite-place.entity';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';

@Injectable()
export class PlaceService {
  constructor(
    @InjectModel(Place)
    private readonly placeModel: typeof Place,
    @InjectModel(UserFavoritePlace)
    private readonly userFavoritePlaceModel: typeof UserFavoritePlace,
  ) { }

  async create(createPlaceDto: CreatePlaceDto) {
    return this.placeModel.create(createPlaceDto);
  }

  async toggleFavoritePlace(placeId: string, userId: number): Promise<{ liked: boolean }> {

    const placeData = await this.placeModel.findOne({
      where: { place_id: placeId }
    })
    if (!placeData) {
      throw new NotFoundException('Place not found');
    }
    const favorite = await this.userFavoritePlaceModel.findOne({
      where: { userId, placeId },
    });

    if (favorite) {
      await favorite.destroy();
      return { liked: false };
    } else {
      await this.userFavoritePlaceModel.create({ userId, placeId });
      return { liked: true };
    }
  }

  async getFavorite(placeId: string, userId: number): Promise<boolean> {
    const favorite = await this.userFavoritePlaceModel.findOne({
      where: { userId, placeId },
    });
    return !!favorite;
  }
  
  findAll() {
    return this.placeModel.findAll();
  }

  findOne(id: number) {
    return this.placeModel.findByPk(id);
  }

  async update(id: number, updatePlaceDto: UpdatePlaceDto) {
    const place = await this.findOne(id);
    if (!place) {
      throw new NotFoundException('Place not found');
    }
    return place.update(updatePlaceDto);
  }

  async remove(id: number) {
    const place = await this.findOne(id);
    if (!place) {
      throw new NotFoundException('Place not found');
    }
    return place.destroy();
  }
}
