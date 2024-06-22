import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Plan } from './entities/plan.entity';
import { Place } from '../place/entities/place.entity';
import { PlanPlaceDetail } from './entities/plan-detail.entity';
import { User } from '../user/entities/user.entity';

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
      const plans = await this.planModel.findAll({
        where: { userId: userId },
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

      if (!plans || plans.length === 0) {
        throw new NotFoundException('Plans not found');
      }

      return plans;
    } catch (error) {
      throw new NotFoundException('Plans not found');
    }
  }

  async getPlansByPk(planId: number): Promise<Plan[]> {
    try {
      const plans = await this.planModel.findAll({
        where: { planId },
        include: [
          {
            model: Place,
            through: {
              attributes: [],
            },
            include: [PlanPlaceDetail],
          },
          {
            model: User,
            attributes: ['id', 'username', 'email'],
          },
        ],
      });

      if (!plans || plans.length === 0) {
        throw new NotFoundException('Plans not found');
      }

      return plans;
    } catch (error) {
      throw new NotFoundException('Plans not found');
    }
  }
  async update(id: number, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.planModel.findByPk(id);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const { userId, startDate, endDate, startPlaceId, types, places } =
      updatePlanDto;
    plan.userId = userId;
    plan.startDate = startDate;
    plan.endDate = endDate;
    plan.startPlaceId = startPlaceId;
    plan.types = types;
    await plan.save();

    // Optionally update places and place details if they are part of the update payload
    if (places) {
      await this.planPlaceDetailModel.destroy({ where: { planId: plan.id } });
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
    }

    return plan;
  }

  async remove(id: number): Promise<void> {
    const plan = await this.planModel.findByPk(id);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    await plan.destroy();
  }
}
