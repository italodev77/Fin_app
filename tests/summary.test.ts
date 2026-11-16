import { displayStatus, summarizeMonth } from '../src/domain/summary';
import { billsFor, summaryFor } from './helpers';

describe('resumo do mês', () => {
  it('fecha os totais de dezembro/2026', () => {
    const s = summaryFor('2026-12');
    expect(s.fixedCents).toBe(437455);
    expect(s.avulsaCents).toBe(225500);
    expect(s.fixedCents + s.avulsaCents).toBe(662955);
    expect(s.debtCents).toBe(163120);
    expect(s.totalExpensesCents).toBe(826075);
    expect(s.incomeNetCents).toBe(970140);
    expect(s.leftoverCents).toBe(144065);
  });

  it('fecha os totais de janeiro/2027', () => {
    const s = summaryFor('2027-01');
    expect(s.fixedCents).toBe(437455);
    expect(s.debtCents).toBe(29510);
    expect(s.totalExpensesCents).toBe(466965);
    expect(s.incomeNetCents).toBe(1085136);
    expect(s.leftoverCents).toBe(618171);
  });

  it('separa já pago e a pagar', () => {
    const bills = billsFor('2026-12').map((b) =>
      b.name === 'Aluguel' ? { ...b, status: 'PAID' as const, paidAt: '2026-12-05' } : b,
    );
    const paid = bills.filter((b) => b.status === 'PAID').reduce((a, b) => a + b.amountCents, 0);
    expect(paid).toBe(90000);

    const s = summaryFor('2026-12');
    expect(s.paidCents + s.toPayCents).toBe(s.totalExpensesCents);
  });

  it('conta avulsas já ocorridas como pagas', () => {
    const before = summaryFor('2026-12', '2026-11-30');
    const after = summaryFor('2026-12', '2026-12-10');
    expect(before.paidCents).toBe(0);
    expect(after.paidCents).toBe(225500);
  });

  it('soma receitas avulsas à sobra', () => {
    const s = summarizeMonth({
      bills: billsFor('2026-12'),
      transactions: [
        {
          id: 1,
          type: 'INCOME',
          description: 'Bônus',
          amountCents: 50000,
          date: '2026-12-02',
          categoryId: null,
        },
      ],
      incomeNetCents: 100000,
      today: '2026-12-01',
    });
    expect(s.extraIncomeCents).toBe(50000);
    expect(s.totalExpensesCents).toBe(600575);
    expect(s.leftoverCents).toBe(150000 - 600575);
  });
});

describe('status derivado', () => {
  const bill = { ...billsFor('2026-12')[0], dueDate: '2026-12-10' };

  it('marca atrasada quando pendente e vencida', () => {
    expect(displayStatus(bill, '2026-12-11')).toBe('OVERDUE');
    expect(displayStatus(bill, '2026-12-10')).toBe('PENDING');
  });

  it('paga nunca é atrasada', () => {
    expect(displayStatus({ ...bill, status: 'PAID' }, '2027-01-01')).toBe('PAID');
  });

  it('sem vencimento não é atrasada', () => {
    expect(displayStatus({ ...bill, dueDate: null }, '2030-01-01')).toBe('PENDING');
  });
});
