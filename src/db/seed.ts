import {
  SEED_CATEGORIES,
  SEED_INCOME_ITEMS,
  SEED_INCOME_PLANS,
  SEED_TEMPLATES,
  SEED_TRANSACTIONS,
} from '@/domain/seed';
import { getSetting } from './settings';
import { inTransaction } from './client';

const SEEDED_KEY = 'seeded';

export async function seedIfEmpty(): Promise<void> {
  if ((await getSetting(SEEDED_KEY)) !== null) return;

  await inTransaction(async (db) => {
    const categoryIds = new Map<string, number>();
    for (const category of SEED_CATEGORIES) {
      const result = await db.runAsync('INSERT INTO category (name, kind) VALUES (?, ?)', [
        category.name,
        category.kind,
      ]);
      categoryIds.set(category.kind, result.lastInsertRowId);
    }

    for (const t of SEED_TEMPLATES) {
      await db.runAsync(
        `INSERT INTO bill_template
          (name, amount_cents, category_id, due_day, kind, start_month, end_month, installments_total, installments_paid)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          t.name,
          t.amountCents,
          categoryIds.get(t.kind) ?? null,
          t.dueDay,
          t.kind,
          t.startMonth,
          t.endMonth,
          t.installmentsTotal,
          t.installmentsPaid,
        ],
      );
    }

    for (const t of SEED_TRANSACTIONS) {
      await db.runAsync(
        'INSERT INTO transactions (type, description, amount_cents, date, category_id) VALUES (?, ?, ?, ?, ?)',
        [t.type, t.description, t.amountCents, t.date, categoryIds.get('AVULSA') ?? null],
      );
    }

    for (const p of SEED_INCOME_PLANS) {
      await db.runAsync(
        'INSERT INTO income_plan (month, mode, net_cents, tax_percent, tax_on_extra) VALUES (?, ?, ?, ?, ?)',
        [p.month, p.mode, p.netCents, p.taxPercent, p.taxOnExtra ? 1 : 0],
      );
    }

    for (const i of SEED_INCOME_ITEMS) {
      await db.runAsync(
        'INSERT INTO income_item (month, label, quantity, unit_cents, is_extra) VALUES (?, ?, ?, ?, ?)',
        [i.month, i.label, i.quantity, i.unitCents, i.isExtra ? 1 : 0],
      );
    }

    await db.runAsync("INSERT INTO settings (key, value) VALUES (?, '1')", [SEEDED_KEY]);
  });
}
