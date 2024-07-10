import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entities/plan.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { UserData } from 'src/decorators/user-data.decorator';

@ApiTags('plan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new travel plan' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createPlanDto: CreatePlanDto) {
    return this.planService.create(createPlanDto);
  }

  @Get('/user')
  @ApiOperation({ summary: 'Retrieve plans by user ID' })
  async getPlansByUserId(@UserData('id') id: number): Promise<Plan[]> {
    return this.planService.getPlansByUserId(id);
  }

  @Get('/:planId')
  @ApiOperation({ summary: 'Retrieve a specific plan by ID' })
  async getPlanById(@Param('planId') planId: number): Promise<Plan> {
    return this.planService.getPlanById(planId);
  }

  @Post('export/:planId')
  @ApiOperation({ summary: 'Export a plan to a file' })
  async exportPlan(@Param('planId') planId: number): Promise<void> {
    return this.planService.exportPlan(planId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing plan' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: number, @Body() updatePlanDto: UpdatePlanDto) {
    return this.planService.update(id, updatePlanDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a plan' })
  async remove(@Param('id') id: number) {
    return this.planService.remove(id);
  }
}
