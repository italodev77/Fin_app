import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { effectiveEndMonth } from '@/domain/instances';
import { shortMonthLabel } from '@/domain/month';
import type { BillKind, BillTemplate } from '@/domain/types';
import { useTemplates } from '@/hooks/useTemplates';
import { BillRow } from '@/ui/BillRow';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Section } from '@/ui/Section';
import type { StatusBadge } from '@/ui/status';
import { useTheme } from '@/ui/theme';

const MISSING_DUE: StatusBadge = {
  label: 'Defina o vencimento',
  color: 'warning',
  background: 'warningBg',
};

function describe(template: BillTemplate): string {
  const day = template.dueDay === null ? 'Sem vencimento' : `Vence dia ${template.dueDay}`;
  const end = effectiveEndMonth(template);
  const range = end
    ? `${shortMonthLabel(template.startMonth)} a ${shortMonthLabel(end)}`
    : `desde ${shortMonthLabel(template.startMonth)}`;
  return `${day} · ${range}`;
}

export default function Recorrentes() {
  const theme = useTheme();
  const router = useRouter();
  const templates = useTemplates();

  if (!templates) {
    return (
      <Screen>
        <ActivityIndicator color={theme.primary} />
      </Screen>
    );
  }

  const open = (id?: number, kind?: BillKind) =>
    router.push({
      pathname: '/conta',
      params: { ...(id !== undefined ? { id: String(id) } : {}), ...(kind ? { kind } : {}) },
    });

  const renderGroup = (title: string, kind: BillKind, empty: string) => {
    const list = templates.filter((t) => t.kind === kind);
    return (
      <Section title={title} empty={empty} isEmpty={list.length === 0}>
        {list.map((t) => (
          <BillRow
            key={t.id}
            name={t.name}
            subtitle={describe(t)}
            amountCents={t.amountCents}
            badge={t.dueDay === null ? MISSING_DUE : undefined}
            onPress={() => open(t.id)}
          />
        ))}
      </Section>
    );
  };

  return (
    <Screen>
      <Button label="Nova conta recorrente" onPress={() => open()} />
      {renderGroup('Fixas', 'FIXA', 'Nenhuma conta fixa cadastrada')}
      {renderGroup('Dívidas', 'DIVIDA', 'Nenhuma dívida cadastrada')}
    </Screen>
  );
}
