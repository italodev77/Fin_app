import {
  addDays,
  addMonths,
  daysBetween,
  diffMonths,
  dueDateFor,
  monthLabel,
  weekday,
} from '../src/domain/month';

describe('month', () => {
  it('soma e subtrai meses atravessando o ano', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2027-01', -1)).toBe('2026-12');
    expect(addMonths('2026-01', -13)).toBe('2024-12');
    expect(diffMonths('2026-12', '2027-03')).toBe(3);
  });

  it('ajusta o vencimento para o último dia do mês', () => {
    expect(dueDateFor('2027-02', 31)).toBe('2027-02-28');
    expect(dueDateFor('2028-02', 31)).toBe('2028-02-29');
    expect(dueDateFor('2026-12', 5)).toBe('2026-12-05');
    expect(dueDateFor('2026-12', null)).toBeNull();
  });

  it('opera sobre datas', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(daysBetween('2026-12-01', '2026-12-25')).toBe(24);
    expect(weekday('2026-11-16')).toBe(1);
  });

  it('gera rótulo do mês', () => {
    expect(monthLabel('2026-12')).toBe('Dezembro de 2026');
  });
});
