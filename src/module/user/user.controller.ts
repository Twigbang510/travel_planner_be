import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { UserData } from 'src/decorators/user-data.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() user: CreateUserDto) {
    return this.userService.create(user);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all users' })
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Retrieve current user information' })
  async findOne(@UserData('id') id: string): Promise<User> {
    if (!id) throw new BadRequestException('User not found');
    const user = await this.userService.findOneById(id);
    delete user.password;
    return user;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing user' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
