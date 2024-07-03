import {
  Column,
  Model,
  Table,
  HasMany,
  BelongsToMany,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Place } from '../../place/entities/place.entity';
import { PlanPlaceDetail } from './plan-detail.entity';
import { User } from 'src/module/user/entities/user.entity';

@Table
export class Plan extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column({ type: DataType.DATE, allowNull: false })
  startDate: string;

  @Column({ type: DataType.DATE, allowNull: false })
  endDate: string;

  @Column({ type: DataType.STRING, allowNull: false })
  startPlaceId: string;

  @Column({ type: DataType.JSON, allowNull: false })
  startLocation: {
    lat: number;
    lng: number;
  };

  @Column({ type: DataType.JSON, allowNull: false })
  types: string[];

  @Column({ type: DataType.STRING, allowNull: true })
  city: string;
  
  @HasMany(() => PlanPlaceDetail)
  planPlaceDetails: PlanPlaceDetail[];
}
