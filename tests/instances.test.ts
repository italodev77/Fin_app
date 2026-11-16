import {
  effectiveEndMonth,
  installmentNumber,
  isTemplateActive,
  missingInstances,
} from '../src/domain/instances';
import type { BillTemplate } from '../src/domain/types';
import { templates } from './helpers';

const base: BillTemplate = {
  id: 99,
  name: 'Parcelado',
  amountCents: 10000,
  categoryId: null,
  dueDay: 10,
  kind: 'DIVIDA',
  startMonth: '2026-12',
  endMonth: null,
  installmentsTotal: 3,
  installmentsPaid: 0,
};

describe('geração de instâncias', () => {
  it('gera as contas ativas de dezembro e de janeiro', () => {
    expect(missingInstances(templates, [], '2026-12')).toHaveLength(16);
    expect(missingInstances(templates, [], '2027-01')).toHaveLength(12);
  });

  it('não gera antes do mês de início', () => {
    expect(missingInstances(templates, [], '2026-11')).toHaveLength(0);
  });

  it('é idempotente', () => {
    const first = missingInstances(templates, [], '2026-12');
    const existing = first.map((b) => ({ templateId: b.templateId, month: b.month }));
    expect(missingInstances(templates, existing, '2026-12')).toHaveLength(0);
  });

  it('gera apenas o que falta', () => {
    const existing = [{ templateId: 1, month: '2026-12' }];
    const created = missingInstances(templates, existing, '2026-12');
    expect(created).toHaveLength(15);
    expect(created.some((b) => b.templateId === 1)).toBe(false);
  });

  it('calcula a data de vencimento ajustando o fim do mês', () => {
    const [instance] = missingInstances([{ ...base, dueDay: 31 }], [], '2027-02');
    expect(instance.dueDate).toBe('2027-02-28');
  });

  it('deixa a data em branco sem dia de vencimento', () => {
    const [instance] = missingInstances([{ ...base, dueDay: null }], [], '2026-12');
    expect(instance.dueDate).toBeNull();
  });
});

describe('parcelas', () => {
  it('encerra após a última parcela', () => {
    expect(effectiveEndMonth(base)).toBe('2027-02');
    expect(isTemplateActive(base, '2027-02')).toBe(true);
    expect(isTemplateActive(base, '2027-03')).toBe(false);
  });

  it('considera parcelas já pagas antes do início', () => {
    const paid = { ...base, installmentsPaid: 2 };
    expect(effectiveEndMonth(paid)).toBe('2026-12');
    expect(installmentNumber(paid, '2026-12')).toBe(3);
  });

  it('respeita o mês final quando ele vem antes das parcelas', () => {
    expect(effectiveEndMonth({ ...base, endMonth: '2027-01' })).toBe('2027-01');
  });

  it('numera a parcela do mês', () => {
    expect(installmentNumber(base, '2027-01')).toBe(2);
    expect(installmentNumber({ ...base, installmentsTotal: null }, '2027-01')).toBeNull();
  });
});
