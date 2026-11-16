import type {
  BillInstance,
  BillTemplate,
  Category,
  IncomeItem,
  IncomePlan,
  Transaction,
} from './types';

export const BACKUP_VERSION = 1;

export interface BackupData {
  version: number;
  exportedAt: string;
  categories: Category[];
  billTemplates: BillTemplate[];
  billInstances: BillInstance[];
  transactions: Transaction[];
  incomePlans: IncomePlan[];
  incomeItems: IncomeItem[];
  settings: Record<string, string>;
}

const COLLECTIONS = [
  'categories',
  'billTemplates',
  'billInstances',
  'transactions',
  'incomePlans',
  'incomeItems',
] as const;

export class InvalidBackupError extends Error {
  constructor(message = 'Arquivo de backup inválido') {
    super(message);
    this.name = 'InvalidBackupError';
  }
}

export function serializeBackup(data: Omit<BackupData, 'version' | 'exportedAt'>, now: Date): string {
  const backup: BackupData = {
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    ...data,
  };
  return JSON.stringify(backup, null, 2);
}

export function parseBackup(json: string): BackupData {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new InvalidBackupError();
  }

  if (typeof raw !== 'object' || raw === null) throw new InvalidBackupError();
  const data = raw as Record<string, unknown>;

  if (data.version !== BACKUP_VERSION) {
    throw new InvalidBackupError('Versão de backup não suportada');
  }
  for (const key of COLLECTIONS) {
    if (!Array.isArray(data[key])) throw new InvalidBackupError();
  }
  if (typeof data.settings !== 'object' || data.settings === null) {
    throw new InvalidBackupError();
  }

  return data as unknown as BackupData;
}
