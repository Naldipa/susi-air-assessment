import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, daysBetween, isIsoDate, rangeDates } from '../src/shared/date/date-utils';

test('date-only arithmetic handles month and year boundaries', () => {
  assert.equal(addDays('2026-05-15', -7), '2026-05-08');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(daysBetween('2026-05-01', '2026-05-31'), 30);
});

test('date validation rejects impossible dates and ranges include endpoints', () => {
  assert.equal(isIsoDate('2026-02-29'), false);
  assert.equal(isIsoDate('2028-02-29'), true);
  assert.deepEqual(rangeDates('2024-12-26', '2024-12-28'), [
    '2024-12-26',
    '2024-12-27',
    '2024-12-28',
  ]);
  assert.throws(() => rangeDates('2026-05-16', '2026-05-15'));
});
