import * as Notifications from 'expo-notifications';
import { parseISO, subMinutes, isValid } from 'date-fns';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleTaskNotification(
  todoId: string,
  title: string,
  dueDate: string,
  minutesBefore: number
): Promise<string | null> {
  const due = parseISO(dueDate);
  if (!isValid(due)) return null;

  const triggerDate = subMinutes(due, minutesBefore);
  if (triggerDate <= new Date()) return null;

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'TaskBoard',
      body: title,
      data: { todoId },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });

  return identifier;
}

export async function cancelTaskNotification(identifier: string) {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}
