import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/sequelize';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}
  async create(user: CreateUserDto): Promise<User> {
    const newUser = await this.userModel.create<User>(user);

    if (newUser) return newUser.dataValues;
  }
  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne<User>({
      where: { email: email },
    });
    if (user) return user.dataValues;
  }
  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userModel.findOne<User>({ where: {id: id}});
    if (user) return user.dataValues
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
