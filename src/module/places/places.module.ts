import { Module } from '@nestjs/common';
import { PlaceService } from './places.service';
import { PlacesController } from './places.controller';
import { ConfigModule } from '../config/config.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Place } from './entities/place.entity';

@Module({
  imports: [ConfigModule, SequelizeModule.forFeature([Place])],
  controllers: [PlacesController],
  providers: [PlaceService],
  exports: [PlaceService],
})
export class PlacesModule {}
