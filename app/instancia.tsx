import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { getInstance, updateInstance } from '@/db/instances';
import { getTemplate } from '@/db/templates';
import { monthLabel } from '@/domain/month';
import type { BillInstance } from '@/domain/types';
import { useApp } from '@/store/app';
import { Button } from '@/ui/Button';
import { CurrencyInput } from '@/ui/CurrencyInput';
import { Field } from '@/ui/Field';
import { DateInput, dateTextToIso, isoToDateText } from '@/ui/MaskedInputs';
import { Screen } from '@/ui/Screen';
import { Txt } from '@/ui/Txt';

export default function InstanciaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const refresh = useApp((state) => state.refresh);

  const [bill, setBill] = useState<BillInstance | null>(null);
  const [templateAmount, setTemplateAmount] = useState<number | null>(null);
  const [amount, setAmount] = useState(0);
  const [dateText, setDateText] = useState('');

  useEffect(() => {
    (async () => {
      const found = await getInstance(Number(id));
      if (!found) return;
      const template = found.templateId !== null ? await getTemplate(found.templateId) : null;
      setBill(found);
      setTemplateAmount(template?.amountCents ?? null);
      setAmount(found.amountCents);
      setDateText(isoToDateText(found.dueDate));
    })().catch((error) => console.warn('Falha ao carregar conta', error));
  }, [id]);

  if (!bill) return <Screen />;

  const save = async () => {
    const dueDate = dateText === '' ? null : dateTextToIso(dateText);
    if (amount <= 0) return Alert.alert('Informe um valor maior que zero');
    if (dateText !== '' && dueDate === null) return Alert.alert('Data inválida');

    await updateInstance(bill.id, { amountCents: amount, dueDate });
    refresh();
    router.back();
  };

  return (
    <Screen>
      <Txt variant="title">{bill.name}</Txt>
      <Txt color="muted">
        {monthLabel(bill.month)} · altera apenas este mês, o modelo continua igual
      </Txt>
      <Field label="Valor do mês">
        <CurrencyInput value={amount} onChange={setAmount} />
      </Field>
      {templateAmount !== null && templateAmount !== amount ? (
        <Button
          label="Voltar ao valor do modelo"
          variant="secondary"
          onPress={() => setAmount(templateAmount)}
        />
      ) : null}
      <Field label="Vencimento" hint="Deixe em branco para não avisar">
        <DateInput value={dateText} onChangeText={setDateText} />
      </Field>
      <Button label="Salvar" onPress={save} />
    </Screen>
  );
}
