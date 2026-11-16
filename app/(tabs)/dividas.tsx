import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { projectDebt } from '@/domain/debts';
import { isTemplateActive } from '@/domain/instances';
import { formatBRL } from '@/domain/money';
import { shortMonthLabel } from '@/domain/month';
import type { BillTemplate } from '@/domain/types';
import { useMonthData } from '@/hooks/useMonthData';
import { useTemplates } from '@/hooks/useTemplates';
import { useApp } from '@/store/app';
import { BillRow } from '@/ui/BillRow';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { MonthSwitcher } from '@/ui/MonthSwitcher';
import { Screen } from '@/ui/Screen';
import { Section } from '@/ui/Section';
import { spacing, useTheme } from '@/ui/theme';
import { Txt } from '@/ui/Txt';

function projectionText(template: BillTemplate, month: string): string {
  const p = projectDebt(template, month);
  const parts: string[] = [];
  if (p.currentInstallment !== null && p.totalInstallments !== null) {
    parts.push(`Parcela ${p.currentInstallment}/${p.totalInstallments}`);
  }
  if (p.endMonth === null) {
    parts.push('Sem data de término');
  } else {
    parts.push(`Termina em ${shortMonthLabel(p.endMonth)}`);
    const left = p.remainingInstallments ?? 0;
    parts.push(`${left} ${left === 1 ? 'parcela restante' : 'parcelas restantes'}`);
    if (p.remainingCents !== null) parts.push(`${formatBRL(p.remainingCents)} a pagar`);
  }
  return parts.join(' · ');
}

export default function Dividas() {
  const theme = useTheme();
  const router = useRouter();
  const month = useApp((state) => state.month);
  const data = useMonthData(month);
  const templates = useTemplates();

  if (!data || !templates) {
    return (
      <Screen>
        <MonthSwitcher />
        <ActivityIndicator color={theme.primary} />
      </Screen>
    );
  }

  const active = templates.filter((t) => t.kind === 'DIVIDA' && isTemplateActive(t, month));

  return (
    <Screen>
      <MonthSwitcher />
      <Card style={{ gap: spacing.xs }}>
        <Txt variant="caption" color="muted">
          Total de dívidas do mês
        </Txt>
        <Txt variant="title" color="warning">
          {formatBRL(data.summary.debtCents)}
        </Txt>
      </Card>

      <Button
        label="Nova dívida"
        onPress={() => router.push({ pathname: '/conta', params: { kind: 'DIVIDA' } })}
      />

      <Section
        title="Dívidas ativas"
        empty="Nenhuma dívida ativa neste mês"
        isEmpty={active.length === 0}
      >
        {active.map((t) => (
          <BillRow
            key={t.id}
            name={t.name}
            subtitle={projectionText(t, month)}
            amountCents={t.amountCents}
            onPress={() => router.push({ pathname: '/conta', params: { id: String(t.id) } })}
          />
        ))}
      </Section>
    </Screen>
  );
}
