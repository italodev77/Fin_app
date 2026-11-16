import type { IsoDate, Month } from './types';

const MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const pad = (n: number) => String(n).padStart(2, '0');

export function parseMonth(month: Month): { year: number; month: number } {
  const [year, m] = month.split('-').map(Number);
  return { year, month: m };
}

export function toMonth(year: number, month: number): Month {
  return `${year}-${pad(month)}`;
}

export function addMonths(month: Month, delta: number): Month {
  const { year, month: m } = parseMonth(month);
  const index = year * 12 + (m - 1) + delta;
  return toMonth(Math.floor(index / 12), (index % 12) + 1);
}

export function diffMonths(from: Month, to: Month): number {
  const a = parseMonth(from);
  const b = parseMonth(to);
  return (b.year - a.year) * 12 + (b.month - a.month);
}

export function monthOfDate(date: IsoDate): Month {
  return date.slice(0, 7);
}

export function daysInMonth(month: Month): number {
  const { year, month: m } = parseMonth(month);
  return new Date(Date.UTC(year, m, 0)).getUTCDate();
}

export function dueDateFor(month: Month, dueDay: number | null): IsoDate | null {
  if (dueDay === null) return null;
  const day = Math.min(Math.max(dueDay, 1), daysInMonth(month));
  return `${month}-${pad(day)}`;
}

export function toIsoDate(date: Date): IsoDate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayIso(now: Date = new Date()): IsoDate {
  return toIsoDate(now);
}

function utcFromIso(date: IsoDate): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function addDays(date: IsoDate, delta: number): IsoDate {
  const d = new Date(utcFromIso(date) + delta * 86400000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((utcFromIso(to) - utcFromIso(from)) / 86400000);
}

export function weekday(date: IsoDate): number {
  return new Date(utcFromIso(date)).getUTCDay();
}

export function monthLabel(month: Month): string {
  const { year, month: m } = parseMonth(month);
  const name = MONTH_NAMES[m - 1];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${year}`;
}

export function shortMonthLabel(month: Month): string {
  const { year, month: m } = parseMonth(month);
  return `${MONTH_NAMES[m - 1].slice(0, 3)}/${year}`;
}

export function formatDateBR(date: IsoDate): string {
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y}`;
}

export function formatDayMonth(date: IsoDate): string {
  const [, m, d] = date.split('-');
  return `${d}/${m}`;
}
