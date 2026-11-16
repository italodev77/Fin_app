import { computeIncome } from '../src/domain/income';
import type { IncomeItem, IncomePlan } from '../src/domain/types';

const items: IncomeItem[] = [
  { id: 1, month: '2026-12', label: 'Diárias', quantity: 23, unitCents: 31400, isExtra: false },
  { id: 2, month: '2026-12', label: 'Outras', quantity: 21, unitCents: 13000, isExtra: false },
  { id: 3, month: '2026-12', label: 'Extra', quantity: 1, unitCents: 26000, isExtra: true },
];

const plan: IncomePlan = {
  month: '2026-12',
  mode: 'ITEMS',
  netCents: null,
  taxPercent: 5,
  taxOnExtra: true,
};

describe('computeIncome', () => {
  it('calcula o líquido de dezembro com imposto sobre o total', () => {
    expect(computeIncome(plan, items)).toEqual({
      grossCents: 1021200,
      taxCents: 51060,
      netCents: 970140,
    });
  });

  it('exclui o extra do imposto quando configurado', () => {
    const result = computeIncome({ ...plan, taxOnExtra: false }, items);
    expect(result.grossCents).toBe(1021200);
    expect(result.taxCents).toBe(49760);
    expect(result.netCents).toBe(971440);
  });

  it('usa o líquido informado no modo NET', () => {
    const result = computeIncome(
      { month: '2027-01', mode: 'NET', netCents: 1085136, taxPercent: 5, taxOnExtra: true },
      [],
    );
    expect(result.netCents).toBe(1085136);
    expect(result.taxCents).toBe(0);
  });

  it('retorna zero sem plano', () => {
    expect(computeIncome(null, items).netCents).toBe(0);
  });

  it('arredonda quantidades fracionadas em centavos inteiros', () => {
    const half: IncomeItem[] = [
      { id: 1, month: '2026-12', label: 'Horas', quantity: 2.5, unitCents: 3333, isExtra: false },
    ];
    const result = computeIncome({ ...plan, taxPercent: 0 }, half);
    expect(Number.isInteger(result.netCents)).toBe(true);
    expect(result.grossCents).toBe(8333);
  });
});
