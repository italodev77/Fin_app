import { formatBRL } from './money';
import { addDays, daysBetween, toIsoDate, weekday } from './month';
import type { BillInstance, IsoDate, Settings } from './types';

export interface PlannedNotification {
  id: string;
  fireAt: Date;
  title: string;
  body: string;
}

export const MAX_SCHEDULED = 60;
const SUMMARY_WEEKS = 4;
const MONDAY = 1;

function atTime(date: IsoDate, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

function dueText(name: string, offset: number, amountCents: number): string {
  const amount = formatBRL(amountCents);
  if (offset === 0) return `${name} vence hoje — ${amount}`;
  if (offset === 1) return `${name} vence amanhã — ${amount}`;
  return `${name} vence em ${offset} dias — ${amount}`;
}

export function planBillNotifications(
  bills: BillInstance[],
  settings: Settings,
  now: Date,
): PlannedNotification[] {
  const offsets = Array.from(new Set([settings.alertDaysBefore, 0])).sort((a, b) => b - a);
  const planned: PlannedNotification[] = [];

  for (const bill of bills) {
    if (bill.status !== 'PENDING' || bill.dueDate === null) continue;
    for (const offset of offsets) {
      const fireAt = atTime(addDays(bill.dueDate, -offset), settings.alertTime);
      if (fireAt.getTime() <= now.getTime()) continue;
      planned.push({
        id: `bill-${bill.id}-${offset}`,
        fireAt,
        title: 'Conta a vencer',
        body: dueText(bill.name, offset, bill.amountCents),
      });
    }
  }
  return planned;
}

export function planWeeklySummaries(
  bills: BillInstance[],
  settings: Settings,
  now: Date,
): PlannedNotification[] {
  if (!settings.weeklySummary) return [];

  const pending = bills.filter((b) => b.status === 'PENDING' && b.dueDate !== null);
  const today = toIsoDate(now);
  let monday = today;
  while (weekday(monday) !== MONDAY) monday = addDays(monday, 1);

  const planned: PlannedNotification[] = [];
  for (let week = 0; week < SUMMARY_WEEKS; week += 1) {
    const start = addDays(monday, week * 7);
    const fireAt = atTime(start, settings.alertTime);
    if (fireAt.getTime() <= now.getTime()) continue;

    const upcoming = pending.filter((b) => {
      const gap = daysBetween(start, b.dueDate as IsoDate);
      return gap >= 0 && gap < 7;
    });
    if (upcoming.length === 0) continue;

    const total = upcoming.reduce((acc, b) => acc + b.amountCents, 0);
    const count = upcoming.length === 1 ? '1 conta' : `${upcoming.length} contas`;
    planned.push({
      id: `weekly-${start}`,
      fireAt,
      title: 'Resumo da semana',
      body: `Você tem ${count} nos próximos 7 dias — ${formatBRL(total)}`,
    });
  }
  return planned;
}

export function planNotifications(
  bills: BillInstance[],
  settings: Settings,
  now: Date,
): PlannedNotification[] {
  return [
    ...planBillNotifications(bills, settings, now),
    ...planWeeklySummaries(bills, settings, now),
  ]
    .sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime())
    .slice(0, MAX_SCHEDULED);
}
