import test from 'node:test';
import assert from 'node:assert/strict';
import { BadRequestException } from '@nestjs/common';
import { resolve } from 'node:path';
import { DataService } from '../src/shared/data/data.service';
import { FlightHoursService } from '../src/flight-hours/flight-hours.service';
import type { ChartRange } from '../src/shared/data/data.models';

process.env.ASSESSMENT_TODAY = '2026-05-15';
const data = new DataService(resolve(process.cwd(), '../data'));
const service = new FlightHoursService(data);

test('range query zero-fills dates before the dataset and sums inclusive records', () => {
  const result = service.getRecords('2024-12-26', '2024-12-28');
  assert.deepEqual(result.records.map((record) => record.hours), [0, 5.7, 0]);
  assert.equal(result.totalHours, 5.7);
});

test('daily and rolling limit cards use the fixed assessment date', () => {
  const result = service.getLimitCards();
  assert.equal(result.referenceDate, '2026-05-15');
  assert.equal(result.cards[0]?.usedHours, 6.4);
  assert.equal(result.cards[1]?.usedHours, 25.2);
});

test('summary contains centered display dates and an inclusive rolling window', () => {
  const result = service.getSummary('1w');
  assert.equal(result.displayRange.from, '2026-05-08');
  assert.equal(result.displayRange.to, '2026-05-22');
  assert.equal(result.points.length, 15);
  assert.equal(result.points[7]?.date, '2026-05-15');
  assert.equal(result.points[7]?.hours, 6.4);
  assert.equal(result.points[7]?.rollingHours, 25.2);
  assert.equal(result.points[14]?.rollingHours, 36.3);
});

test('every chart range uses its configured window, limit, and axis maximum', () => {
  const ranges: ChartRange[] = ['1w', '1m', '3m', '6m', '1y'];
  for (const range of ranges) {
    const result = service.getSummary(range);
    assert.equal(result.points.length, 15);
    assert.ok(result.points.every((point) => Number.isFinite(point.rollingHours)));
    assert.equal(result.windowDays, data.flightHours.chartBounds[range].windowDays);
    assert.equal(result.limit, data.flightHours.chartBounds[range].limit);
    assert.equal(result.chartMax, data.flightHours.chartBounds[range].max);
  }
});

test('invalid and reversed date ranges are rejected', () => {
  assert.throws(() => service.getRecords('2026-02-30', '2026-03-01'), BadRequestException);
  assert.throws(() => service.getRecords('2026-05-16', '2026-05-15'), BadRequestException);
});
