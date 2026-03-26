import { parseISO, subMinutes, isValid } from 'date-fns';

// expo-notifications をトップレベルで import しない。
// import 時に TurboModule がインスタンス化され、EXExportedModule の
// バックグラウンドシリアルキューで初期化処理が走り
// ObjCTurboModule::performVoidMethodInvocation で ObjC 例外 → SIGABRT。
// require() で遅延ロードすることで、RN ブリッジ安定後にのみアクセスする。
function getNotifications() {
  return require('expo-notifications') as typeof import('expo-notifications');
}

let _handlerInitialized = false;
export function initNotificationHandler() {
  if (_handlerInitialized) return;
  _handlerInitialized = true;
  getNotifications().setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  const Notifications = getNotifications();
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
  const Notifications = getNotifications();
  const due = parseISO(dueDate);
  if (!isValid(due)) return false;

  const triggerDate = subMinutes(due, minutesBefore);
  if (triggerDate <= new Date()) return false;

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
    const Notifications = getNotifications();
    await Notifications.cancelScheduledNotificationAsync(`todo-${todoId}`);
  } catch {
    // 通知が存在しない場合はエラーを無視
  }
}
