import { Module } from '@nestjs/common';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Place } from './entities/place.entity';
import { UserFavoritePlace } from './entities/user-favorite-place.entity';

@Module({
  imports: [SequelizeModule.forFeature([Place,UserFavoritePlace])],
  controllers: [PlaceController],
  providers: [PlaceService],
  exports: [PlaceService],
})
export class PlaceModule {}
