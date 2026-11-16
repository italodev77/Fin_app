import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Linking, Switch } from 'react-native';
import { exportBackup, importBackup } from '@/db/backup';
import { InvalidBackupError, parseBackup } from '@/domain/backup';
import type { Settings } from '@/domain/types';
import { useApp } from '@/store/app';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { confirmAction } from '@/ui/confirm';
import { Field, Input } from '@/ui/Field';
import { isValidTime, TimeInput } from '@/ui/MaskedInputs';
import { Row, Screen } from '@/ui/Screen';
import { spacing } from '@/ui/theme';
import { Txt } from '@/ui/Txt';

function parseDecimal(text: string): number {
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) ? value : -1;
}

export default function Config() {
  const settings = useApp((state) => state.settings);
  const permission = useApp((state) => state.permission);
  const updateSettings = useApp((state) => state.updateSettings);
  const askPermission = useApp((state) => state.askPermission);
  const refresh = useApp((state) => state.refresh);

  const [days, setDays] = useState(String(settings.alertDaysBefore));
  const [time, setTime] = useState(settings.alertTime);
  const [weekly, setWeekly] = useState(settings.weeklySummary);
  const [tax, setTax] = useState(String(settings.defaultTaxPercent).replace('.', ','));

  const save = async () => {
    const alertDaysBefore = parseInt(days, 10);
    const defaultTaxPercent = parseDecimal(tax);
    if (!Number.isInteger(alertDaysBefore) || alertDaysBefore < 0 || alertDaysBefore > 30) {
      return Alert.alert('Informe entre 0 e 30 dias de antecedência');
    }
    if (!isValidTime(time)) return Alert.alert('Horário inválido');
    if (defaultTaxPercent < 0 || defaultTaxPercent > 100) return Alert.alert('Imposto inválido');

    const next: Settings = {
      alertDaysBefore,
      alertTime: time,
      weeklySummary: weekly,
      defaultTaxPercent,
    };
    await updateSettings(next);
    Alert.alert('Configurações salvas');
  };

  const exportData = async () => {
    try {
      const json = await exportBackup();
      const stamp = new Date().toISOString().slice(0, 10);
      const file = new File(Paths.cache, `fin-backup-${stamp}.json`);
      file.create({ overwrite: true });
      file.write(json);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Backup' });
      } else {
        Alert.alert('Compartilhamento indisponível neste aparelho');
      }
    } catch (error) {
      console.warn('Falha ao exportar', error);
      Alert.alert('Não foi possível exportar o backup');
    }
  };

  const importData = async () => {
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      });
      if (picked.canceled) return;

      const content = await new File(picked.assets[0].uri).text();
      const backup = parseBackup(content);

      confirmAction(
        'Importar backup',
        'Todos os dados atuais serão substituídos pelo conteúdo do arquivo.',
        'Importar',
        async () => {
          await importBackup(backup);
          const imported = useApp.getState();
          await imported.updateSettings({ ...imported.settings });
          refresh();
          Alert.alert('Backup importado');
        },
      );
    } catch (error) {
      Alert.alert(
        error instanceof InvalidBackupError ? error.message : 'Não foi possível importar o arquivo',
      );
    }
  };

  return (
    <Screen>
      <Card style={{ gap: spacing.md }}>
        <Txt variant="heading">Notificações</Txt>
        {permission === 'granted' ? (
          <Txt color="success">Permissão concedida</Txt>
        ) : (
          <>
            <Txt color="warning">
              {permission === 'denied'
                ? 'As notificações estão bloqueadas. Ative nas configurações do aparelho para receber avisos de vencimento.'
                : 'Permita as notificações para receber avisos de vencimento.'}
            </Txt>
            {permission === 'denied' ? (
              <Button label="Abrir configurações do aparelho" onPress={() => Linking.openSettings()} />
            ) : (
              <Button label="Permitir notificações" onPress={askPermission} />
            )}
          </>
        )}
        <Field label="Dias de antecedência" hint="Você também é avisado no dia do vencimento">
          <Input
            keyboardType="number-pad"
            value={days}
            onChangeText={(t) => setDays(t.replace(/\D/g, '').slice(0, 2))}
          />
        </Field>
        <Field label="Horário do aviso">
          <TimeInput value={time} onChangeText={setTime} />
        </Field>
        <Row>
          <Switch value={weekly} onValueChange={setWeekly} />
          <Txt style={{ flex: 1 }}>Resumo semanal às segundas-feiras</Txt>
        </Row>
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Txt variant="heading">Receita</Txt>
        <Field label="Imposto padrão (%)">
          <Input keyboardType="decimal-pad" value={tax} onChangeText={setTax} />
        </Field>
      </Card>

      <Button label="Salvar configurações" onPress={save} />

      <Card style={{ gap: spacing.md }}>
        <Txt variant="heading">Backup</Txt>
        <Button label="Exportar backup (JSON)" variant="secondary" onPress={exportData} />
        <Button label="Importar backup" variant="secondary" onPress={importData} />
      </Card>
    </Screen>
  );
}
