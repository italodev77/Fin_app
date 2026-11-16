export function formatBRL(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const reais = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, '0');
  const grouped = String(reais).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${negative ? '-' : ''}R$ ${grouped},${rest}`;
}

export function formatPlain(cents: number): string {
  return formatBRL(cents).replace('R$ ', '');
}

export function parseDigitsToCents(text: string): number {
  const digits = text.replace(/\D/g, '');
  return digits === '' ? 0 : parseInt(digits, 10);
}
