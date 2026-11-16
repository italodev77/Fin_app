import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { listCategories } from '@/db/categories';
import { deleteTransaction, getTransaction, saveTransaction } from '@/db/transactions';
import { monthOfDate, todayIso } from '@/domain/month';
import type { Category, TransactionType } from '@/domain/types';
import { useApp } from '@/store/app';
import { Button } from '@/ui/Button';
import { Chips } from '@/ui/Chips';
import { confirmAction } from '@/ui/confirm';
import { CurrencyInput } from '@/ui/CurrencyInput';
import { Field, Input } from '@/ui/Field';
import { DateInput, dateTextToIso, isoToDateText } from '@/ui/MaskedInputs';
import { Screen } from '@/ui/Screen';
import { Segmented } from '@/ui/Segmented';

export default function LancamentoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const month = useApp((state) => state.month);
  const refresh = useApp((state) => state.refresh);
  const editingId = id ? Number(id) : null;

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [dateText, setDateText] = useState(() => {
    const today = todayIso();
    return isoToDateText(monthOfDate(today) === month ? today : `${month}-01`);
  });
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await listCategories();
      const existing = editingId !== null ? await getTransaction(editingId) : null;
      if (cancelled) return;
      setCategories(list);
      if (existing) {
        setType(existing.type);
        setDescription(existing.description);
        setAmount(existing.amountCents);
        setDateText(isoToDateText(existing.date));
        setCategoryId(existing.categoryId);
      } else {
        setCategoryId(list.find((c) => c.kind === 'AVULSA')?.id ?? null);
      }
    })().catch((error) => console.warn('Falha ao carregar lançamento', error));
    return () => {
      cancelled = true;
    };
  }, [editingId]);

  const save = async () => {
    const date = dateTextToIso(dateText);
    if (description.trim() === '') return Alert.alert('Informe a descrição');
    if (amount <= 0) return Alert.alert('Informe um valor maior que zero');
    if (date === null) return Alert.alert('Data inválida');

    await saveTransaction({
      id: editingId ?? undefined,
      type,
      description: description.trim(),
      amountCents: amount,
      date,
      categoryId,
    });
    refresh();
    router.back();
  };

  const remove = () => {
    if (editingId === null) return;
    confirmAction('Excluir lançamento', 'Esta ação não pode ser desfeita.', 'Excluir', async () => {
      await deleteTransaction(editingId);
      refresh();
      router.back();
    });
  };

  return (
    <Screen>
      <Segmented
        value={type}
        onChange={setType}
        options={[
          { value: 'EXPENSE', label: 'Despesa' },
          { value: 'INCOME', label: 'Receita' },
        ]}
      />
      <Field label="Descrição">
        <Input value={description} onChangeText={setDescription} placeholder="Ex.: Fraldas" />
      </Field>
      <Field label="Valor">
        <CurrencyInput value={amount} onChange={setAmount} />
      </Field>
      <Field label="Data">
        <DateInput value={dateText} onChangeText={setDateText} />
      </Field>
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
