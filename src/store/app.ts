import { create } from 'zustand';
import { seedIfEmpty } from '@/db/seed';
import { getSettings, saveSettings } from '@/db/settings';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { addMonths, monthOfDate, todayIso } from '@/domain/month';
import type { Month, Settings } from '@/domain/types';
import {
  configureNotifications,
  getPermissionState,
  requestPermission,
  scheduleReminders,
  type PermissionState,
} from '@/services/notifications';

interface AppState {
  ready: boolean;
  month: Month;
  version: number;
  settings: Settings;
  permission: PermissionState;
  init: () => Promise<void>;
  shiftMonth: (delta: number) => void;
  refresh: () => void;
  updateSettings: (settings: Settings) => Promise<void>;
  askPermission: () => Promise<void>;
  syncPermission: () => Promise<void>;
}

export const useApp = create<AppState>((set, get) => ({
  ready: false,
  month: monthOfDate(todayIso()),
  version: 0,
  settings: DEFAULT_SETTINGS,
  permission: 'undetermined',

  init: async () => {
    configureNotifications();
    await seedIfEmpty();
    const settings = await getSettings();
    let permission = await getPermissionState();
    if (permission === 'undetermined') permission = await requestPermission();
    set({ ready: true, settings, permission });
    void scheduleReminders();
  },

  shiftMonth: (delta) => {
    set((state) => ({ month: addMonths(state.month, delta) }));
    void scheduleReminders();
  },

  refresh: () => {
    set((state) => ({ version: state.version + 1 }));
    void scheduleReminders();
  },

  updateSettings: async (settings) => {
    await saveSettings(settings);
    set({ settings });
    get().refresh();
  },

  askPermission: async () => {
    const permission = await requestPermission();
    set({ permission });
    get().refresh();
  },

  syncPermission: async () => {
    const permission = await getPermissionState();
    if (permission !== get().permission) set({ permission });
  },
}));
