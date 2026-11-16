import { projectDebt } from '../src/domain/debts';
import type { BillTemplate } from '../src/domain/types';
import { templates } from './helpers';

const loan: BillTemplate = {
  id: 1,
  name: 'Empréstimo',
  amountCents: 30000,
  categoryId: null,
  dueDay: 10,
  kind: 'DIVIDA',
  startMonth: '2026-10',
  endMonth: null,
  installmentsTotal: 6,
  installmentsPaid: 0,
};

describe('projeção de dívidas', () => {
  it('projeta término e saldo restante', () => {
    const p = projectDebt(loan, '2026-12');
    expect(p.endMonth).toBe('2027-03');
    expect(p.currentInstallment).toBe(3);
    expect(p.remainingInstallments).toBe(4);
    expect(p.remainingCents).toBe(120000);
  });

  it('retorna zero após o término', () => {
    const p = projectDebt(loan, '2027-04');
    expect(p.remainingInstallments).toBe(0);
    expect(p.remainingCents).toBe(0);
    expect(p.currentInstallment).toBeNull();
  });

  it('conta desde o início quando o mês é anterior', () => {
    const p = projectDebt(loan, '2026-05');
    expect(p.remainingInstallments).toBe(6);
    expect(p.currentInstallment).toBe(1);
  });

  it('usa o mês final das dívidas sem parcelas', () => {
    const infinity = templates.find((t) => t.name === 'Empréstimo Infinity Pay') as BillTemplate;
    const p = projectDebt(infinity, '2026-12');
    expect(p.endMonth).toBe('2026-12');
    expect(p.remainingInstallments).toBe(1);
    expect(p.currentInstallment).toBeNull();
  });

  it('deixa em aberto a dívida sem fim', () => {
    const marisa = templates.find((t) => t.name === 'Marisa') as BillTemplate;
    const p = projectDebt(marisa, '2026-12');
    expect(p.endMonth).toBeNull();
    expect(p.remainingCents).toBeNull();
  });
});
