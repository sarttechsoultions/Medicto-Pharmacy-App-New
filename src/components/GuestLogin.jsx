
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Platform, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Fonts from '../constant/Fonts';

import { useDispatch, useSelector } from 'react-redux';

const PINK = '#B6005B';


const GuestScreen = ( ) => {
  const navigation = useNavigation()
  return <ScrollView style={s.screen}>  
  <View style={s.guestScreen}>
    <StatusBar backgroundColor="#F7F7F9" barStyle="dark-content" />

    {/* Background blobs */}
    <View style={s.blobTL} />
    <View style={s.blobBR} />

    {/* Logo */}
    <View style={s.logoWrap}>
      <Image
        source={require('../assets/images/medicto_logo_text.jpg.png' )}
        style={s.logoImg}
        resizeMode="contain"
      />
    </View>

    {/* Illustration placeholder */}
    <View style={s.illustrationBox}>
      <View style={s.illustrationCircle}>
        <Icon name="account-circle-outline" size={90} color="rgba(182,0,91,0.18)" />
      </View>
      <View style={s.illustrationRing} />
    </View>

    {/* Text */}
    <Text style={s.guestTitle}>Your Health, Your Profile</Text>
    <Text style={s.guestSub}>
      Sign in to manage your orders, addresses,{'\n'}
      prescriptions and health records.
    </Text>

    {/* Feature pills */}
    <View style={s.featurePills}>
      {[
        { icon: 'package-variant', label: 'Track Orders' },
        { icon: 'map-marker-outline', label: 'Saved Addresses' },
        { icon: 'pill', label: 'Prescriptions' },
      ].map( ( f ) => (
        <View key={f.label} style={s.featurePill}>
          <Icon name={f.icon} size={15} color={PINK} />
          <Text style={s.featurePillText}>{f.label}</Text>
        </View>
      ) )}
    </View>

    {/* Login button */}
    <TouchableOpacity
      style={s.loginBtn}
      onPress={() => navigation.navigate('Login')}
      activeOpacity={0.88}
    >
      <Text style={s.loginBtnText}>Login to Your Account</Text>
      <MaterialIcons name="arrow-forward" size={18} color="#FFF" />
    </TouchableOpacity>

    {/* Register link */}
    {/* <View style={s.registerRow}>
      <Text style={s.registerHint}>Don't have an account? </Text>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={s.registerLink}>Sign Up Free</Text>
      </TouchableOpacity>
    </View> */}

    {/* Security note */}
    <View style={s.guestSecurityRow}>
      <Icon name="shield-check-outline" size={13} color="#AAAAAA" />
      <Text style={s.guestSecurityText}>SECURED BY VITALITY CLINICAL GUARD</Text>
    </View>
  </View>
  </ScrollView>
};


export default GuestScreen;


const s = StyleSheet.create( {
   screen: { flex: 1, backgroundColor: '#F7F7F9' },

   guestScreen: {
    flex: 1, backgroundColor: '#F7F7F9',

    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 100 : 100,
    paddingBottom: 30,
  },
  blobTL: {
    position: 'absolute', top: -50, left: -50,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(182,0,91,0.06)',
  },
  blobBR: {
    position: 'absolute', bottom: -60, right: -50,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(182,0,91,0.05)',
  },
  logoWrap: { marginBottom: 28 },
  logoImg: { width: 160, height: 44 },

 
  illustrationBox: {
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28, position: 'relative',
    width: 80, height: 90,
    marginTop : 10
  },
  illustrationCircle: {
    width: 90, height: 90, borderRadius: 65,
    backgroundColor: '#FFF0F6',
    alignItems: 'center', justifyContent: 'center',
  },
  illustrationRing: {
    position: 'absolute',
    width: 112, height: 112, borderRadius: 78,
    borderWidth: 1.5, borderColor: 'rgba(182,0,91,0.12)',
    borderStyle: 'dashed',
  },

  guestTitle: {
    fontSize: 22, fontFamily: Fonts.secondary.semiBold,
    color: '#1A1A1A', textAlign: 'center', marginBottom: 10,
  },
  guestSub: {
    fontSize: 14, fontFamily: Fonts.secondary.regular,
    color: '#777777', textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },

 
  featurePills: {
    flexDirection: 'row', gap: 8, flexWrap: 'wrap',
    justifyContent: 'center', marginBottom: 32,
  },
  featurePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF0F6', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: '#F5C2D0',
  },
  featurePillText: {
    fontSize: 12, fontFamily: Fonts.secondary.semiBold, color: PINK,
  },

  
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, width: '100%',
    backgroundColor: PINK, borderRadius: 50,
    paddingVertical: 17, marginBottom: 14,
    shadowColor: PINK, shadowOpacity: 0.3,
    shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 7,
  },
  loginBtnText: {
    fontSize: 16, fontFamily: Fonts.secondary.semiBold, color: '#FFFFFF', marginBottom : -3
  },

 
  registerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  registerHint: { fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#777777' },
  registerLink: { fontSize: 13, fontFamily: Fonts.secondary.semiBold, color: PINK },

  guestSecurityRow: { flexDirection: 'row', alignItems: 'center', gap: 5 , marginTop : 20 },
  guestSecurityText: {
    fontSize: 9, fontFamily: Fonts.secondary.regular,
    color: '#AAAAAA', letterSpacing: 1.2,
  },
} );