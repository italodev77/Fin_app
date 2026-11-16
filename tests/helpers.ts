import { computeIncome } from '../src/domain/income';
import { missingInstances } from '../src/domain/instances';
import {
  SEED_INCOME_ITEMS,
  SEED_INCOME_PLANS,
  SEED_TEMPLATES,
  SEED_TRANSACTIONS,
} from '../src/domain/seed';
import { summarizeMonth } from '../src/domain/summary';
import type {
  BillInstance,
  BillTemplate,
  IncomeItem,
  Month,
  Transaction,
} from '../src/domain/types';

export const templates: BillTemplate[] = SEED_TEMPLATES.map((t, i) => ({
  ...t,
  id: i + 1,
  categoryId: null,
}));

export const transactions: Transaction[] = SEED_TRANSACTIONS.map((t, i) => ({
  ...t,
  id: i + 1,
  categoryId: null,
}));

export const incomeItems: IncomeItem[] = SEED_INCOME_ITEMS.map((t, i) => ({ ...t, id: i + 1 }));

export function billsFor(month: Month): BillInstance[] {
  return missingInstances(templates, [], month).map((b, i) => ({ ...b, id: i + 1 }));
}

export function summaryFor(month: Month, today = '2026-11-16') {
  const plan = SEED_INCOME_PLANS.find((p) => p.month === month) ?? null;
  const income = computeIncome(
    plan,
    incomeItems.filter((i) => i.month === month),
  );
  return summarizeMonth({
    bills: billsFor(month),
    transactions: transactions.filter((t) => t.date.startsWith(month)),
    incomeNetCents: income.netCents,
    today,
  });
}
