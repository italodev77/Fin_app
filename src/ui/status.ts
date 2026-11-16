import { daysBetween, formatDayMonth } from '@/domain/month';
import { displayStatus } from '@/domain/summary';
import type { BillInstance, IsoDate } from '@/domain/types';
import type { Theme } from './theme';

export const DUE_SOON_DAYS = 3;

export interface StatusBadge {
  label: string;
  color: keyof Theme;
  background: keyof Theme;
}

export function billBadge(bill: BillInstance, today: IsoDate): StatusBadge {
  const status = displayStatus(bill, today);
  if (status === 'PAID') return { label: 'Paga', color: 'success', background: 'successBg' };
  if (status === 'OVERDUE') return { label: 'Atrasada', color: 'danger', background: 'dangerBg' };
  if (bill.dueDate === null) {
    return { label: 'Defina o vencimento', color: 'warning', background: 'warningBg' };
  }

  const days = daysBetween(today, bill.dueDate);
  if (days === 0) return { label: 'Vence hoje', color: 'warning', background: 'warningBg' };
  if (days === 1) return { label: 'Vence amanhã', color: 'warning', background: 'warningBg' };
  if (days <= DUE_SOON_DAYS) {
    return { label: `Vence em ${days} dias`, color: 'warning', background: 'warningBg' };
  }
  return { label: 'Pendente', color: 'muted', background: 'border' };
}

export function dueText(bill: BillInstance): string {
  return bill.dueDate === null ? 'Sem vencimento' : `Vence ${formatDayMonth(bill.dueDate)}`;
}
