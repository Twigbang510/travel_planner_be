import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { PlanPlaceDetail } from './entities/plan-detail.entity';
import { Plan } from './entities/plan.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { PlaceModule } from '../place/place.module';
import { ConfigModule } from '../config/config.module';
import { Place } from '../place/entities/place.entity';

@Module({
  imports: [PlaceModule, ConfigModule, SequelizeModule.forFeature([Plan,Place, PlanPlaceDetail])],
  controllers: [PlanController],
  providers: [PlanService],
})
export class PlanModule {}
