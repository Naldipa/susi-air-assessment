import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarCells, moveMonth, monthLabel } from '../utils/calendar';

test('calendar grid aligns May 2026 on a Monday-first week', () => {
  const cells = calendarCells(2026, 5);
  const first = cells.find((cell) => cell.currentMonth);
  assert.equal(first?.date, '2026-05-01');
  assert.equal(cells[4]?.date, '2026-05-01');
  assert.equal(cells[4]?.day, 1);
});

test('calendar fills all valid dates for February in a leap year', () => {
  const cells = calendarCells(2028, 2).filter((cell) => cell.currentMonth);
  assert.equal(cells.length, 29);
  assert.equal(cells[28]?.date, '2028-02-29');
});

test('month navigation crosses year boundaries', () => {
  assert.deepEqual(moveMonth(2026, 1, -1), { year: 2025, month: 12 });
  assert.deepEqual(moveMonth(2026, 12, 1), { year: 2027, month: 1 });
  assert.equal(monthLabel(2026, 5), 'May 2026');
});
