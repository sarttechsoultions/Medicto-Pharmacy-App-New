import {Platform, Linking} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getMessaging,
  requestPermission,
  registerDeviceForRemoteMessages,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import Toast from 'react-native-toast-message';

export const ANDROID_CHANNEL_ID = 'medicto-default';
const FCM_TOKEN_KEY = 'fcmToken';

const openNotificationTarget = async data => {
  if (!data) return;
  const url = data.url || (data.medicineId ? `medictopharmacy://medicine/${data.medicineId}` : null);
  if (!url) return;
  try { await Linking.openURL(url); } catch (error) { console.warn('Unable to open notification target:', error); }
};

export async function createNotificationChannel() {
  if (Platform.OS !== 'android') return null;
  return notifee.createChannel({id: ANDROID_CHANNEL_ID, name: 'Medicto notifications', description: 'Order and pharmacy updates', importance: AndroidImportance.HIGH, sound: 'default'});
}

export async function requestNotificationPermission() {
  const status = await requestPermission(getMessaging());
  return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
}

export async function getAndStoreFcmToken() {
  await registerDeviceForRemoteMessages(getMessaging());
  const token = await getToken(getMessaging());
  if (token) await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
  return token;
}

export function setupNotificationListeners() {
  const unsubscribeMessage = onMessage(getMessaging(), async remoteMessage => {
    const {notification, data} = remoteMessage;
    if (!notification) return;
    Toast.show({type: 'info', text1: notification.title || 'Medicto Pharmacy', text2: notification.body || '', visibilityTime: 5000});
    await createNotificationChannel();
    await notifee.displayNotification({title: notification.title || 'Medicto Pharmacy', body: notification.body || '', data: data || {}, android: {channelId: ANDROID_CHANNEL_ID, pressAction: {id: 'default'}, smallIcon: 'ic_launcher'}});
  });
  const unsubscribeOpened = onNotificationOpenedApp(getMessaging(), message => openNotificationTarget(message?.data));
  const unsubscribeNotifee = notifee.onForegroundEvent(({type, detail}) => { if (type === EventType.PRESS) openNotificationTarget(detail.notification?.data); });
  getInitialNotification(getMessaging()).then(message => openNotificationTarget(message?.data));
  return () => { unsubscribeMessage(); unsubscribeOpened(); unsubscribeNotifee(); };
}

export async function initializeNotifications() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await notifee.requestPermission();
    if (granted.authorizationStatus === 0) return null;
  } else if (!(await requestNotificationPermission())) return null;
  await createNotificationChannel();
  return getAndStoreFcmToken();
}
