import { Module } from '@nestjs/common';
import { FlightHoursController } from './flight-hours.controller';
import { FlightHoursService } from './flight-hours.service';

@Module({
  controllers: [FlightHoursController],
  providers: [FlightHoursService],
  exports: [FlightHoursService],
})
export class FlightHoursModule {}
