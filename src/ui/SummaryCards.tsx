import { View } from 'react-native';
import { formatBRL } from '@/domain/money';
import type { MonthSummary } from '@/domain/summary';
import { Card } from './Card';
import { spacing, type Theme } from './theme';
import { Txt } from './Txt';

function Metric({
  label,
  cents,
  color = 'text',
  wide,
}: {
  label: string;
  cents: number;
  color?: keyof Theme;
  wide?: boolean;
}) {
  return (
    <Card style={{ flexBasis: wide ? '100%' : '48%', flexGrow: 1, gap: spacing.xs }}>
      <Txt variant="caption" color="muted">
        {label}
      </Txt>
      <Txt variant={wide ? 'title' : 'heading'} color={color}>
        {formatBRL(cents)}
      </Txt>
    </Card>
  );
}

export function SummaryCards({ summary }: { summary: MonthSummary }) {
  const income = summary.incomeNetCents + summary.extraIncomeCents;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
      <Metric
        wide
        label="Sobra"
        cents={summary.leftoverCents}
        color={summary.leftoverCents < 0 ? 'danger' : 'success'}
      />
      <Metric label="Receita líquida" cents={income} />
      <Metric label="Total de despesas" cents={summary.totalExpensesCents} />
      <Metric label="Já pago" cents={summary.paidCents} color="success" />
      <Metric label="A pagar" cents={summary.toPayCents} color="warning" />
    </View>
  );
}
