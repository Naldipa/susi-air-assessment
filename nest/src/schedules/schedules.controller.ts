import { Controller, Get, Inject, Query } from '@nestjs/common';
import { SchedulesQueryDto } from './schedules-query.dto';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(@Inject(SchedulesService) private readonly schedules: SchedulesService) {}

  @Get()
  getMonth(@Query() query: SchedulesQueryDto) {
    return this.schedules.getMonth(query.year, query.month);
  }
}
