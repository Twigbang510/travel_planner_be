import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Plan } from './plan.entity';
import { Place } from '../../place/entities/place.entity';

@Table
export class PlanPlaceDetail extends Model<PlanPlaceDetail> {
  @ForeignKey(() => Plan)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  planId: number;

  @ForeignKey(() => Place)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  placeId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  indexOfDate: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  averageTime: number;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  fromTime: string;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  nextTime: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  position: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  currentDate: Date;
}
