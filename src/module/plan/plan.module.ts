import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { PlanPlaceDetail } from './entities/plan-detail.entity';
import { Plan } from './entities/plan.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([Plan, PlanPlaceDetail])],
  controllers: [PlanController],
  providers: [PlanService],
})
export class PlanModule {}
