import type { IncomeItem, IncomePlan, Month } from '@/domain/types';
import { getDb, inTransaction } from './client';
import {
  toIncomeItem,
  toIncomePlan,
  type IncomeItemRow,
  type IncomePlanRow,
} from './mappers';

export type IncomeItemInput = Omit<IncomeItem, 'id' | 'month'>;

export interface IncomeData {
  plan: IncomePlan | null;
  items: IncomeItem[];
}

export async function getIncome(month: Month): Promise<IncomeData> {
  const db = await getDb();
  const plan = await db.getFirstAsync<IncomePlanRow>('SELECT * FROM income_plan WHERE month = ?', [
    month,
  ]);
  const items = await db.getAllAsync<IncomeItemRow>(
    'SELECT * FROM income_item WHERE month = ? ORDER BY is_extra, id',
    [month],
  );
  return { plan: plan ? toIncomePlan(plan) : null, items: items.map(toIncomeItem) };
}

export async function saveIncome(plan: IncomePlan, items: IncomeItemInput[]): Promise<void> {
  await inTransaction(async (db) => {
    await db.runAsync(
      `INSERT INTO income_plan (month, mode, net_cents, tax_percent, tax_on_extra)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(month) DO UPDATE SET mode = excluded.mode, net_cents = excluded.net_cents,
         tax_percent = excluded.tax_percent, tax_on_extra = excluded.tax_on_extra`,
      [plan.month, plan.mode, plan.netCents, plan.taxPercent, plan.taxOnExtra ? 1 : 0],
    );
    await db.runAsync('DELETE FROM income_item WHERE month = ?', [plan.month]);
    for (const item of items) {
      await db.runAsync(
        'INSERT INTO income_item (month, label, quantity, unit_cents, is_extra) VALUES (?, ?, ?, ?, ?)',
        [plan.month, item.label, item.quantity, item.unitCents, item.isExtra ? 1 : 0],
      );
    }
  });
}
