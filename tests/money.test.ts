import { formatBRL, formatPlain, parseDigitsToCents } from '../src/domain/money';

describe('money', () => {
  it('formata centavos em pt-BR', () => {
    expect(formatBRL(160000)).toBe('R$ 1.600,00');
    expect(formatBRL(5)).toBe('R$ 0,05');
    expect(formatBRL(0)).toBe('R$ 0,00');
    expect(formatBRL(1085136)).toBe('R$ 10.851,36');
    expect(formatBRL(123456789)).toBe('R$ 1.234.567,89');
  });

  it('formata valores negativos', () => {
    expect(formatBRL(-144065)).toBe('-R$ 1.440,65');
  });

  it('formata sem símbolo', () => {
    expect(formatPlain(90000)).toBe('900,00');
  });

  it('converte digitação em centavos', () => {
    expect(parseDigitsToCents('1.600,00')).toBe(160000);
    expect(parseDigitsToCents('')).toBe(0);
    expect(parseDigitsToCents('R$ 0,07')).toBe(7);
  });
});
