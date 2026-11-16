import {
  MAX_SCHEDULED,
  planBillNotifications,
  planNotifications,
  planWeeklySummaries,
} from '../src/domain/notifications';
import { DEFAULT_SETTINGS } from '../src/domain/settings';
import type { BillInstance, Settings } from '../src/domain/types';

function bill(overrides: Partial<BillInstance>): BillInstance {
  return {
    id: 1,
    templateId: 1,
    month: '2026-12',
    name: 'Aluguel',
    amountCents: 90000,
    dueDate: '2026-12-10',
    status: 'PENDING',
    paidAt: null,
    kind: 'FIXA',
    amountOverridden: false,
    ...overrides,
  };
}

const now = new Date(2026, 11, 1, 8, 0, 0);

describe('notificações de vencimento', () => {
  it('agenda N dias antes e no dia, no horário configurado', () => {
    const result = planBillNotifications([bill({})], DEFAULT_SETTINGS, now);
    expect(result).toHaveLength(2);
    expect(result[0].fireAt).toEqual(new Date(2026, 11, 7, 9, 0));
    expect(result[0].body).toBe('Aluguel vence em 3 dias — R$ 900,00');
    expect(result[1].fireAt).toEqual(new Date(2026, 11, 10, 9, 0));
    expect(result[1].body).toBe('Aluguel vence hoje — R$ 900,00');
  });

  it('respeita antecedência e horário customizados', () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, alertDaysBefore: 1, alertTime: '18:30' };
    const result = planBillNotifications([bill({})], settings, now);
    expect(result[0].fireAt).toEqual(new Date(2026, 11, 9, 18, 30));
    expect(result[0].body).toBe('Aluguel vence amanhã — R$ 900,00');
  });

  it('não duplica quando a antecedência é zero', () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, alertDaysBefore: 0 };
    expect(planBillNotifications([bill({})], settings, now)).toHaveLength(1);
  });

  it('ignora contas pagas, sem vencimento e horários passados', () => {
    const paid = bill({ id: 2, status: 'PAID', paidAt: '2026-12-02' });
    const none = bill({ id: 3, dueDate: null });
    const past = bill({ id: 4, dueDate: '2026-11-30' });
    const result = planBillNotifications([paid, none, past], DEFAULT_SETTINGS, now);
    expect(result).toHaveLength(0);
  });

  it('mantém só o aviso do dia quando o de antecedência já passou', () => {
    const soon = bill({ dueDate: '2026-12-03' });
    const result = planBillNotifications([soon], DEFAULT_SETTINGS, now);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('bill-1-0');
  });

  it('cancela ao pagar: conta paga sai do plano', () => {
    const pending = planBillNotifications([bill({})], DEFAULT_SETTINGS, now);
    const paid = planBillNotifications(
      [bill({ status: 'PAID', paidAt: '2026-12-02' })],
      DEFAULT_SETTINGS,
      now,
    );
    expect(pending).toHaveLength(2);
    expect(paid).toHaveLength(0);
  });
});

describe('resumo semanal', () => {
  const weekly: Settings = { ...DEFAULT_SETTINGS, weeklySummary: true };
  const monday = new Date(2026, 10, 30, 8, 0, 0);

  it('fica desligado por padrão', () => {
    expect(planWeeklySummaries([bill({})], DEFAULT_SETTINGS, monday)).toHaveLength(0);
  });

  it('resume as contas dos próximos 7 dias', () => {
    const bills = [
      bill({ id: 1, dueDate: '2026-12-01', amountCents: 50000 }),
      bill({ id: 2, dueDate: '2026-12-04', amountCents: 40000 }),
      bill({ id: 3, dueDate: '2026-12-06', amountCents: 33000 }),
      bill({ id: 4, dueDate: '2026-12-06', amountCents: 100000, status: 'PAID' }),
      bill({ id: 5, dueDate: '2026-12-20', amountCents: 999 }),
    ];
    const result = planWeeklySummaries(bills, weekly, monday);
    expect(result[0].fireAt).toEqual(new Date(2026, 10, 30, 9, 0));
    expect(result[0].body).toBe('Você tem 3 contas nos próximos 7 dias — R$ 1.230,00');
  });

  it('usa singular para uma conta', () => {
    const result = planWeeklySummaries([bill({ dueDate: '2026-12-02' })], weekly, monday);
    expect(result[0].body).toBe('Você tem 1 conta nos próximos 7 dias — R$ 900,00');
  });
});

describe('plano completo', () => {
  it('ordena por data e limita a quantidade', () => {
    const many = Array.from({ length: 80 }, (_, i) =>
      bill({ id: i + 1, dueDate: `2026-12-${String((i % 28) + 1).padStart(2, '0')}` }),
    );
    const plan = planNotifications(many, DEFAULT_SETTINGS, new Date(2026, 10, 1));
    expect(plan).toHaveLength(MAX_SCHEDULED);
    for (let i = 1; i < plan.length; i += 1) {
      expect(plan[i].fireAt.getTime()).toBeGreaterThanOrEqual(plan[i - 1].fireAt.getTime());
    }
  });
});
