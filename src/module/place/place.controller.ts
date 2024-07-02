import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { UserData } from 'src/decorators/user-data.decorator';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
@Controller('place')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Post('save')
  create(@Body() createPlaceDto: CreatePlaceDto) {
    return this.placeService.create(createPlaceDto);
  }

  @Post('like')
  async toggleFavoritePlace(
    @Body('placeId') placeId: string,
    @UserData('id') userId: number
  ): Promise<{ liked: boolean }> {
    return this.placeService.toggleFavoritePlace(placeId, userId);
  }

  @Get()
  findAll() {
    return this.placeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlaceDto: UpdatePlaceDto) {
    return this.placeService.update(+id, updatePlaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.placeService.remove(+id);
  }
}
