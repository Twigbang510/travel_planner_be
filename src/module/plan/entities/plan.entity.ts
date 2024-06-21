import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';
import { Place } from '../../place/entities/place.entity';
import { PlanPlaceDetail } from './plan-detail.entity';

@Table
export class Plan extends Model<Plan> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  endDate: Date;

  @BelongsToMany(() => Place, () => PlanPlaceDetail)
  places: Place[];

  @HasMany(() => PlanPlaceDetail)
  planPlaceDetails: PlanPlaceDetail[];
}
