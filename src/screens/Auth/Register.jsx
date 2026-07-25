import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Logo = () => (
  <View style={styles.logoWrap}>
    <View style={styles.logoPlaceholder}>
      <MaterialIcons name="local-pharmacy" size={24} color="#E91E8C" />
    </View>
    <View>
      <Text style={styles.logoName}>MEDICTO™</Text>
      <Text style={styles.logoSub}>PHARMACY</Text>
    </View>
  </View>
);

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSignUp = async () => {
    setLoading(true);
    // TODO: Call your register API here
    setTimeout(() => {
      setLoading(false);
      navigation?.navigate('OTPVerification', { phone: form.phone });
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar backgroundColor="#F7F7F9" barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Logo />
        <Text style={styles.tagline}>Join our premium health concierge</Text>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#BDBDBD"
                value={form.name}
                onChangeText={set('name')}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="hello@vitality.com"
                placeholderTextColor="#BDBDBD"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={set('phone')}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Create Password</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor="#BDBDBD"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={set('password')}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20} color="#BDBDBD"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor="#BDBDBD"
                secureTextEntry={!showConfirm}
                value={form.confirm}
                onChangeText={set('confirm')}
              />
              <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                  size={20} color="#BDBDBD"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms */}
          <Text style={styles.termsText}>
            By signing up, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of{'\n'}Service</Text>
            {' '}and Privacy Policy.
          </Text>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleSignUp}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </View>

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation?.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* Footer links */}
        <View style={styles.footerLinks}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>⚙ Support</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.footerLink}>⚖ Legal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F7F7F9' },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    backgroundColor: '#F7F7F9',
  },

  // Logo
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  logoPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FCE4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E91E8C',
    letterSpacing: 0.5,
  },
  logoSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#E91E8C',
    letterSpacing: 1.5,
    marginTop: -2,
  },
  tagline: {
    fontSize: 13,
    color: '#888',
    marginBottom: 24,
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: '#EFEFEF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  // Fields
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  inputWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1A1A1A',
    flex: 1,
  },
  eyeBtn: {
    paddingHorizontal: 14,
  },

  // Terms
  termsText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    marginTop: 4,
  },
  termsLink: {
    color: '#E91E8C',
    fontWeight: '600',
  },

  // Button
  primaryBtn: {
    backgroundColor: '#E91E8C',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#E91E8C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Login row
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: { fontSize: 14, color: '#777' },
  loginLink: { fontSize: 14, fontWeight: '700', color: '#E91E8C' },

  // Footer links
  footerLinks: {
    flexDirection: 'row',
    gap: 28,
    marginTop: 'auto',
  },
  footerLink: {
    fontSize: 12,
    color: '#AAAAAA',
  },
});