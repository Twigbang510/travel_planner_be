import { Sequelize } from 'sequelize-typescript';
import { User } from '../user/entities/user.entity';
export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '19121912',
        database: 'mydb',
      });
      sequelize.addModels([
        User,
    ]);
      await sequelize.sync();
      return sequelize;
    },
  },
];