import type {
  BillInstance,
  BillTemplate,
  Category,
  IncomeItem,
  IncomePlan,
  Transaction,
} from '@/domain/types';

export interface CategoryRow {
  id: number;
  name: string;
  kind: Category['kind'];
}

export interface TemplateRow {
  id: number;
  name: string;
  amount_cents: number;
  category_id: number | null;
  due_day: number | null;
  kind: BillTemplate['kind'];
  start_month: string;
  end_month: string | null;
  installments_total: number | null;
  installments_paid: number | null;
}

export interface InstanceRow {
  id: number;
  template_id: number | null;
  month: string;
  name: string;
  amount_cents: number;
  due_date: string | null;
  status: BillInstance['status'];
  paid_at: string | null;
  kind: BillInstance['kind'];
  amount_overridden: number;
}

export interface TransactionRow {
  id: number;
  type: Transaction['type'];
  description: string;
  amount_cents: number;
  date: string;
  category_id: number | null;
}

export interface IncomePlanRow {
  month: string;
  mode: IncomePlan['mode'];
  net_cents: number | null;
  tax_percent: number;
  tax_on_extra: number;
}

export interface IncomeItemRow {
  id: number;
  month: string;
  label: string;
  quantity: number;
  unit_cents: number;
  is_extra: number;
}

export const toCategory = (r: CategoryRow): Category => ({ id: r.id, name: r.name, kind: r.kind });

export const toTemplate = (r: TemplateRow): BillTemplate => ({
  id: r.id,
  name: r.name,
  amountCents: r.amount_cents,
  categoryId: r.category_id,
  dueDay: r.due_day,
  kind: r.kind,
  startMonth: r.start_month,
  endMonth: r.end_month,
  installmentsTotal: r.installments_total,
  installmentsPaid: r.installments_paid,
});

export const toInstance = (r: InstanceRow): BillInstance => ({
  id: r.id,
  templateId: r.template_id,
  month: r.month,
  name: r.name,
  amountCents: r.amount_cents,
  dueDate: r.due_date,
  status: r.status,
  paidAt: r.paid_at,
  kind: r.kind,
  amountOverridden: r.amount_overridden === 1,
});

export const toTransaction = (r: TransactionRow): Transaction => ({
  id: r.id,
  type: r.type,
  description: r.description,
  amountCents: r.amount_cents,
  date: r.date,
  categoryId: r.category_id,
});

export const toIncomePlan = (r: IncomePlanRow): IncomePlan => ({
  month: r.month,
  mode: r.mode,
  netCents: r.net_cents,
  taxPercent: r.tax_percent,
  taxOnExtra: r.tax_on_extra === 1,
});

export const toIncomeItem = (r: IncomeItemRow): IncomeItem => ({
  id: r.id,
  month: r.month,
  label: r.label,
  quantity: r.quantity,
  unitCents: r.unit_cents,
  isExtra: r.is_extra === 1,
});
