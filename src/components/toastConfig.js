import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fonts from '../constant/Fonts';

const PINK = '#B6005B';

const BaseToast = ({ icon, iconBg, iconColor, text1, text2 }) => (
  <View style={s.card}>
    <View style={[s.iconWrap, { backgroundColor: iconBg }]}>
      <Icon name={icon} size={16} color={iconColor} />
    </View>
    <View style={s.textWrap}>
      {text1 ? <Text style={s.title} numberOfLines={1}>{text1}</Text> : null}
      {text2 ? <Text style={s.message} numberOfLines={1}>{text2}</Text> : null}
    </View>
  </View>
);

export const toastConfig = {
  success: ({ text1, text2 }) => (
    <BaseToast icon="check-circle" iconBg="#E8F5E9" iconColor="#2E7D32" text1={text1} text2={text2} />
  ),
  error: ({ text1, text2 }) => (
    <BaseToast icon="close-circle" iconBg="#FEE2E2" iconColor="#DC2626" text1={text1} text2={text2} />
  ),
  info: ({ text1, text2 }) => (
    <BaseToast icon="information" iconBg="#E8F0FE" iconColor="#1A56DB" text1={text1} text2={text2} />
  ),
  brand: ({ text1, text2 }) => (
    <BaseToast icon="heart" iconBg="#FFF0F6" iconColor={PINK} text1={text1} text2={text2} />
  ),
};

const s = StyleSheet.create({
  card: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    maxWidth: '85%',
  },
  iconWrap: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  textWrap: { flexShrink: 1 },
  title: {
    fontSize: 11.5,
    fontFamily: Fonts.secondary?.semiBold || Fonts.secondary?.medium,
    color: '#1A1A1A',
  },
  message: {
    fontSize: 10,
    fontFamily: Fonts.secondary?.regular,
    color: '#777',
    marginTop: 1,
  },
});