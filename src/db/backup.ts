import { serializeBackup, type BackupData } from '@/domain/backup';
import { getDb, inTransaction } from './client';
import {
  toCategory,
  toIncomeItem,
  toIncomePlan,
  toInstance,
  toTemplate,
  toTransaction,
  type CategoryRow,
  type IncomeItemRow,
  type IncomePlanRow,
  type InstanceRow,
  type TemplateRow,
  type TransactionRow,
} from './mappers';

export async function exportBackup(): Promise<string> {
  const db = await getDb();
  const [categories, templates, instances, transactions, plans, items, settings] =
    await Promise.all([
      db.getAllAsync<CategoryRow>('SELECT * FROM category ORDER BY id'),
      db.getAllAsync<TemplateRow>('SELECT * FROM bill_template ORDER BY id'),
      db.getAllAsync<InstanceRow>('SELECT * FROM bill_instance ORDER BY id'),
      db.getAllAsync<TransactionRow>('SELECT * FROM transactions ORDER BY id'),
      db.getAllAsync<IncomePlanRow>('SELECT * FROM income_plan ORDER BY month'),
      db.getAllAsync<IncomeItemRow>('SELECT * FROM income_item ORDER BY id'),
      db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings'),
    ]);

  return serializeBackup(
    {
      categories: categories.map(toCategory),
      billTemplates: templates.map(toTemplate),
      billInstances: instances.map(toInstance),
      transactions: transactions.map(toTransaction),
      incomePlans: plans.map(toIncomePlan),
      incomeItems: items.map(toIncomeItem),
      settings: Object.fromEntries(settings.map((s) => [s.key, s.value])),
    },
    new Date(),
  );
}

export async function importBackup(data: BackupData): Promise<void> {
  await inTransaction(async (db) => {
    await db.execAsync(`
      DELETE FROM bill_instance;
      DELETE FROM bill_template;
      DELETE FROM transactions;
      DELETE FROM income_item;
      DELETE FROM income_plan;
      DELETE FROM category;
      DELETE FROM settings;
    `);

    for (const c of data.categories) {
      await db.runAsync('INSERT INTO category (id, name, kind) VALUES (?, ?, ?)', [
        c.id,
        c.name,
        c.kind,
      ]);
    }

    for (const t of data.billTemplates) {
      await db.runAsync(
        `INSERT INTO bill_template
          (id, name, amount_cents, category_id, due_day, kind, start_month, end_month, installments_total, installments_paid)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          t.id,
          t.name,
          t.amountCents,
          t.categoryId,
          t.dueDay,
          t.kind,
          t.startMonth,
          t.endMonth,
          t.installmentsTotal,
          t.installmentsPaid,
        ],
      );
    }

    for (const b of data.billInstances) {
      await db.runAsync(
        `INSERT INTO bill_instance
          (id, template_id, month, name, amount_cents, due_date, status, paid_at, kind, amount_overridden)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          b.id,
          b.templateId,
          b.month,
          b.name,
          b.amountCents,
          b.dueDate,
          b.status,
          b.paidAt,
          b.kind,
          b.amountOverridden ? 1 : 0,
        ],
      );
    }

    for (const t of data.transactions) {
      await db.runAsync(
        'INSERT INTO transactions (id, type, description, amount_cents, date, category_id) VALUES (?, ?, ?, ?, ?, ?)',
        [t.id, t.type, t.description, t.amountCents, t.date, t.categoryId],
      );
    }

    for (const p of data.incomePlans) {
      await db.runAsync(
        'INSERT INTO income_plan (month, mode, net_cents, tax_percent, tax_on_extra) VALUES (?, ?, ?, ?, ?)',
        [p.month, p.mode, p.netCents, p.taxPercent, p.taxOnExtra ? 1 : 0],
      );
    }

    for (const i of data.incomeItems) {
      await db.runAsync(
        'INSERT INTO income_item (id, month, label, quantity, unit_cents, is_extra) VALUES (?, ?, ?, ?, ?, ?)',
        [i.id, i.month, i.label, i.quantity, i.unitCents, i.isExtra ? 1 : 0],
      );
    }

    const settings = { ...data.settings, seeded: '1' };
    for (const [key, value] of Object.entries(settings)) {
      await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', [key, String(value)]);
    }
  });
}
