import { Module,Global } from '@nestjs/common';
import { databaseProviders } from './database.providers';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/entities/user.entity';

@Global()
@Module({
  imports : [SequelizeModule.forFeature([User])],
  // providers: [...databaseProviders],
  // exports: [...databaseProviders],
})
export class DatabaseModule {}