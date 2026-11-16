import { missingInstances } from '@/domain/instances';
import type { BillInstance, IsoDate, Month } from '@/domain/types';
import { getDb } from './client';
import { toInstance, type InstanceRow } from './mappers';
import { listTemplates } from './templates';

export async function ensureMonth(month: Month): Promise<void> {
  const db = await getDb();
  const templates = await listTemplates();
  const existing = await db.getAllAsync<{ template_id: number | null; month: string }>(
    'SELECT template_id, month FROM bill_instance WHERE month = ? AND template_id IS NOT NULL',
    [month],
  );

  const pending = missingInstances(
    templates,
    existing.map((e) => ({ templateId: e.template_id, month: e.month })),
    month,
  );

  for (const bill of pending) {
    await db.runAsync(
      `INSERT OR IGNORE INTO bill_instance
        (template_id, month, name, amount_cents, due_date, status, paid_at, kind, amount_overridden)
       VALUES (?, ?, ?, ?, ?, 'PENDING', NULL, ?, 0)`,
      [bill.templateId, bill.month, bill.name, bill.amountCents, bill.dueDate, bill.kind],
    );
  }
}

export async function listInstances(month: Month): Promise<BillInstance[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<InstanceRow>(
    'SELECT * FROM bill_instance WHERE month = ? ORDER BY due_date IS NULL, due_date, name',
    [month],
  );
  return rows.map(toInstance);
}

export async function listPendingInstances(fromMonth: Month, toMonth: Month): Promise<BillInstance[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<InstanceRow>(
    "SELECT * FROM bill_instance WHERE status = 'PENDING' AND month >= ? AND month <= ? ORDER BY due_date",
    [fromMonth, toMonth],
  );
  return rows.map(toInstance);
}

export async function getInstance(id: number): Promise<BillInstance | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<InstanceRow>('SELECT * FROM bill_instance WHERE id = ?', [id]);
  return row ? toInstance(row) : null;
}

export async function setPaid(id: number, paidAt: IsoDate | null): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE bill_instance SET status = ?, paid_at = ? WHERE id = ?', [
    paidAt === null ? 'PENDING' : 'PAID',
    paidAt,
    id,
  ]);
}

export async function updateInstance(
  id: number,
  input: { amountCents: number; dueDate: IsoDate | null },
): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ template_amount: number | null }>(
    `SELECT t.amount_cents AS template_amount
       FROM bill_instance i LEFT JOIN bill_template t ON t.id = i.template_id
      WHERE i.id = ?`,
    [id],
  );
  const overridden = row?.template_amount != null && row.template_amount !== input.amountCents;
  await db.runAsync(
    'UPDATE bill_instance SET amount_cents = ?, due_date = ?, amount_overridden = ? WHERE id = ?',
    [input.amountCents, input.dueDate, overridden ? 1 : 0, id],
  );
}
