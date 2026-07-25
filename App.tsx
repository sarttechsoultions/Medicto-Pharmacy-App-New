import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import StackNavigator from './src/navigation/StackNavigator';
import Toast from 'react-native-toast-message';
import { ActivityIndicator, View, StyleSheet, Linking } from 'react-native';
import useAuthBootstrap from './src/hooks/useAuthBootstrap';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import CartPopup from './src/components/CartPopup';
import {toastConfig} from './src/components/toastConfig'

const linking = {
  prefixes: [
    'medictopharmacy://',              
    'https://medictopharmacy.com',    
  ],
  config: {
    screens: {
      ProductDetails: 'medicine/:medicineId',
    },
  },
};

function AppInner() {
  const bootstrapped = useAuthBootstrap();

  if (!bootstrapped) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#B6005B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <NavigationContainer
        linking={linking}
        fallback={
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#B6005B" />
          </View>
        }
      >
        <StatusBar barStyle="dark-content" />
        <StackNavigator />
        <CartPopup />
        <Toast config={toastConfig} />
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppInner />
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#FFFFFF' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});