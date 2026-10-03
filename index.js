import 'react-native-gesture-handler';
/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';

setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  console.log('Background FCM message:', remoteMessage.messageId);
});

AppRegistry.registerComponent(appName, () => App);
