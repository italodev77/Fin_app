import type { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  alertDaysBefore: 3,
  alertTime: '09:00',
  defaultTaxPercent: 5,
  weeklySummary: false,
};

export function settingsFromRecord(record: Record<string, string>): Settings {
  const days = Number(record.alertDaysBefore);
  const tax = Number(record.defaultTaxPercent);
  const time = /^([01]\d|2[0-3]):[0-5]\d$/.test(record.alertTime ?? '')
    ? record.alertTime
    : DEFAULT_SETTINGS.alertTime;

  return {
    alertDaysBefore:
      record.alertDaysBefore !== undefined && Number.isInteger(days) && days >= 0
        ? days
        : DEFAULT_SETTINGS.alertDaysBefore,
    alertTime: time,
    defaultTaxPercent:
      record.defaultTaxPercent !== undefined && Number.isFinite(tax) && tax >= 0
        ? tax
        : DEFAULT_SETTINGS.defaultTaxPercent,
    weeklySummary: record.weeklySummary === 'true',
  };
}

export function settingsToRecord(settings: Settings): Record<string, string> {
  return {
    alertDaysBefore: String(settings.alertDaysBefore),
    alertTime: settings.alertTime,
    defaultTaxPercent: String(settings.defaultTaxPercent),
    weeklySummary: String(settings.weeklySummary),
  };
}
