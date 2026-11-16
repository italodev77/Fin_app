import type { Category } from '@/domain/types';
import { getDb } from './client';
import { toCategory, type CategoryRow } from './mappers';

export async function listCategories(): Promise<Category[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<CategoryRow>('SELECT * FROM category ORDER BY id');
  return rows.map(toCategory);
}
