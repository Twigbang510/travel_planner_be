import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { PlanPlaceDetail } from 'src/module/plan/entities/plan-detail.entity';
import { Plan } from 'src/module/plan/entities/plan.entity';

@Table
export class Place extends Model<Place> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  formatted_address: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  lat: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  lng: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  viewport_northeast_lat: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  viewport_northeast_lng: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  viewport_southwest_lat: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  viewport_southwest_lng: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  photos: string; // Store JSON string of photos

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  place_id: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  rating: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_ratings_total: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  website: string;

  @BelongsToMany(() => Plan, () => PlanPlaceDetail)
  plans: Plan[];
}
