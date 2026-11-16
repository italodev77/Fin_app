export type Month = string;
export type IsoDate = string;

export type CategoryKind = 'FIXA' | 'DIVIDA' | 'AVULSA';
export type BillKind = 'FIXA' | 'DIVIDA';
export type BillStatus = 'PENDING' | 'PAID';
export type DisplayStatus = 'PENDING' | 'PAID' | 'OVERDUE';
export type TransactionType = 'EXPENSE' | 'INCOME';
export type IncomeMode = 'ITEMS' | 'NET';

export interface Category {
  id: number;
  name: string;
  kind: CategoryKind;
}

export interface BillTemplate {
  id: number;
  name: string;
  amountCents: number;
  categoryId: number | null;
  dueDay: number | null;
  kind: BillKind;
  startMonth: Month;
  endMonth: Month | null;
  installmentsTotal: number | null;
  installmentsPaid: number | null;
}

export interface BillInstance {
  id: number;
  templateId: number | null;
  month: Month;
  name: string;
  amountCents: number;
  dueDate: IsoDate | null;
  status: BillStatus;
  paidAt: IsoDate | null;
  kind: BillKind;
  amountOverridden: boolean;
}

export interface Transaction {
  id: number;
  type: TransactionType;
  description: string;
  amountCents: number;
  date: IsoDate;
  categoryId: number | null;
}

export interface IncomePlan {
  month: Month;
  mode: IncomeMode;
  netCents: number | null;
  taxPercent: number;
  taxOnExtra: boolean;
}

export interface IncomeItem {
  id: number;
  month: Month;
  label: string;
  quantity: number;
  unitCents: number;
  isExtra: boolean;
}

export interface Settings {
  alertDaysBefore: number;
  alertTime: string;
  defaultTaxPercent: number;
  weeklySummary: boolean;
}
