// src/screens/Auth/OTPVerificationScreen.jsx
// ── Only change: save token + user to AsyncStorage after dispatch ─────────────

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView, Image, Dimensions,ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import Fonts from '../../constant/Fonts';
import { api, setApiToken } from '../../services/service';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../redux/slice/authSlice';

const { width: SCREEN_WIDTH } = Dimensions.get( 'window' );
const BOX_SIZE = Math.floor( ( SCREEN_WIDTH - 56 - 40 ) / 6 );

const Logo = () => (
  <View style={styles.logoWrap}>
    <Image
      source={require( '../../assets/images/medicto_logo_text.jpg.png' )}
      style={styles.logoImg}
    />
  </View>
);

const OTP_LENGTH = 6;
const RESEND_SECONDS = 48;

export default function OTPVerificationScreen( { navigation, route } ) {
  const email = route?.params?.email || 'your email';
  const [ otp, setOtp ] = useState( Array( OTP_LENGTH ).fill( '' ) );
  const [ loading, setLoading ] = useState( false );
  const [ timer, setTimer ] = useState( RESEND_SECONDS );
  const refs = useRef( [] );
  const dispatch = useDispatch();

  const [ resendLoading, setResendLoading ] = useState( false );

  const handleResend = async () => {
    setResendLoading( true );
    try {
      const res = await api.post( '/send-otp', { email } );
     console.log('----------res----- ', res);
     
      if ( res?.status === 200 ) {
        setTimer( RESEND_SECONDS );
        setOtp( Array( OTP_LENGTH ).fill( '' ) );
        refs.current[ 0 ]?.focus();
        // console.log('----------');
        
        Toast.show( {
          type: 'success',
          text1: 'OTP Resent Successfully',
          text2: 'A new code was sent to ' + email,
        } );
      } else {
        Toast.show( {
          type: 'error',
          text1: 'Failed to Resend',
          text2: res.data?.message || 'Something went wrong. Try again.',
        } );
      }
    } catch ( err ) {
      Toast.show( {
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Could not resend OTP. Please try again.',
      } );
    } finally {
      setResendLoading( false );
    }
  };

  useEffect( () => {
    if ( timer <= 0 ) return;
    const interval = setInterval( () => setTimer( ( t ) => t - 1 ), 1000 );
    return () => clearInterval( interval );
  }, [ timer ] );

  const formatTimer = ( s ) => {
    const m = String( Math.floor( s / 60 ) ).padStart( 2, '0' );
    const sec = String( s % 60 ).padStart( 2, '0' );
    return `${m}:${sec}`;
  };

  const handleOtpChange = ( val, index ) => {
    if ( !/^\d*$/.test( val ) ) return;
    const newOtp = [ ...otp ];
    newOtp[ index ] = val;
    setOtp( newOtp );
    if ( val && index < OTP_LENGTH - 1 ) refs.current[ index + 1 ]?.focus();
  };

  const handleKeyPress = ( e, index ) => {
    if ( e.nativeEvent.key === 'Backspace' && !otp[ index ] && index > 0 ) {
      refs.current[ index - 1 ]?.focus();
    }
  };


  const handleVerify = async () => {
    const code = otp.join( '' );
    if ( code.length < OTP_LENGTH ) return;

    setLoading( true );
    try {
      const res = await api.post( '/verify-otp', { email, otp: code } );

      if ( res.status === 200 ) {
        const token = res.data?.token;
        const user = res.data?.user;

        if ( token ) {
          await AsyncStorage.setItem( 'token', token );
          await AsyncStorage.setItem( 'user', JSON.stringify( user ?? {} ) );
          setApiToken( token );

          dispatch( setAuth( { token, user } ) );
        }


        Toast.show( { type: 'success', text1: 'Success!', text2: res.data?.message || 'Welcome back.' } );

        setTimeout( () => {
          if ( !user?.name || !user?.number ) {
            navigation?.navigate( 'ReferralScreen');
            // navigation?.navigate('Home');
          } else {
             navigation?.navigate( 'ReferralScreen');
            // navigation?.navigate( 'Home' );
          }
        }, 600 );

      } else {
        Toast.show( { type: 'error', text1: 'Please Check OTP!', text2: res?.data?.message || res?.error } );
      }
    } catch ( err ) {
      Toast.show( { type: 'error', text1: 'Verification Failed', text2: err.message || 'Invalid OTP. Please try again.' } );
      setOtp( Array( OTP_LENGTH ).fill( '' ) );
      refs.current[ 0 ]?.focus();
    } finally {
      setLoading( false );
    }
  };

  const isDisabled = loading || otp.join( '' ).length < OTP_LENGTH;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar backgroundColor="#F7F7F9" barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.hIcon}>
            <MaterialIcons name="arrow-back" size={22} color="#DB2777" />
          </TouchableOpacity>
          <Text style={styles.hTitle}>Verify OTP</Text>
        </View>

      </View>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <Logo />

        <View style={styles.titleBlock}>
          <Text style={styles.title}>Verification Code</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
        </View>

        {/* OTP Inputs */}
        <View style={styles.otpRow}>
          {otp.map( ( digit, i ) => (
            <View key={i} style={[ styles.otpBox, digit ? styles.otpInputFilled : null ]}>
              {!digit && <Text style={styles.otpPlaceholder}>·</Text>}
              <TextInput
                ref={( r ) => ( refs.current[ i ] = r )}
                style={styles.otpInput}
                value={digit}
                onChangeText={( v ) => handleOtpChange( v, i )}
                onKeyPress={( e ) => handleKeyPress( e, i )}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectionColor="#B6005B"
              />
            </View>
          ) )}
        </View>

        {/* Timer + Resend */}
        <View style={styles.resendRow}>
          <View style={styles.timerLeft}>
            <Ionicons name="time-outline" size={14} color="#888" />
            <Text style={styles.timerText}>
              Resend in <Text style={styles.timerCount}>{formatTimer( timer )}</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleResend}
            disabled={timer > 0 || resendLoading}  // ← also disable while loading
          >
            <Text style={[ styles.resendLink, ( timer > 0 || resendLoading ) && styles.resendDisabled ]}>
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[ styles.primaryBtn, isDisabled && styles.primaryBtnDisabled ]}
          onPress={handleVerify}
          activeOpacity={(loading || isDisabled) ? .4 : 0.85}
          disabled={isDisabled}
          
        >
          <Text style={styles.primaryBtnText}>{loading ? <ActivityIndicator size={20} color={'#fff'} /> : 'Verify & Proceed'}</Text>
          {!loading && <MaterialIcons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 6 }} />}
        </TouchableOpacity>

        {/* Privacy Card */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyIconWrap}>
            <MaterialIcons name="shield" size={22} color="#B6005B" />
          </View>
          <View style={styles.privacyText}>
            <Text style={styles.privacyTitle}>Your Privacy</Text>
            <Text style={styles.privacyDesc}>
              This verification ensures only you can access your private health
              records and pharmaceutical history.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>SECURE ENCRYPTION • HEALTH CONCIERGE SYSTEM •{'\n'}HIPAA COMPLIANT</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create( {
  flex: { flex: 1, backgroundColor: '#F7F7F9' },
  container: {
    flexGrow: 1, alignItems: 'center',
    paddingHorizontal: 28, paddingTop: 54, paddingBottom: 32, backgroundColor: '#F7F7F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  hIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { marginTop: 4, textAlign: 'center', fontSize: 16, fontFamily: Fonts.secondary.bold, color: '#DB2777' },

  logoWrap: { marginBottom: 32 },
  logoImg: { width: 180, height: 50, resizeMode: 'contain' },
  titleBlock: { alignItems: 'center', marginBottom: 32, width: '100%' },
  title: { fontSize: 24, fontFamily: Fonts.bold, color: '#1A1A1A', marginBottom: 10 },
  subtitle: { fontSize: 14, fontFamily: Fonts.regular, color: '#777', textAlign: 'center', lineHeight: 22 },
  emailHighlight: { fontFamily: Fonts.semiBold, color: '#B6005B' },
  otpRow: { flexDirection: 'row', gap: 8, marginBottom: 20, width: '100%', justifyContent: 'center' },
  otpBox: {
    width: BOX_SIZE + 3,
    height: BOX_SIZE + 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2BDC5',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    fontSize: 20,
    fontFamily: Fonts.medium,
    color: '#1A1C1C',
    textAlign: 'center',
    backgroundColor: 'transparent',
    ...Platform.select( { ios: { lineHeight: BOX_SIZE + 13 }, android: {} } ),
  },
  otpInputFilled: { borderColor: '#B6005B', borderWidth: 2, backgroundColor: '#FFF0F6' },
  otpPlaceholder: {
    position: 'absolute',
    fontSize: 24,
    color: '#A0A0A0',
    textAlign: 'center',
    marginTop: -2,
  },
  resendRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%', marginBottom: 28, paddingHorizontal: 4,
  },
  timerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timerText: { fontSize: 12, fontFamily: Fonts.regular, color: '#888' },
  timerCount: { fontFamily: Fonts.bold, color: '#B6005B' },
  resendLink: { fontSize: 12, fontFamily: Fonts.bold, color: '#B6005B' },
  resendDisabled: { color: '#BDBDBD' },
  primaryBtn: {
    backgroundColor: '#B6005B', borderRadius: 14, paddingVertical: 17,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
    width: '100%', marginBottom: 24,
    shadowColor: '#B6005B', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  primaryBtnDisabled: { opacity: 0.45, elevation: 0, shadowOpacity: 0 },
  primaryBtnText: { fontFamily: Fonts.bold, color: '#FFF', fontSize: 16, letterSpacing: 0.3 },
  privacyCard: {
    width: '100%', backgroundColor: '#FFF0F6', borderRadius: 16,
    padding: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    marginBottom: 28, borderWidth: 1, borderColor: '#F8BBD9',
  },
  privacyIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#FCE4EC', alignItems: 'center', justifyContent: 'center',
  },
  privacyText: { flex: 1 },
  privacyTitle: { fontSize: 14, fontFamily: Fonts.semiBold, color: '#1A1A1A', marginBottom: 4 },
  privacyDesc: { fontSize: 12, fontFamily: Fonts.regular, color: '#777', lineHeight: 18 },
  footer: { fontFamily: Fonts.regular, fontSize: 9, color: '#BDBDBD', letterSpacing: 1, textAlign: 'center', marginTop: 'auto' },
} );