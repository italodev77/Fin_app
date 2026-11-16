import type { BillInstance, DisplayStatus, IsoDate, Transaction } from './types';

export interface MonthSummary {
  incomeNetCents: number;
  extraIncomeCents: number;
  fixedCents: number;
  debtCents: number;
  avulsaCents: number;
  totalExpensesCents: number;
  paidCents: number;
  toPayCents: number;
  leftoverCents: number;
}

export function displayStatus(bill: BillInstance, today: IsoDate): DisplayStatus {
  if (bill.status === 'PAID') return 'PAID';
  if (bill.dueDate !== null && bill.dueDate < today) return 'OVERDUE';
  return 'PENDING';
}

export function summarizeMonth(input: {
  bills: BillInstance[];
  transactions: Transaction[];
  incomeNetCents: number;
  today: IsoDate;
}): MonthSummary {
  const { bills, transactions, incomeNetCents, today } = input;

  const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0);
  const expenses = transactions.filter((t) => t.type === 'EXPENSE');

  const fixedCents = sum(bills.filter((b) => b.kind === 'FIXA').map((b) => b.amountCents));
  const debtCents = sum(bills.filter((b) => b.kind === 'DIVIDA').map((b) => b.amountCents));
  const avulsaCents = sum(expenses.map((t) => t.amountCents));
  const extraIncomeCents = sum(
    transactions.filter((t) => t.type === 'INCOME').map((t) => t.amountCents),
  );

  const totalExpensesCents = fixedCents + debtCents + avulsaCents;
  const paidCents =
    sum(bills.filter((b) => b.status === 'PAID').map((b) => b.amountCents)) +
    sum(expenses.filter((t) => t.date <= today).map((t) => t.amountCents));

  return {
    incomeNetCents,
    extraIncomeCents,
    fixedCents,
    debtCents,
    avulsaCents,
    totalExpensesCents,
    paidCents,
    toPayCents: totalExpensesCents - paidCents,
    leftoverCents: incomeNetCents + extraIncomeCents - totalExpensesCents,
  };
}
