// src/screens/Profile/ProfileScreen.jsx

import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Platform, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { logout } from '../../redux/slice/authSlice';
import Fonts from '../../constant/Fonts';
import { useState, useEffect } from 'react';
import { api, setApiToken } from '../../services/service';
import Toast from 'react-native-toast-message';
const PINK = '#B6005B';
import GuestScreen from '../../components/GuestLogin';

// ─── Menu Items ───────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { id: 'm1', label: 'Edit Profile',       sublabel: 'Update personal info & health bio',      icon: 'square-edit-outline',   screen: 'UserInfo'       },
  { id: 'm2', label: 'Wallet',             sublabel: 'Manage wallet & transactions securely',   icon: 'wallet-outline',        screen: 'WalletScreen'         },
  { id: 'm3', label: 'Refer & Earn',       sublabel: 'Invite friends & earn exciting rewards',  icon: 'share-variant-outline', screen: 'ReferAndEarnScreen'      },
  { id: 'm4', label: 'Address Management', sublabel: 'Pharmacy delivery & home addresses',      icon: 'map-marker-outline',    screen: 'SavedAddresses' },
  { id: 'm5', label: 'Order History',      sublabel: 'Manage prescriptions & refills',          icon: 'history',               screen: 'OrderHistory'   },
  { id: 'm6', label: 'Settings',           sublabel: 'Privacy, notifications & security',       icon: 'cog-outline',           screen: null             },
  { id: 'm7', label: 'Help & Support',     sublabel: 'FAQs & 24/7 Clinical assistance',         icon: 'headset',               screen: 'FAQScreen'             },
];

// ─── Menu Row ─────────────────────────────────────────────────────────────────
const MenuItem = ({ item, onPress }) => (
  <TouchableOpacity style={s.menuItem} onPress={() => onPress?.(item.screen)} activeOpacity={0.75}>
    <View style={s.menuIconBox}>
      <Icon name={item.icon} size={20} color={PINK} />
    </View>
    <View style={s.menuText}>
      <Text style={s.menuLabel}>{item.label}</Text>
      <Text style={s.menuSublabel}>{item.sublabel}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={22} color="#40493D" />
  </TouchableOpacity>
);

