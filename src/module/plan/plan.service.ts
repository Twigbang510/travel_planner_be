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
    @InjectModel(PlanPlaceDetail)
    private readonly planPlaceDetailModel: typeof PlanPlaceDetail,
  ) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    try {
      const { userId, startDate, endDate, startPlaceId, types, places } =
        createPlanDto;

      const plan = await this.planModel.create({
        userId,
        startDate,
        endDate,
        startPlaceId,
        types,
      });

      for (const placeWithDetails of places) {
        const placeData = placeWithDetails.place;
        const placeDetailData = placeWithDetails.placeDetails;

        let place = await this.placeModel.findOne({
          where: { place_id: placeData.place_id },
        });
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
    } catch (error) {
      console.error('Error when create Plan', error);
      throw new Error(error.message);
    }
  }

  async getPlansByUserId(userId: number): Promise<Plan[]> {
    try {
      const plan = await this.planModel.findAll({
        where: { userId },
        include: [
          {
            model: Place,
            through: {
              attributes: [],
            },
            include: [PlanPlaceDetail],
          },
        ],
      });
      return plan;
    } catch (error) {
      console.error('Error when get Plan', error);
      throw new Error(error.message);
    }
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
