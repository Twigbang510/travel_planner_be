import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entities/plan.entity';
import { Place } from '../place/entities/place.entity';
import { PlanPlaceDetail } from './entities/plan-detail.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PlanService {
  constructor(
    @InjectModel(Plan) private readonly planModel: typeof Plan,
    @InjectModel(Place) private readonly placeModel: typeof Place,
    @InjectModel(PlanPlaceDetail) private readonly planPlaceDetailModel: typeof PlanPlaceDetail,
  ) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    try {
      const { userId, startDate, endDate, startPlaceId, types, places } = createPlanDto;

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
      console.error('Error when creating Plan', error);
      throw new Error('Could not create Plan. Please try again later.');
    }
  }

  async getPlansByUserId(userId: number): Promise<Plan[]> {
    try {
      const plans = await this.planModel.findAll({
        where: { userId: userId },
        include: [{
          model: PlanPlaceDetail,
          include: [Place]
        }],
      });

      if (!plans || plans.length === 0) {
        throw new NotFoundException('Plans not found');
      }

      return plans;
    } catch (error) {
      console.error('Error when fetching Plans by userId', error);
      throw new NotFoundException('Could not fetch Plans. Please try again later.');
    }
  }

  async getPlanById(planId: number): Promise<Plan> {
    try {
      const plan = await this.planModel.findByPk(planId, {
        include: [
          {
            model: PlanPlaceDetail,
            include: [Place],
          },
        ],
      });

      if (!plan) {
        throw new NotFoundException('Plan not found');
      }

      return plan;
    } catch (error) {
      console.error('Error when fetching Plan by id', error);
      throw new NotFoundException('Could not fetch Plan. Please try again later.');
    }
  }

  async update(id: number, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    try {
      const plan = await this.planModel.findByPk(id);
      if (!plan) {
        throw new NotFoundException('Plan not found');
      }

      const { userId, startDate, endDate, startPlaceId, types, places } = updatePlanDto;
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
    } catch (error) {
      console.error('Error when updating Plan', error);
      throw new Error('Could not update Plan. Please try again later.');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const plan = await this.planModel.findByPk(id);
      if (!plan) {
        throw new NotFoundException('Plan not found');
      }
      await plan.destroy();
    } catch (error) {
      console.error('Error when deleting Plan', error);
      throw new Error('Could not delete Plan. Please try again later.');
    }
  }
}