// ─── Logged-in view ───────────────────────────────────────────────────────────
const LoggedInScreen = ({ user, navigation, onLogout }) => (
  <View style={s.screen}>
    <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

    {/* Header */}
    <View style={s.header}>
      <View style={s.headerLeft}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerAvatar}>
          <MaterialIcons name="arrow-back" size={22} color="#DB2777" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Profile</Text>
      </View>
    </View>

    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile card */}
      <View style={s.profileCard}>
        <View style={s.avatarWrap}>
          <View style={s.avatarRing}>
            <View style={s.avatarInner}>
              {user?.profile_img ? (
                <Image
                  source={{ uri: `https://medictopharmacy.com/${user.profile_img}` }}
                  style={s.logoImg}
                  resizeMode="cover"
                />
              ) : (
                <Icon name="account-tie" size={52} color="#334" />
              )}
            </View>
          </View>
          <View style={s.verifiedBadge}>
            <Icon name="check-circle" size={18} color={PINK} />
          </View>
        </View>

        <Text style={s.premiumLabel}>PREMIUM MEMBER</Text>
        <Text style={s.profileName}>{user?.name || 'Guest'}</Text>

        {user?.email  && ( <View style={s.infoRow}>
          <MaterialIcons name="mail-outline" size={15} color="#888" />
          <Text style={s.infoText}>{user?.email || ''}</Text>
        </View>)}
         {user?.number && (
        <View style={s.infoRow}>
          <Icon name="cellphone" size={15} color="#888" />
          <Text style={s.infoText}>+91 {user?.number || ''}</Text>
        </View>)}
      </View>

      {/* Account Management */}
      <Text style={s.sectionTitle}>Account Management</Text>
      <View style={s.menuCard}>
        {MENU_ITEMS.map((item, idx) => (
          <View key={item.id}>
            <MenuItem
              item={item}
              onPress={(screen) => screen ? navigation.navigate(screen) : null}
            />
            {idx < MENU_ITEMS.length - 1 && <View style={s.menuDivider} />}
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={s.logoutCard} onPress={onLogout} activeOpacity={0.8}>
        <Icon name="logout" size={18} color="#E53935" />
        <Text style={s.logoutText}>Logout from Account</Text>
      </TouchableOpacity>

      <Text style={s.versionText}>CLINICAL VITALITY V2.4.1</Text>
      <View style={{ height: 32 }} />
    </ScrollView>
  </View>
);

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const navigation = useNavigation();
  const dispatch   = useDispatch();
  const token      = useSelector((state) => state.auth.token);
  const [user, setUser] = useState([]);

  const handleLogout = async () => {
    try {
      await api.post('/logout', { email: user?.email });
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setApiToken(null);
      dispatch(logout());
      Toast.show({ type: 'success', text1: 'Logout Successfully' });
      setTimeout(() => navigation.navigate('Home'), 400);
    } catch (error) {
      Toast.show({ type: 'error', text1: error?.message || 'Something went wrong, try again.' });
    }
  };

  const getProfile = async () => {
    const res = await api.get('/profile');
    if (res.status === 200) setUser(res?.data?.data);
  };

  useEffect(() => { getProfile(); }, [dispatch]);

  if (!token) return <GuestScreen navigation={navigation} />;

  return <LoggedInScreen user={user} navigation={navigation} onLogout={handleLogout} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F9' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 36, paddingBottom: 12,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar:{ width: 34, height: 34, borderRadius: 17 },
  headerTitle: { fontSize: 18, fontFamily: Fonts.secondary.semiBold, color: PINK, marginBottom: 6 },
  hIcon:       { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },

  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  profileCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18,
    paddingVertical: 28, paddingHorizontal: 20,
    alignItems: 'center', gap: 8, marginBottom: 28,
    elevation: 1, shadowColor: '#000',
  },
  avatarWrap:   { position: 'relative', marginBottom: 8 },
  avatarRing:   { width: 96, height: 96, borderRadius: 48, borderWidth: 2.5, borderColor: '#4CAF50', alignItems: 'center', justifyContent: 'center', padding: 3 },
  avatarInner:  { width: '100%', height: '100%', borderRadius: 44, backgroundColor: '#E8EAF0', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  verifiedBadge:{ position: 'absolute', bottom: 4, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  logoImg:      { width: '100%', height: '100%', borderRadius: 100 },
  premiumLabel: { fontSize: 11, fontFamily: Fonts.secondary.semiBold, color: PINK, letterSpacing: 1.4, marginTop: 2 },
  profileName:  { fontSize: 22, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A' },
  infoRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText:     { fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#555555', marginTop: 2 },

  sectionTitle: { fontSize: 18, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A', marginBottom: 14 },

  menuCard:    { overflow: 'hidden', marginBottom: 16, gap: 10 },
  menuItem:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 14, backgroundColor: '#F2F4F7', borderRadius: 12 },
  menuIconBox: { width: 40, height: 40, borderRadius: 50, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 1 },
  menuText:    { flex: 1 },
  menuLabel:   { fontSize: 15, fontFamily: Fonts.secondary.semiBold, color: '#191C1E' },
  menuSublabel:{ fontSize: 12, fontFamily: Fonts.secondary.regular, color: '#40493D', marginTop: -2 },
  menuDivider: { height: 1, backgroundColor: '#F5F5F5', marginLeft: 70 },

  logoutCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#F2F4F7', borderRadius: 18,
    paddingVertical: 18, marginBottom: 16,
  },
  logoutText: { fontSize: 15, fontFamily: Fonts.secondary.semiBold, color: '#E53935' },

  versionText: { textAlign: 'center', fontSize: 10, fontFamily: Fonts.secondary.regular, color: '#40493D', letterSpacing: 1.2, marginBottom: 8 },
});