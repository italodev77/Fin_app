import { Input } from './Field';

function maskDate(digits: string): string {
  const d = digits.slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function maskMonth(digits: string): string {
  const d = digits.slice(0, 6);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
}

function maskTime(digits: string): string {
  const d = digits.slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`;
}

export function isoToDateText(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function dateTextToIso(text: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return null;
  const [, d, m, y] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  const valid =
    date.getUTCFullYear() === Number(y) &&
    date.getUTCMonth() === Number(m) - 1 &&
    date.getUTCDate() === Number(d);
  return valid ? `${y}-${m}-${d}` : null;
}

export function monthToText(month: string | null): string {
  if (!month) return '';
  const [y, m] = month.split('-');
  return `${m}/${y}`;
}

export function monthTextToValue(text: string): string | null {
  const match = /^(0[1-9]|1[0-2])\/(\d{4})$/.exec(text);
  return match ? `${match[2]}-${match[1]}` : null;
}

export function isValidTime(text: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(text);
}

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

function masked(mask: (digits: string) => string, onChangeText: (text: string) => void) {
  return (text: string) => onChangeText(mask(text.replace(/\D/g, '')));
}

export function DateInput({ value, onChangeText, placeholder = 'DD/MM/AAAA' }: Props) {
  return (
    <Input
      keyboardType="number-pad"
      value={value}
      placeholder={placeholder}
      onChangeText={masked(maskDate, onChangeText)}
      maxLength={10}
    />
  );
}

export function MonthInput({ value, onChangeText, placeholder = 'MM/AAAA' }: Props) {
  return (
    <Input
      keyboardType="number-pad"
      value={value}
      placeholder={placeholder}
      onChangeText={masked(maskMonth, onChangeText)}
      maxLength={7}
    />
  );
}

export function TimeInput({ value, onChangeText, placeholder = 'HH:MM' }: Props) {
  return (
    <Input
      keyboardType="number-pad"
      value={value}
      placeholder={placeholder}
      onChangeText={masked(maskTime, onChangeText)}
      maxLength={5}
    />
  );
}
