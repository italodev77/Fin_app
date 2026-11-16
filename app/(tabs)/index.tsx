import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { setPaid } from '@/db/instances';
import { formatDayMonth } from '@/domain/month';
import type { BillInstance } from '@/domain/types';
import { useMonthData } from '@/hooks/useMonthData';
import { useApp } from '@/store/app';
import { BillRow } from '@/ui/BillRow';
import { MonthSwitcher } from '@/ui/MonthSwitcher';
import { Screen } from '@/ui/Screen';
import { Section } from '@/ui/Section';
import { billBadge, dueText } from '@/ui/status';
import { SummaryCards } from '@/ui/SummaryCards';
import { useTheme } from '@/ui/theme';

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const month = useApp((state) => state.month);
  const refresh = useApp((state) => state.refresh);
  const data = useMonthData(month);

  if (!data) {
    return (
      <Screen>
        <MonthSwitcher />
        <ActivityIndicator color={theme.primary} />
      </Screen>
    );
  }

  const toggle = async (bill: BillInstance) => {
    await setPaid(bill.id, bill.status === 'PAID' ? null : data.today);
    refresh();
  };

  const renderBill = (bill: BillInstance) => (
    <BillRow
      key={bill.id}
      name={bill.name}
      subtitle={
        bill.status === 'PAID' && bill.paidAt
          ? `Paga em ${formatDayMonth(bill.paidAt)}`
          : dueText(bill)
      }
      amountCents={bill.amountCents}
      badge={billBadge(bill, data.today)}
      paid={bill.status === 'PAID'}
      onToggle={() => toggle(bill)}
      onPress={() => router.push({ pathname: '/instancia', params: { id: String(bill.id) } })}
    />
  );

  const fixed = data.bills.filter((b) => b.kind === 'FIXA');
  const debts = data.bills.filter((b) => b.kind === 'DIVIDA');

  return (
    <Screen>
      <MonthSwitcher />
      <SummaryCards summary={data.summary} />

      <Section
        title="Fixas"
        totalCents={data.summary.fixedCents}
        empty="Nenhuma conta fixa neste mês"
        isEmpty={fixed.length === 0}
      >
        {fixed.map(renderBill)}
      </Section>

      <Section
        title="Dívidas"
        totalCents={data.summary.debtCents}
        empty="Nenhuma dívida neste mês"
        isEmpty={debts.length === 0}
      >
        {debts.map(renderBill)}
      </Section>

      <Section
        title="Avulsas"
        totalCents={data.summary.avulsaCents}
        empty="Nenhum lançamento avulso neste mês"
        isEmpty={data.transactions.length === 0}
      >
        {data.transactions.map((t) => (
          <BillRow
            key={t.id}
            name={t.description}
            subtitle={formatDayMonth(t.date)}
            amountCents={t.amountCents}
            signed={t.type === 'INCOME' ? '+' : undefined}
            onPress={() => router.push({ pathname: '/lancamento', params: { id: String(t.id) } })}
          />
        ))}
      </Section>
    </Screen>
  );
}
