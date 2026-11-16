import type {
  BillTemplate,
  Category,
  IncomeItem,
  IncomePlan,
  Transaction,
} from './types';

export type SeedTemplate = Omit<BillTemplate, 'id' | 'categoryId'>;
export type SeedTransaction = Omit<Transaction, 'id' | 'categoryId'>;
export type SeedIncomeItem = Omit<IncomeItem, 'id'>;

export const SEED_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Fixas', kind: 'FIXA' },
  { name: 'Dívidas', kind: 'DIVIDA' },
  { name: 'Avulsas', kind: 'AVULSA' },
];

const START = '2026-12';

function fixed(name: string, amountCents: number): SeedTemplate {
  return {
    name,
    amountCents,
    dueDay: null,
    kind: 'FIXA',
    startMonth: START,
    endMonth: null,
    installmentsTotal: null,
    installmentsPaid: null,
  };
}

function debt(name: string, amountCents: number, endMonth: string | null): SeedTemplate {
  return {
    name,
    amountCents,
    dueDay: null,
    kind: 'DIVIDA',
    startMonth: START,
    endMonth,
    installmentsTotal: null,
    installmentsPaid: null,
  };
}

export const SEED_TEMPLATES: SeedTemplate[] = [
  fixed('Fatura', 160000),
  fixed('Plano de saúde 1', 41300),
  fixed('Plano de saúde 2', 20978),
  fixed('Celular', 8200),
  fixed('Internet', 11377),
  fixed('Aluguel', 90000),
  fixed('Luz', 37000),
  fixed('Água', 8600),
  fixed('Água para beber', 10000),
  fixed('Fraldas e leite', 50000),
  debt('Empréstimo Infinity Pay', 75000, '2026-12'),
  debt('Outro empréstimo', 21810, '2026-12'),
  debt('Empréstimo Italo', 24800, '2026-12'),
  debt('Empréstimo Vitória', 12000, '2026-12'),
  debt('Marisa', 14575, null),
  debt('C&A Pay', 14935, null),
];

export const SEED_TRANSACTIONS: SeedTransaction[] = [
  { type: 'EXPENSE', description: 'Aniversário Tonton', amountCents: 180000, date: '2026-12-01' },
  { type: 'EXPENSE', description: 'Ensaio', amountCents: 45500, date: '2026-12-01' },
];

export const SEED_INCOME_PLANS: IncomePlan[] = [
  { month: '2026-12', mode: 'ITEMS', netCents: null, taxPercent: 5, taxOnExtra: true },
  { month: '2027-01', mode: 'NET', netCents: 1085136, taxPercent: 5, taxOnExtra: true },
];

export const SEED_INCOME_ITEMS: SeedIncomeItem[] = [
  { month: '2026-12', label: 'Diárias', quantity: 23, unitCents: 31400, isExtra: false },
  { month: '2026-12', label: 'Outras diárias', quantity: 21, unitCents: 13000, isExtra: false },
  { month: '2026-12', label: 'Extra', quantity: 1, unitCents: 26000, isExtra: true },
];
