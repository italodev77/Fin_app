import { effectiveEndMonth, installmentNumber } from './instances';
import { diffMonths } from './month';
import type { BillTemplate, Month } from './types';

export interface DebtProjection {
  currentInstallment: number | null;
  totalInstallments: number | null;
  endMonth: Month | null;
  remainingInstallments: number | null;
  remainingCents: number | null;
}

export function projectDebt(template: BillTemplate, fromMonth: Month): DebtProjection {
  const endMonth = effectiveEndMonth(template);
  const first = fromMonth < template.startMonth ? template.startMonth : fromMonth;

  let remainingInstallments: number | null = null;
  if (endMonth !== null) {
    remainingInstallments = Math.max(diffMonths(first, endMonth) + 1, 0);
  }

  const current = installmentNumber(template, first);
  return {
    currentInstallment: current !== null && remainingInstallments !== 0 ? current : null,
    totalInstallments: template.installmentsTotal,
    endMonth,
    remainingInstallments,
    remainingCents:
      remainingInstallments === null ? null : remainingInstallments * template.amountCents,
  };
}
