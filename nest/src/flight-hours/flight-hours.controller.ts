import { Controller, Get, Inject, Query } from '@nestjs/common';
import { FlightHoursQueryDto } from './flight-hours-query.dto';
import { FlightHoursService } from './flight-hours.service';
import { SummaryQueryDto } from './summary-query.dto';

@Controller('flight-hours')
export class FlightHoursController {
  constructor(@Inject(FlightHoursService) private readonly flightHours: FlightHoursService) {}

  @Get()
  getRecords(@Query() query: FlightHoursQueryDto) {
    return this.flightHours.getRecords(query.from, query.to);
  }

  @Get('summary')
  getSummary(@Query() query: SummaryQueryDto) {
    return this.flightHours.getSummary(query.range);
  }

  @Get('limits')
  getLimitCards() {
    return this.flightHours.getLimitCards();
  }
}
