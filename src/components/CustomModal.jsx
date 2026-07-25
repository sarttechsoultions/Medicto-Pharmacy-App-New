import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, Animated, Image,
} from 'react-native';
import Fonts from '../constant/Fonts';

const PINK = '#B6005B';

export default function CustomModal({
  visible    = false,
  title      = 'Alert',
  message    = '',
  loginLabel  = 'Login',
  cancelLabel = 'Cancel',
  onLogin,
  onCancel,
}) {
  const scaleAnim   = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  console.log('--------------- ', visible);
  

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  // ← transparent yahan hai — Modal ke andar koi View nahi hota by default
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onCancel}
      >
        <Animated.View
          style={[
            styles.card,
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Prevent card tap from closing modal */}
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>

            {/* Logo */}
            <View style={styles.logoWrap}>
              <View style={styles.logoBg}>
                <Image
                  source={require('../assets/images/medicto_logo_text.jpg.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>{cancelLabel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginBtn}
                onPress={onLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.loginBtnText}>{loginLabel}</Text>
              </TouchableOpacity>
            </View>

          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingBottom: 24,
    // ← overflow:hidden REMOVED — ye animated view pe animation block karta hai
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  logoBg: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: '#FFF0F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F5C2D0',
  },
  logo: {
    width: 48,
    height: 48,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 24,
  },
  message: {
    fontSize: 14,
    fontFamily: Fonts.secondary.regular,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#F5EEF1',
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F5EEF1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth :1,
    borderColor :PINK 
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: Fonts.secondary.medium,
    color: PINK,
    marginBottom : -4
  },
  loginBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: PINK,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: PINK,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  loginBtnText: {
    fontSize: 15,
    fontFamily: Fonts.secondary.bold,
    color: '#FFFFFF',
    marginBottom : -4
  },
});