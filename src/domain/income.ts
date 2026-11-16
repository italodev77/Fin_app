import type { IncomeItem, IncomePlan } from './types';

export interface IncomeResult {
  grossCents: number;
  taxCents: number;
  netCents: number;
}

export function computeIncome(plan: IncomePlan | null, items: IncomeItem[]): IncomeResult {
  if (!plan) return { grossCents: 0, taxCents: 0, netCents: 0 };

  if (plan.mode === 'NET') {
    const net = plan.netCents ?? 0;
    return { grossCents: net, taxCents: 0, netCents: net };
  }

  let regular = 0;
  let extra = 0;
  for (const item of items) {
    const total = Math.round(item.quantity * item.unitCents);
    if (item.isExtra) extra += total;
    else regular += total;
  }

  const grossCents = regular + extra;
  const taxable = plan.taxOnExtra ? grossCents : regular;
  const taxCents = Math.round((taxable * plan.taxPercent) / 100);
  return { grossCents, taxCents, netCents: grossCents - taxCents };
}
