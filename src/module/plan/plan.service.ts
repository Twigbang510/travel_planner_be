import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entities/plan.entity';
import { Place } from '../place/entities/place.entity';
import { PlanPlaceDetail } from './entities/plan-detail.entity';
import { User } from '../user/entities/user.entity';
import { GoogleSheetsService } from '../google-sheet/google-sheet.service';
import { waitForDebugger } from 'inspector';

@Injectable()
export class PlanService {
  constructor(
    @InjectModel(Plan) private readonly planModel: typeof Plan,
    @InjectModel(Place) private readonly placeModel: typeof Place,
    @InjectModel(PlanPlaceDetail)
    private readonly planPlaceDetailModel: typeof PlanPlaceDetail,
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const transaction = await this.planModel.sequelize.transaction();
    try {
      const {
        userId,
        date_range,
        startPlaceId,
        startLocation,
        types,
        city,
        placeList,
      } = createPlanDto;
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }
      const plan = await this.planModel.create(
        {
          userId,
          startDate: date_range[0],
          endDate: date_range[1],
          startPlaceId,
          startLocation,
          types,
          city
        },
        { transaction },
      );

      for (const [date, places] of Object.entries(placeList)) {
        for (const placeWithDetails of places) {
          const placeData = placeWithDetails.details;
          const placeDetailData = {
            type: placeWithDetails.type,
            indexOfDate: placeWithDetails.position,
            averageTime: placeWithDetails.visitTime,
            fromTime: placeWithDetails.fromTime,
            nextTime: placeWithDetails.nextTime,
            position: placeWithDetails.position,
            currentDate: placeWithDetails.currentDate,
          };

          let place = await this.placeModel.findOne({
            where: { place_id: placeData.place_id },
            transaction,
          });
          if (!place) {
            place = await this.placeModel.create(placeData, { transaction });
          }

          await this.planPlaceDetailModel.create(
            {
              ...placeDetailData,
              placeId: place.id,
              planId: plan.id,
            },
            { transaction },
          );
        }
      }

      await transaction.commit();
      return plan;
    } catch (error) {
      await transaction.rollback();
      console.error('Error when creating Plan', error);
      throw new Error('Could not create Plan. Please try again later.');
    }
  }

  async getPlansByUserId(userId: number): Promise<Plan[]> {
    try {
      const users = await this.userModel.findByPk(userId);
      if (!users) {
        throw new NotFoundException('User not found');
      }
      const plans = await this.planModel.findAll({
        where: { userId: userId },
        include: [
          {
            model: PlanPlaceDetail,
            include: [Place],
          },
        ],
      });

      if (!plans || plans.length === 0) {
        throw new NotFoundException('Plans not found');
      }

      return plans;
    } catch (error) {
      console.error('Error when fetching Plans by userId', error);
      throw new NotFoundException(
        'Could not fetch Plans. Please try again later.',
      );
    }
  }

  async getPlanById(planId: number): Promise<any> {
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

      const planDetails = plan.planPlaceDetails.reduce((acc, detail) => {
        const date = new Date(detail.currentDate).toISOString();
        if (!acc[date]) {
          acc[date] = [];
        }

        acc[date].push({
          type: detail.type,
          place_id: detail.place.place_id,
          lat: detail.place.geometry.location.lat,
          lng: detail.place.geometry.location.lng,
          score: detail.place.rating || 0,
          visitTime: detail.averageTime,
          position: detail.indexOfDate,
          fromTime: detail.fromTime,
          nextTime: detail.nextTime,
          currentDate: detail.currentDate,
          details: {
            formatted_address: detail.place.formatted_address,
            geometry: detail.place.geometry,
            name: detail.place.name,
            photos: detail.place.photos,
            place_id: detail.place.place_id,
            rating: detail.place.rating,
            user_ratings_total: detail.place.user_ratings_total,
            website: detail.place.website,
          },
        });

        return acc;
      }, {});

      const result = {
        userId: plan.userId,
        date_range: [plan.startDate, plan.endDate],
        startPlaceId: plan.startPlaceId,
        startLocation: plan.startLocation,
        types: plan.types,
        city: plan.city,
        placeList: planDetails,
      };

      return result;
    } catch (error) {
      console.error('Error when fetching Plan by id', error);
      throw new NotFoundException(
        'Could not fetch Plan. Please try again later.',
      );
    }
  }

  public async exportPlan(planId: number): Promise<void> {
    try {
      const plan = await this.planModel.findOne({
        where: { id: planId },
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

      const sheetDetail = this.googleSheetsService.createSpreadsheet(
        'Plan',
        plan,
      );
      if (sheetDetail) return sheetDetail;
    } catch (error) {
      console.error(
        'Error exporting plans by planId and email to Google Sheets:',
        error,
      );
      throw new Error(
        'Could not export plans to Google Sheets. Please try again later.',
      );
    }
  }

  async update(id: number, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    const transaction = await this.planModel.sequelize.transaction();
    try {
      const { userId, date_range, startPlaceId, types, placeList } =
        updatePlanDto;

      // Check if user exists
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const plan = await this.planModel.findByPk(id, { transaction });
      if (!plan) {
        throw new NotFoundException('Plan not found');
      }
      plan.userId = userId;
      plan.startDate = date_range[0];
      plan.endDate = date_range[1];
      plan.startPlaceId = startPlaceId;
      plan.types = types;
      await plan.save({ transaction });

      // Update places and place details
      if (placeList) {
        await this.planPlaceDetailModel.destroy({
          where: { planId: plan.id },
          transaction,
        });

        for (const [date, places] of Object.entries(placeList)) {
          for (const placeWithDetails of places) {
            const placeData = placeWithDetails.details;
            const placeDetailData = {
              type: placeWithDetails.type,
              indexOfDate: placeWithDetails.position,
              averageTime: placeWithDetails.visitTime,
              fromTime: placeWithDetails.fromTime,
              nextTime: placeWithDetails.nextTime,
              position: placeWithDetails.position,
              currentDate: placeWithDetails.currentDate,
            };

            let place = await this.placeModel.findOne({
              where: { place_id: placeData.place_id },
              transaction,
            });
            if (!place) {
              place = await this.placeModel.create(placeData, { transaction });
            }

            await this.planPlaceDetailModel.create(
              {
                ...placeDetailData,
                placeId: place.id,
                planId: plan.id,
              },
              { transaction },
            );
          }
        }
      }

      await transaction.commit();
      return plan;
    } catch (error) {
      await transaction.rollback();
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
