import { isTemplateActive } from '@/domain/instances';
import { dueDateFor } from '@/domain/month';
import type { BillTemplate, Month } from '@/domain/types';
import { getDb, inTransaction, type Db } from './client';
import { toTemplate, type InstanceRow, type TemplateRow } from './mappers';

export type TemplateInput = Omit<BillTemplate, 'id'> & { id?: number };

export async function listTemplates(): Promise<BillTemplate[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TemplateRow>('SELECT * FROM bill_template ORDER BY kind, name');
  return rows.map(toTemplate);
}

export async function getTemplate(id: number): Promise<BillTemplate | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<TemplateRow>('SELECT * FROM bill_template WHERE id = ?', [id]);
  return row ? toTemplate(row) : null;
}

async function syncInstances(db: Db, template: BillTemplate, fromMonth: Month): Promise<void> {
  const rows = await db.getAllAsync<InstanceRow>(
    "SELECT * FROM bill_instance WHERE template_id = ? AND status = 'PENDING' AND month >= ?",
    [template.id, fromMonth],
  );

  for (const row of rows) {
    if (!isTemplateActive(template, row.month)) {
      await db.runAsync('DELETE FROM bill_instance WHERE id = ?', [row.id]);
      continue;
    }
    const amount = row.amount_overridden === 1 ? row.amount_cents : template.amountCents;
    await db.runAsync(
      'UPDATE bill_instance SET name = ?, amount_cents = ?, due_date = ?, kind = ? WHERE id = ?',
      [template.name, amount, dueDateFor(row.month, template.dueDay), template.kind, row.id],
    );
  }
}

export async function saveTemplate(input: TemplateInput, currentMonth: Month): Promise<number> {
  return inTransaction(async (db) => {
    const values = [
      input.name,
      input.amountCents,
      input.categoryId,
      input.dueDay,
      input.kind,
      input.startMonth,
      input.endMonth,
      input.installmentsTotal,
      input.installmentsPaid,
    ];

    let id = input.id;
    if (id === undefined) {
      const result = await db.runAsync(
        `INSERT INTO bill_template
          (name, amount_cents, category_id, due_day, kind, start_month, end_month, installments_total, installments_paid)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values,
      );
      id = result.lastInsertRowId;
    } else {
      await db.runAsync(
        `UPDATE bill_template SET name = ?, amount_cents = ?, category_id = ?, due_day = ?, kind = ?,
          start_month = ?, end_month = ?, installments_total = ?, installments_paid = ? WHERE id = ?`,
        [...values, id],
      );
    }

    await syncInstances(db, { ...input, id }, currentMonth);
    return id;
  });
}

export async function deleteTemplate(id: number, currentMonth: Month): Promise<void> {
  await inTransaction(async (db) => {
    await db.runAsync(
      "DELETE FROM bill_instance WHERE template_id = ? AND status = 'PENDING' AND month >= ?",
      [id, currentMonth],
    );
    await db.runAsync('DELETE FROM bill_template WHERE id = ?', [id]);
  });
}
