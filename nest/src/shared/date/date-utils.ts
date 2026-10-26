import { BadRequestException } from '@nestjs/common';

const DAY_MS = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function assertIsoDate(value: string, field: string): void {
  if (!isIsoDate(value)) {
    throw new BadRequestException(field + ' must be a valid date in YYYY-MM-DD format');
  }
}

export function addDays(date: string, amount: number): string {
  assertIsoDate(date, 'date');
  const [year, month, day] = date.split('-').map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + amount));
  return [
    result.getUTCFullYear().toString().padStart(4, '0'),
    (result.getUTCMonth() + 1).toString().padStart(2, '0'),
    result.getUTCDate().toString().padStart(2, '0'),
  ].join('-');
}

export function daysBetween(start: string, end: string): number {
  assertIsoDate(start, 'start');
  assertIsoDate(end, 'end');
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  return (Date.UTC(ey, em - 1, ed) - Date.UTC(sy, sm - 1, sd)) / DAY_MS;
}

export function rangeDates(from: string, to: string): string[] {
  assertIsoDate(from, 'from');
  assertIsoDate(to, 'to');
  const distance = daysBetween(from, to);
  if (distance < 0) {
    throw new BadRequestException('from must be on or before to');
  }
  return Array.from({ length: distance + 1 }, (_, index) => addDays(from, index));
}

export function monthDate(year: number, month: number, day: number): string {
  return [
    year.toString().padStart(4, '0'),
    month.toString().padStart(2, '0'),
    day.toString().padStart(2, '0'),
  ].join('-');
}
