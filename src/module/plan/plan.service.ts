import { Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Plan } from './entities/plan.entity';
import { Place } from '../place/entities/place.entity';
import { PlanPlaceDetail } from './entities/plan-detail.entity';

@Injectable()
export class PlanService {
  constructor(
    @InjectModel(Plan) private readonly planModel: typeof Plan,
    @InjectModel(Place) private readonly placeModel: typeof Place,
    @InjectModel(PlanPlaceDetail) private readonly planPlaceDetailModel: typeof PlanPlaceDetail,
  ) {}
  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const { userId, startDate, endDate, places } = createPlanDto;

    const plan = await this.planModel.create({
      userId,
      startDate,
      endDate,
    });

    for (const placeWithDetails of places) {
      const placeData = placeWithDetails.place;
      const placeDetailData = placeWithDetails.placeDetails;

      let place = await this.placeModel.findOne({ where: { place_id: placeData.place_id } });
      if (!place) {
        place = await this.placeModel.create(placeData);
      }

      await this.planPlaceDetailModel.create({
        ...placeDetailData,
        placeId: place.id,
        planId: plan.id,
      });
    }

    return plan;
  }

  findAll() {
    return `This action returns all plan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} plan`;
  }

  update(id: number, updatePlanDto: UpdatePlanDto) {
    return `This action updates a #${id} plan`;
  }

  remove(id: number) {
    return `This action removes a #${id} plan`;
  }
}
