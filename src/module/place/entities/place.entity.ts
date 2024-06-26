import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { PlanPlaceDetail } from '../../plan/entities/plan-detail.entity';

@Table
export class Place extends Model<Place> {
  @Column({ type: DataType.STRING, allowNull: false })
  formatted_address: string;

  @Column({ type: DataType.JSON, allowNull: false })
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

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.JSON, allowNull: false })
  photos: string[];

  @Column({ type: DataType.STRING, allowNull: false })
  place_id: string;

  @Column({ type: DataType.FLOAT, allowNull: true })
  rating?: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  user_ratings_total?: number;

  @Column({ type: DataType.STRING, allowNull: true })
  website?: string;

  @HasMany(() => PlanPlaceDetail)
  planPlaceDetails: PlanPlaceDetail[];
}