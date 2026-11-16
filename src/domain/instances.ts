import { addMonths, diffMonths, dueDateFor } from './month';
import type { BillInstance, BillTemplate, Month } from './types';

export type NewBillInstance = Omit<BillInstance, 'id'>;

export function effectiveEndMonth(template: BillTemplate): Month | null {
  let end = template.endMonth;
  if (template.installmentsTotal !== null) {
    const paid = template.installmentsPaid ?? 0;
    const remaining = Math.max(template.installmentsTotal - paid, 0);
    const byInstallments = addMonths(template.startMonth, remaining - 1);
    if (end === null || byInstallments < end) end = byInstallments;
  }
  return end;
}

export function isTemplateActive(template: BillTemplate, month: Month): boolean {
  if (month < template.startMonth) return false;
  const end = effectiveEndMonth(template);
  return end === null || month <= end;
}

export function installmentNumber(template: BillTemplate, month: Month): number | null {
  if (template.installmentsTotal === null) return null;
  return (template.installmentsPaid ?? 0) + diffMonths(template.startMonth, month) + 1;
}

export function missingInstances(
  templates: BillTemplate[],
  existing: { templateId: number | null; month: Month }[],
  month: Month,
): NewBillInstance[] {
  const present = new Set(
    existing.filter((e) => e.month === month && e.templateId !== null).map((e) => e.templateId),
  );

  return templates
    .filter((t) => isTemplateActive(t, month) && !present.has(t.id))
    .map((t) => ({
      templateId: t.id,
      month,
      name: t.name,
      amountCents: t.amountCents,
      dueDate: dueDateFor(month, t.dueDay),
      status: 'PENDING' as const,
      paidAt: null,
      kind: t.kind,
      amountOverridden: false,
    }));
}
