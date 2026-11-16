import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { listCategories } from '@/db/categories';
import { deleteTemplate, getTemplate, saveTemplate } from '@/db/templates';
import { monthOfDate, todayIso } from '@/domain/month';
import type { BillKind, Category } from '@/domain/types';
import { useApp } from '@/store/app';
import { Button } from '@/ui/Button';
import { Chips } from '@/ui/Chips';
import { confirmAction } from '@/ui/confirm';
import { CurrencyInput } from '@/ui/CurrencyInput';
import { Field, Input } from '@/ui/Field';
import { MonthInput, monthTextToValue, monthToText } from '@/ui/MaskedInputs';
import { Screen } from '@/ui/Screen';
import { Segmented } from '@/ui/Segmented';

function toInt(text: string): number | null {
  const digits = text.replace(/\D/g, '');
  return digits === '' ? null : parseInt(digits, 10);
}

export default function ContaScreen() {
  const params = useLocalSearchParams<{ id?: string; kind?: string }>();
  const router = useRouter();
  const month = useApp((state) => state.month);
  const refresh = useApp((state) => state.refresh);
  const editingId = params.id ? Number(params.id) : null;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [kind, setKind] = useState<BillKind>(params.kind === 'DIVIDA' ? 'DIVIDA' : 'FIXA');
  const [dueDay, setDueDay] = useState('');
  const [startText, setStartText] = useState(monthToText(month));
  const [endText, setEndText] = useState('');
  const [total, setTotal] = useState('');
  const [current, setCurrent] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    (async () => {
      const list = await listCategories();
      const existing = editingId !== null ? await getTemplate(editingId) : null;
      setCategories(list);
      if (existing) {
        setName(existing.name);
        setAmount(existing.amountCents);
        setKind(existing.kind);
        setDueDay(existing.dueDay === null ? '' : String(existing.dueDay));
        setStartText(monthToText(existing.startMonth));
        setEndText(monthToText(existing.endMonth));
        setTotal(existing.installmentsTotal === null ? '' : String(existing.installmentsTotal));
        setCurrent(
          existing.installmentsTotal === null
            ? ''
            : String((existing.installmentsPaid ?? 0) + 1),
        );
        setCategoryId(existing.categoryId);
      } else {
        const preferred = params.kind === 'DIVIDA' ? 'DIVIDA' : 'FIXA';
        setCategoryId(list.find((c) => c.kind === preferred)?.id ?? null);
      }
    })().catch((error) => console.warn('Falha ao carregar conta', error));
  }, [editingId, params.kind]);

  const save = async () => {
    const startMonth = monthTextToValue(startText);
    const endMonth = endText === '' ? null : monthTextToValue(endText);
    const day = toInt(dueDay);
    const installmentsTotal = kind === 'DIVIDA' ? toInt(total) : null;
    const currentInstallment = toInt(current) ?? 1;

    if (name.trim() === '') return Alert.alert('Informe o nome');
    if (amount <= 0) return Alert.alert('Informe um valor maior que zero');
    if (day !== null && (day < 1 || day > 31)) return Alert.alert('O dia deve estar entre 1 e 31');
    if (startMonth === null) return Alert.alert('Mês de início inválido');
    if (endText !== '' && endMonth === null) return Alert.alert('Mês final inválido');
    if (endMonth !== null && endMonth < startMonth) {
      return Alert.alert('O mês final deve ser igual ou posterior ao início');
    }
    if (installmentsTotal !== null) {
      if (installmentsTotal < 1) return Alert.alert('Informe o total de parcelas');
      if (currentInstallment < 1 || currentInstallment > installmentsTotal) {
        return Alert.alert('A parcela atual deve estar entre 1 e o total');
      }
    }

    await saveTemplate(
      {
        id: editingId ?? undefined,
        name: name.trim(),
        amountCents: amount,
        categoryId,
        dueDay: day,
        kind,
        startMonth,
        endMonth,
        installmentsTotal,
        installmentsPaid: installmentsTotal === null ? null : currentInstallment - 1,
      },
      monthOfDate(todayIso()),
    );
    refresh();
    router.back();
  };

  const remove = () => {
    if (editingId === null) return;
    confirmAction(
      'Excluir conta',
      'As ocorrências pendentes a partir deste mês serão removidas. Meses já pagos são mantidos.',
      'Excluir',
      async () => {
        await deleteTemplate(editingId, monthOfDate(todayIso()));
        refresh();
        router.back();
      },
    );
  };

  return (
    <Screen>
      <Segmented
        value={kind}
        onChange={setKind}
        options={[
          { value: 'FIXA', label: 'Fixa' },
          { value: 'DIVIDA', label: 'Dívida' },
        ]}
      />
      <Field label="Nome">
        <Input value={name} onChangeText={setName} placeholder="Ex.: Aluguel" />
      </Field>
      <Field label={kind === 'DIVIDA' ? 'Valor da parcela' : 'Valor'}>
        <CurrencyInput value={amount} onChange={setAmount} />
      </Field>
      <Field label="Dia do vencimento" hint="Em meses mais curtos usa o último dia">
        <Input
          keyboardType="number-pad"
          value={dueDay}
          onChangeText={(t) => setDueDay(t.replace(/\D/g, '').slice(0, 2))}
          placeholder="1 a 31"
        />
      </Field>
      <Field label="Mês de início">
        <MonthInput value={startText} onChangeText={setStartText} />
      </Field>
      <Field label="Mês final (opcional)">
        <MonthInput value={endText} onChangeText={setEndText} />
      </Field>
      {kind === 'DIVIDA' ? (
        <>
          <Field label="Total de parcelas (opcional)">
            <Input
              keyboardType="number-pad"
              value={total}
              onChangeText={(t) => setTotal(t.replace(/\D/g, '').slice(0, 3))}
            />
          </Field>
          {total !== '' ? (
            <Field label="Parcela atual no mês de início">
              <Input
                keyboardType="number-pad"
                value={current}
                onChangeText={(t) => setCurrent(t.replace(/\D/g, '').slice(0, 3))}
                placeholder="1"
              />
            </Field>
          ) : null}
        </>
      ) : null}
      <Field label="Categoria">
        <Chips
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          value={categoryId}
          onChange={setCategoryId}
        />
      </Field>
      <Button label="Salvar" onPress={save} />
      {editingId !== null ? <Button label="Excluir" variant="danger" onPress={remove} /> : null}
    </Screen>
  );
}
