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
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entities/plan.entity';

@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createPlanDto: CreatePlanDto) {
    return this.planService.create(createPlanDto);
  }

  @Get('/user/:userId')
  async getPlansByUserId(@Param('userId') userId: number): Promise<Plan[]> {
    return this.planService.getPlansByUserId(userId);
  }

  @Get('/:planId')
  async getPlanById(@Param('planId') planId: number): Promise<Plan> {
    return this.planService.getPlanById(planId);
  }

  @Post('export/:planId')
  async exportPlan(@Param('planId') planId: number): Promise<void> {
    return this.planService.exportPlan(planId);
  }
  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: number, @Body() updatePlanDto: UpdatePlanDto) {
    return this.planService.update(id, updatePlanDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.planService.remove(id);
  }
}
