import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { DataService } from '../src/shared/data/data.service';
import { SchedulesService } from '../src/schedules/schedules.service';

const service = new SchedulesService(new DataService(resolve(process.cwd(), '../data')));

test('schedule filtering returns records and legend for requested month', () => {
  const april = service.getMonth(2026, 4);
  const may = service.getMonth(2026, 5);
  const june = service.getMonth(2026, 6);
  assert.equal(april.schedules.length, 17);
  assert.equal(may.schedules.length, 21);
  assert.equal(june.schedules.length, 16);
  assert.equal(may.legend.length, 10);
  assert.ok(may.schedules.every((record) => record.duty_date.startsWith('2026-05')));
});

test('months without provided records return an empty schedule array', () => {
  assert.deepEqual(service.getMonth(2026, 7).schedules, []);
});
