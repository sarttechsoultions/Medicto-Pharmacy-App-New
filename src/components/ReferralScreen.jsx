// src/screens/Referral/ReferralScreen.jsx

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, Platform, KeyboardAvoidingView, ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fonts from '../constant/Fonts';
import { api } from '../services/service';
import Toast from 'react-native-toast-message';

const PINK = '#B6005B';
const PINK_LIGHT = '#FFF0F6';

const showToast = (type, title, message) => {
  Toast.show({ type, text1: title, text2: message, position: 'top', visibilityTime: 3000 });
};

export default function ReferralScreen({ navigation }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const goHome = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const handleSkip = () => {
    goHome();
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Please enter a referral code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/apply-referral', { referral_code: code.trim() });
      const status = res?.data?.success;
      console.log('---respons is ----------- ', res);
      
      if (status === 200 || status === true) {
        showToast('success', 'Success', res?.data?.message || 'Referral code applied successfully!');
        goHome();
      } else {
        setError(res?.data?.message || 'Invalid referral code.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.screen}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={{ width: 60 }} />
        <TouchableOpacity onPress={handleSkip} style={s.skipBtn} activeOpacity={0.8}>
          <Text style={s.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.content}>
          {/* Icon */}
          <View style={s.iconWrap}>
            <Icon name="ticket-percent-outline" size={48} color={PINK} />
          </View>

          <Text style={s.title}>Have a Referral Code?</Text>
          <Text style={s.subtitle}>
            Enter a friend's referral code below and unlock{'\n'}exclusive rewards on your first order.
          </Text>

          {/* Input */}
          <View style={[s.inputBox, error && s.inputBoxError]}>
            <Icon name="ticket-confirmation-outline" size={20} color={PINK} />
            <TextInput
              style={s.input}
              value={code}
              onChangeText={(t) => { setCode(t); if (error) setError(''); }}
              placeholder="Enter referral code"
              placeholderTextColor="#CCCCCC"
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>
          {error ? <Text style={s.errorText}>{error}</Text> : null}
        </View>
      </KeyboardAvoidingView>

      {/* ── Bottom Submit ── */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.submitBtn, loading && s.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.88}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#FFF" size="small" />
            : <Text style={s.submitText}>Submit</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 12,
  },
  skipBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
  },
  skipText: {
    fontSize: 14, fontFamily: Fonts.secondary.semiBold, color: '#888',
  },

  content: {
    marginTop : 20 , paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  iconWrap: {
    width: 92, height: 92, borderRadius: 24,
    backgroundColor: PINK_LIGHT, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1, borderColor: '#F4C0D1',
  },
  title: {
    fontSize: 20, fontFamily: Fonts.secondary.bold, color: '#1A1A1A',
    textAlign: 'center', marginBottom: 6,
  },
  subtitle: {
    fontSize: 13.5, fontFamily: Fonts.secondary.regular, color: '#888',
    textAlign: 'center', lineHeight: 20, marginBottom: 28,
  },

  inputBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    width: '100%',
    backgroundColor: '#FFFFFF', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E2BDC5',
    paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 15 : 13,
  },
  inputBoxError: { borderColor: '#DC2626' },
  input: {
    flex: 1, fontSize: 15, fontFamily: Fonts.secondary.semiBold,
    color: '#1A1C1C', letterSpacing: 1,
    marginBottom : -3
  },
  errorText: {
    fontSize: 11, fontFamily: Fonts.secondary.regular, color: '#DC2626',
    alignSelf: 'flex-start', marginTop: 6, marginLeft: 4,
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  submitBtn: {
    backgroundColor: PINK, borderRadius: 50, paddingVertical: 17, alignItems: 'center',
    shadowColor: PINK, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: {
    fontSize: 16, fontFamily: Fonts.secondary.semiBold, color: '#FFF', marginBottom: -3,
  },
});