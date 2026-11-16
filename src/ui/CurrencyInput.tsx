import { formatPlain, parseDigitsToCents } from '@/domain/money';
import { Input } from './Field';

const MAX_CENTS = 99999999999;

interface Props {
  value: number;
  onChange: (cents: number) => void;
  placeholder?: string;
}

export function CurrencyInput({ value, onChange, placeholder }: Props) {
  return (
    <Input
      keyboardType="number-pad"
      value={`R$ ${formatPlain(value)}`}
      placeholder={placeholder}
      onChangeText={(text) => onChange(Math.min(parseDigitsToCents(text), MAX_CENTS))}
      selectTextOnFocus
    />
  );
}
