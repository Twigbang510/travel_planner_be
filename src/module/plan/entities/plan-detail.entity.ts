import {
  Column,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Plan } from './plan.entity';
import { Place } from '../../place/entities/place.entity';

@Table
export class PlanPlaceDetail extends Model {
  @ForeignKey(() => Plan)
  @Column
  planId: number;

  @ForeignKey(() => Place)
  @Column
  placeId: number;

  @Column
  type: string;

  @Column
  indexOfDate: number;

  @Column
  averageTime: number;

  @Column
  fromTime: string;

  @Column
  nextTime: string;

  @Column
  position: number;

  @Column
  currentDate: string;

  @BelongsTo(() => Plan)
  plan: Plan;

  @BelongsTo(() => Place)
  place: Place;
}
