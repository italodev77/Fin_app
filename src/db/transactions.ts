import { addMonths } from '@/domain/month';
import type { Month, Transaction } from '@/domain/types';
import { getDb } from './client';
import { toTransaction, type TransactionRow } from './mappers';

export type TransactionInput = Omit<Transaction, 'id'> & { id?: number };

export async function listTransactions(month: Month): Promise<Transaction[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TransactionRow>(
    'SELECT * FROM transactions WHERE date >= ? AND date < ? ORDER BY date, id',
    [`${month}-01`, `${addMonths(month, 1)}-01`],
  );
  return rows.map(toTransaction);
}

export async function getTransaction(id: number): Promise<Transaction | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<TransactionRow>('SELECT * FROM transactions WHERE id = ?', [id]);
  return row ? toTransaction(row) : null;
}

export async function saveTransaction(input: TransactionInput): Promise<void> {
  const db = await getDb();
  if (input.id === undefined) {
    await db.runAsync(
      'INSERT INTO transactions (type, description, amount_cents, date, category_id) VALUES (?, ?, ?, ?, ?)',
      [input.type, input.description, input.amountCents, input.date, input.categoryId],
    );
    return;
  }
  await db.runAsync(
    'UPDATE transactions SET type = ?, description = ?, amount_cents = ?, date = ?, category_id = ? WHERE id = ?',
    [input.type, input.description, input.amountCents, input.date, input.categoryId, input.id],
  );
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}
