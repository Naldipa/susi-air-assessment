import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DataService, assessmentDate } from '../shared/data/data.service';
import type { ChartRange, FlightHourRecord } from '../shared/data/data.models';
import { addDays, assertIsoDate, daysBetween, rangeDates } from '../shared/date/date-utils';

@Injectable()
export class FlightHoursService {
  private readonly hoursByDate: Map<string, number>;

  constructor(@Inject(DataService) private readonly data: DataService) {
    this.hoursByDate = new Map(
      data.flightHours.flightHours.map((record) => [record.date, record.hours]),
    );
  }

  getRecords(from: string, to: string) {
    const records = this.recordsBetween(from, to);
    return {
      from,
      to,
      records,
      totalHours: Number(records.reduce((total, record) => total + record.hours, 0).toFixed(2)),
    };
  }

  getSummary(range: ChartRange) {
    const config = this.data.flightHours.chartBounds[range];
    if (!config) throw new BadRequestException('Unsupported chart range');

    const today = assessmentDate();
    const from = addDays(today, -config.displayRangeDays);
    const to = addDays(today, config.displayRangeDays);
    const points = rangeDates(from, to).map((date) => ({
      date,
      hours: this.hoursByDate.get(date) ?? 0,
      rollingHours: this.sumWindow(date, config.windowDays),
    }));

    return {
      range,
      referenceDate: today,
      windowDays: config.windowDays,
      limit: config.limit,
      chartMax: config.max,
      displayRange: { from, to },
      points,
    };
  }

  getLimitCards() {
    const today = assessmentDate();
    const limits = this.data.flightHours.limits;
    const definitions = [
      { key: 'daily', label: 'Daily', limit: limits.daily, windowDays: 1 },
      { key: 'weekly', label: 'Weekly', limit: limits.weekly, windowDays: 7 },
      { key: 'monthly', label: 'Monthly', limit: limits.monthly, windowDays: 30 },
      { key: 'annual', label: 'Annual', limit: limits.annual, windowDays: 365 },
    ];

    return {
      referenceDate: today,
      cards: definitions.map((definition) => {
        const usedHours = this.sumWindow(today, definition.windowDays);
        return {
          ...definition,
          usedHours,
          percentage: Math.round((usedHours / definition.limit) * 100),
        };
      }),
    };
  }

  private recordsBetween(from: string, to: string): FlightHourRecord[] {
    assertIsoDate(from, 'from');
    assertIsoDate(to, 'to');
    if (daysBetween(from, to) > 3_660) {
      throw new BadRequestException('Requested range cannot exceed ten years');
    }
    return rangeDates(from, to).map((date) => ({
      date,
      hours: this.hoursByDate.get(date) ?? 0,
    }));
  }

  private sumWindow(endDate: string, windowDays: number): number {
    const firstDate = addDays(endDate, -(windowDays - 1));
    let total = 0;
    for (const date of rangeDates(firstDate, endDate)) {
      total += this.hoursByDate.get(date) ?? 0;
    }
    return Number(total.toFixed(2));
  }
}
