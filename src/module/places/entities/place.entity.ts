import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class Place extends Model<Place> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  placeId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  address: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  rating: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  userRatingsTotal: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  website: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  photoReference: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  geometry: any;
}
