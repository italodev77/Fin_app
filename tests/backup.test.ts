import { InvalidBackupError, parseBackup, serializeBackup } from '../src/domain/backup';
import { DEFAULT_SETTINGS, settingsFromRecord, settingsToRecord } from '../src/domain/settings';
import { billsFor, incomeItems, templates, transactions } from './helpers';

const payload = {
  categories: [{ id: 1, name: 'Fixas', kind: 'FIXA' as const }],
  billTemplates: templates,
  billInstances: billsFor('2026-12'),
  transactions,
  incomePlans: [
    {
      month: '2026-12',
      mode: 'ITEMS' as const,
      netCents: null,
      taxPercent: 5,
      taxOnExtra: true,
    },
  ],
  incomeItems,
  settings: settingsToRecord(DEFAULT_SETTINGS),
};

describe('backup', () => {
  it('exporta e importa sem perda', () => {
    const json = serializeBackup(payload, new Date('2026-12-01T12:00:00Z'));
    const restored = parseBackup(json);
    expect(restored.billTemplates).toEqual(payload.billTemplates);
    expect(restored.billInstances).toEqual(payload.billInstances);
    expect(restored.transactions).toEqual(payload.transactions);
    expect(restored.incomePlans).toEqual(payload.incomePlans);
    expect(restored.incomeItems).toEqual(payload.incomeItems);
    expect(restored.settings).toEqual(payload.settings);
    expect(restored.exportedAt).toBe('2026-12-01T12:00:00.000Z');
  });

  it('rejeita arquivos inválidos', () => {
    expect(() => parseBackup('não é json')).toThrow(InvalidBackupError);
    expect(() => parseBackup('[]')).toThrow(InvalidBackupError);
    expect(() => parseBackup(JSON.stringify({ version: 99 }))).toThrow(InvalidBackupError);
    expect(() => parseBackup(JSON.stringify({ version: 1, categories: [] }))).toThrow(
      InvalidBackupError,
    );
  });
});

describe('configurações', () => {
  it('aplica padrões para valores ausentes ou inválidos', () => {
    expect(settingsFromRecord({})).toEqual(DEFAULT_SETTINGS);
    expect(settingsFromRecord({ alertTime: '25:00', alertDaysBefore: 'x' })).toEqual(
      DEFAULT_SETTINGS,
    );
  });

  it('lê valores salvos', () => {
    const settings = settingsFromRecord({
      alertDaysBefore: '5',
      alertTime: '07:45',
      defaultTaxPercent: '6',
      weeklySummary: 'true',
    });
    expect(settings).toEqual({
      alertDaysBefore: 5,
      alertTime: '07:45',
      defaultTaxPercent: 6,
      weeklySummary: true,
    });
  });
});
