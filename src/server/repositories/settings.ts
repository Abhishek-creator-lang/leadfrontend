import 'server-only';
import { db } from '../db';

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const row = await db('settings').where({ key }).first<{ value: T } | undefined>('value');
  return row?.value;
}

export async function setSetting(key: string, value: unknown, updatedBy: string) {
  const row = { key, value: JSON.stringify(value), updated_by: updatedBy, updated_at: db.fn.now() };
  await db('settings').insert(row).onConflict('key').merge(['value', 'updated_by', 'updated_at']);
}
