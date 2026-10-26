import { Inject, Injectable } from '@nestjs/common';
import { DataService, assessmentDate } from '../shared/data/data.service';

@Injectable()
export class SchedulesService {
  constructor(@Inject(DataService) private readonly data: DataService) {}

  getMonth(year: number, month: number) {
    const monthPrefix =
      year.toString().padStart(4, '0') + '-' + month.toString().padStart(2, '0');
    const schedules = this.data.schedules.schedules
      .filter((entry) => entry.duty_date.startsWith(monthPrefix))
      .map((entry) => ({ ...entry }))
      .sort((left, right) => left.duty_date.localeCompare(right.duty_date));

    return {
      year,
      month,
      referenceDate: assessmentDate(),
      sourceReferenceDate: this.data.schedules.today,
      legend: this.data.schedules.legend.map((entry) => ({ ...entry })),
      schedules,
    };
  }
}
