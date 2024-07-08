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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('place')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('place')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Post('save')
  @ApiOperation({ summary: 'Save a new place' })
  create(@Body() createPlaceDto: CreatePlaceDto) {
    return this.placeService.create(createPlaceDto);
  }

  @Post('like')
  @ApiOperation({ summary: 'Toggle favorite place for a user' })
  async toggleFavoritePlace(
    @Body('placeId') placeId: string,
    @UserData('id') userId: number
  ): Promise<{ liked: boolean }> {
    return this.placeService.toggleFavoritePlace(placeId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all places' })
  findAll() {
    return this.placeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific place by ID' })
  findOne(@Param('id') id: string) {
    return this.placeService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing place' })
  update(@Param('id') id: string, @Body() updatePlaceDto: UpdatePlaceDto) {
    return this.placeService.update(+id, updatePlaceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a place' })
  remove(@Param('id') id: string) {
    return this.placeService.remove(+id);
  }
}
