import {
    Column,
    Model,
    Table,
    ForeignKey,
    DataType,
} from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';
import { Place } from './place.entity';

@Table
export class UserFavoritePlace extends Model<UserFavoritePlace> {
    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    userId: number;

    @ForeignKey(() => Place)
    @Column({ type: DataType.STRING, allowNull: false })
    placeId: string;
}
