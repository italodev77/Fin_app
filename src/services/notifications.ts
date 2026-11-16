import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';
import { listPendingInstances, ensureMonth } from '@/db/instances';
import { getSettings } from '@/db/settings';
import { planNotifications } from '@/domain/notifications';
import { addMonths, monthOfDate, todayIso } from '@/domain/month';

const CHANNEL_ID = 'vencimentos';
const HORIZON_MONTHS = 2;

export type PermissionState = 'granted' | 'denied' | 'undetermined';

export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Vencimentos',
    importance: AndroidImportance.HIGH,
  });
}

export async function getPermissionState(): Promise<PermissionState> {
  const result = await Notifications.getPermissionsAsync();
  if (result.granted) return 'granted';
  return result.status === Notifications.PermissionStatus.UNDETERMINED ? 'undetermined' : 'denied';
}

export async function requestPermission(): Promise<PermissionState> {
  await ensureChannel();
  const result = await Notifications.requestPermissionsAsync();
  return result.granted ? 'granted' : 'denied';
}

async function reschedule(): Promise<void> {
  if ((await getPermissionState()) !== 'granted') return;

  await ensureChannel();
  const now = new Date();
  const current = monthOfDate(todayIso(now));
  const horizon = addMonths(current, HORIZON_MONTHS);

  for (let step = 0; step <= HORIZON_MONTHS; step += 1) {
    await ensureMonth(addMonths(current, step));
  }

  const [settings, bills] = await Promise.all([
    getSettings(),
    listPendingInstances(addMonths(current, -1), horizon),
  ]);
  const planned = planNotifications(bills, settings, now);

  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const item of planned) {
    await Notifications.scheduleNotificationAsync({
      identifier: item.id,
      content: { title: item.title, body: item.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: item.fireAt,
        channelId: CHANNEL_ID,
      },
    });
  }
}

let chain: Promise<void> = Promise.resolve();

export function scheduleReminders(): Promise<void> {
  chain = chain.then(reschedule).catch((error) => {
    console.warn('Falha ao agendar notificações', error);
  });
  return chain;
}
