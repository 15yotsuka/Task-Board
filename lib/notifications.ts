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
): Promise<boolean> {
  const due = parseISO(dueDate);
  if (!isValid(due)) return false;

  const triggerDate = subMinutes(due, minutesBefore);
  if (triggerDate <= new Date()) return false;

  // todoId を identifier にすることで cancelTaskNotification が identifier 保存なしで動作する
  await Notifications.scheduleNotificationAsync({
    identifier: `todo-${todoId}`,
    content: {
      title: 'TaskBoard',
      body: title,
      data: { todoId },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });

  return true;
}

export async function cancelTaskNotification(todoId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(`todo-${todoId}`);
  } catch {
    // 通知が存在しない場合はエラーを無視
  }
}
