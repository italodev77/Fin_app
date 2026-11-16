import { useState } from 'react';
import { ActivityIndicator, Alert, Switch, View } from 'react-native';
import { saveIncome, type IncomeData } from '@/db/income';
import { computeIncome } from '@/domain/income';
import { formatBRL } from '@/domain/money';
import type { IncomeItem, IncomeMode, IncomePlan, Month } from '@/domain/types';
import { useMonthData } from '@/hooks/useMonthData';
import { useApp } from '@/store/app';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { CurrencyInput } from '@/ui/CurrencyInput';
import { Field, Input } from '@/ui/Field';
import { MonthSwitcher } from '@/ui/MonthSwitcher';
import { Row, Screen } from '@/ui/Screen';
import { Segmented } from '@/ui/Segmented';
import { spacing, useTheme } from '@/ui/theme';
import { Txt } from '@/ui/Txt';

interface DraftItem {
  key: string;
  label: string;
  quantity: string;
  unitCents: number;
  isExtra: boolean;
}

let nextKey = 0;
const newKey = () => `item-${(nextKey += 1)}`;

function parseDecimal(text: string): number {
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
}

export default function Receita() {
  const theme = useTheme();
  const month = useApp((state) => state.month);
  const data = useMonthData(month);

  if (!data) {
    return (
      <Screen>
        <MonthSwitcher />
        <ActivityIndicator color={theme.primary} />
      </Screen>
    );
  }

  return <ReceitaForm key={month} month={month} income={data.income} />;
}

function ReceitaForm({ month, income }: { month: Month; income: IncomeData }) {
  const defaultTax = useApp((state) => state.settings.defaultTaxPercent);
  const refresh = useApp((state) => state.refresh);

  const [mode, setMode] = useState<IncomeMode>(income.plan?.mode ?? 'ITEMS');
  const [netCents, setNetCents] = useState(income.plan?.netCents ?? 0);
  const [taxText, setTaxText] = useState(
    String(income.plan?.taxPercent ?? defaultTax).replace('.', ','),
  );
  const [taxOnExtra, setTaxOnExtra] = useState(income.plan?.taxOnExtra ?? true);
  const [items, setItems] = useState<DraftItem[]>(() =>
    income.items.map((i) => ({
      key: newKey(),
      label: i.label,
      quantity: String(i.quantity).replace('.', ','),
      unitCents: i.unitCents,
      isExtra: i.isExtra,
    })),
  );

  const plan: IncomePlan = {
    month,
    mode,
    netCents: mode === 'NET' ? netCents : null,
    taxPercent: parseDecimal(taxText),
    taxOnExtra,
  };
  const draftItems: IncomeItem[] = items.map((item, index) => ({
    id: index,
    month,
    label: item.label,
    quantity: parseDecimal(item.quantity),
    unitCents: item.unitCents,
    isExtra: item.isExtra,
  }));
  const result = computeIncome(plan, draftItems);

  const patch = (key: string, changes: Partial<DraftItem>) =>
    setItems((list) => list.map((i) => (i.key === key ? { ...i, ...changes } : i)));

  const add = (isExtra: boolean) =>
    setItems((list) => [
      ...list,
      { key: newKey(), label: isExtra ? 'Extra' : '', quantity: '1', unitCents: 0, isExtra },
    ]);

  const save = async () => {
    if (mode === 'ITEMS' && items.some((i) => i.label.trim() === '')) {
      return Alert.alert('Dê um nome para cada item');
    }
    await saveIncome(
      plan,
      mode === 'ITEMS'
        ? draftItems.map((i) => ({
            label: i.label.trim(),
            quantity: i.quantity,
            unitCents: i.unitCents,
            isExtra: i.isExtra,
          }))
        : [],
    );
    refresh();
    Alert.alert('Receita salva');
  };

  return (
    <Screen>
      <MonthSwitcher />
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: 'ITEMS', label: 'Diárias e extras' },
          { value: 'NET', label: 'Valor líquido' },
        ]}
      />

      {mode === 'NET' ? (
        <Field label="Receita líquida do mês">
          <CurrencyInput value={netCents} onChange={setNetCents} />
        </Field>
      ) : (
        <>
          {items.map((item) => (
            <Card key={item.key} style={{ gap: spacing.md }}>
              <Field label={item.isExtra ? 'Extra' : 'Item'}>
                <Input
                  value={item.label}
                  onChangeText={(label) => patch(item.key, { label })}
                  placeholder="Descrição"
                />
              </Field>
              <Row>
                <View style={{ flex: 1 }}>
                  <Field label="Quantidade">
                    <Input
                      keyboardType="decimal-pad"
                      value={item.quantity}
                      onChangeText={(quantity) => patch(item.key, { quantity })}
                    />
                  </Field>
                </View>
                <View style={{ flex: 2 }}>
                  <Field label="Valor unitário">
                    <CurrencyInput
                      value={item.unitCents}
                      onChange={(unitCents) => patch(item.key, { unitCents })}
                    />
                  </Field>
                </View>
              </Row>
              <Button
                label="Remover"
                variant="danger"
                onPress={() => setItems((list) => list.filter((i) => i.key !== item.key))}
              />
            </Card>
          ))}
          <Row>
            <Button label="Adicionar item" variant="secondary" style={{ flex: 1 }} onPress={() => add(false)} />
            <Button label="Adicionar extra" variant="secondary" style={{ flex: 1 }} onPress={() => add(true)} />
          </Row>

          <Field label="Imposto (%)">
            <Input keyboardType="decimal-pad" value={taxText} onChangeText={setTaxText} />
          </Field>
          <Row>
            <Switch value={taxOnExtra} onValueChange={setTaxOnExtra} />
            <Txt style={{ flex: 1 }}>Imposto também incide sobre os extras</Txt>
          </Row>

          <Card style={{ gap: spacing.sm }}>
            <Row>
              <Txt style={{ flex: 1 }} color="muted">
                Bruto
              </Txt>
              <Txt variant="amount">{formatBRL(result.grossCents)}</Txt>
            </Row>
            <Row>
              <Txt style={{ flex: 1 }} color="muted">
                Imposto
              </Txt>
              <Txt variant="amount" color="danger">
                - {formatBRL(result.taxCents)}
              </Txt>
            </Row>
            <Row>
              <Txt style={{ flex: 1 }} variant="heading">
                Líquido
              </Txt>
              <Txt variant="title" color="success">
                {formatBRL(result.netCents)}
              </Txt>
            </Row>
          </Card>
        </>
      )}

      <Button label="Salvar receita" onPress={save} />
    </Screen>
  );
}
