import React from 'react';
import { TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PHONE = '916377283440';
const WA_MESSAGE = 'Thank you for connecting us.';

export const FloatingChatButton = () => {

  const openWhatsApp = () => {
    // console.log('----------------- ', WA_MESSAGE);
    
    const msg = encodeURIComponent(WA_MESSAGE);
    const url = Platform.OS === 'android'
      ? `whatsapp://send?phone=${PHONE}&text=${msg}`
      : `https://wa.me/${PHONE}?text=${msg}`;

    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://wa.me/${PHONE}?text=${msg}`)
    );
  };

  return (
    <TouchableOpacity style={styles.floatingChat} onPress={openWhatsApp} activeOpacity={0.85}>
      <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingChat: {
    position: 'absolute',
    right: 20,
    bottom:60,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#B6005B',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    zIndex: 9999,
    shadowColor: '#DF1774',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
});