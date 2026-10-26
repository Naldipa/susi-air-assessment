export function formatIsoDate(date: string, options?: Intl.DateTimeFormatOptions): string {
  const [year, month, day] = date.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...options }).format(value);
}