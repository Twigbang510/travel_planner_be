import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { PlanPlaceDetail } from '../../plan/entities/plan-detail.entity';

@Table
export class Place extends Model<Place> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  formatted_address: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  photos: Array<{
    height: number;
    html_attributions: string[];
    photo_reference: string;
    width: number;
  }>;

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
    allowNull: false,
  })
  website: string;

  @HasMany(() => PlanPlaceDetail)
  planPlaceDetails: PlanPlaceDetail[];
}
