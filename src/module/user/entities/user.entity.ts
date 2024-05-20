import { Table, Column, Model, DataType, Unique } from 'sequelize-typescript';

export type UserRoleType = 'admin' | 'user';

@Table
export class User extends Model<User> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  username: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  picture: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column
  isAdmin: boolean;
}
