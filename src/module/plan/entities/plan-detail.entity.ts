import {
  Column,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Plan } from './plan.entity';
import { Place } from '../../place/entities/place.entity';

@Table
export class PlanPlaceDetail extends Model<PlanPlaceDetail> {
  @ForeignKey(() => Plan)
  @Column({ type: DataType.INTEGER, allowNull: false })
  planId: number;

  @ForeignKey(() => Place)
  @Column({ type: DataType.INTEGER, allowNull: false })
  placeId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  type: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  indexOfDate: number;

  @Column({ type: DataType.FLOAT, allowNull: false })
  averageTime: number;

  @Column({ type: DataType.STRING, allowNull: false })
  fromTime: string;

  @Column({ type: DataType.STRING, allowNull: false })
  nextTime: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  position: number;

  @Column({ type: DataType.DATE, allowNull: false })
  currentDate: string;

  @BelongsTo(() => Plan)
  plan: Plan;

  @BelongsTo(() => Place)
  place: Place;
}
