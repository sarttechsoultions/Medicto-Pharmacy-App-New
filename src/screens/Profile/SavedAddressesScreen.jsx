
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fonts from '../../constant/Fonts';
import { api } from '../../services/service';
import Toast from 'react-native-toast-message';
const PINK = '#B6005B';

// Map API address_label → icon/color config
const TYPE_CONFIG = {
  Home:   { icon: 'home',              bg: '#E8F5E9', color: '#2E7D32', label: 'PRIMARY'   },
  Work:   { icon: 'briefcase-outline', bg: '#EAF1FB', color: '#1565C0', label: 'WORKPLACE' },
  Office: { icon: 'briefcase-outline', bg: '#EAF1FB', color: '#1565C0', label: 'WORKPLACE' },
  Other:  { icon: 'map-marker-outline', bg: '#F0F0F0', color: '#555555', label: 'OTHER'   },
};
const getConfig = (label) => TYPE_CONFIG[label] || TYPE_CONFIG.Other;

// ─── API helpers ─────────────────────────────────────────────────────────────
const fetchAddresses = async () => {
  const res = await api.get('/addresses');
  return res.data?.data || [];
};

const deleteAddress = async (id) => {

  const res = await api.post(`/address-deleted/${id}`);

  // console.log('res is ---------------- ', id);
  
  return res.data;
};

// ─── AddressCard ─────────────────────────────────────────────────────────────
const AddressCard = ({ addr, onEdit, onDelete }) => {
  const cfg = getConfig(addr.address_label);
  return (
    <View style={s.card}>
      {/* Top row */}
      <View style={s.cardTop}>
        <View style={s.cardLeft}>
          <View style={[s.typeIconBox, { backgroundColor: cfg.bg }]}>
            <Icon name={cfg.icon} size={20} color={cfg.color} />
          </View>
          <View>
            <Text style={[s.typeLabel, { color: cfg.color }]}>{cfg.label}</Text>
            <Text style={s.typeName}>{addr.address_label}</Text>
          </View>
        </View>
        <View style={s.cardActions}>
          <TouchableOpacity onPress={() => onEdit(addr)} style={s.actionBtn}>
            <Icon name="pencil-outline" size={18} color="#888888" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(addr.id)} style={s.actionBtn}>
            <Icon name="delete-outline" size={18} color="#E53935" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Name */}
      {addr.full_name ? <Text style={s.nameText}>{addr.full_name}</Text> : null}

      {/* Address lines */}
      <Text style={s.addressLine}>{addr.street_address}</Text>
      {addr.landmark ? <Text style={s.addressLine}>{addr.landmark}</Text> : null}
      <Text style={s.addressLine}>
        {addr.city}, {addr.state} {addr.pin_code}
      </Text>

      {/* Phone */}
      <View style={s.phoneRow}>
        <Icon name="phone-outline" size={14} color="#888" />
        <Text style={s.phoneText}>{addr.phone_number}</Text>
      </View>
    </View>
  );
};

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function SavedAddressesScreen() {
  const navigation = useNavigation();

  const [addresses, setAddresses] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [deleting,  setDeleting]  = useState(null); // id being deleted

  // Reload list every time this screen comes into focus (after add/edit)
  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [])
  );

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await fetchAddresses();
      setAddresses(data);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to load addresses.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (addr) =>{
    navigation.navigate('EditAddress', { address: addr, mode: 'edit', addressId: addr.id });
     
  }
  const handleAdd = () =>
    navigation.navigate('EditAddress', { address: null, mode: 'add' });

  const handleDelete = (id) => {
    Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setDeleting(id);
          try {
            await deleteAddress(id);
            setAddresses((prev) => prev.filter((a) => a.id !== id));
          } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Failed to delete address.';
            Alert.alert('Error', msg);
          } finally {
            setDeleting(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={s.screen}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.hIcon}>
          <MaterialIcons name="arrow-back" size={22} color={PINK} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Saved Addresses</Text>
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={PINK} />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {addresses.length === 0 ? (
            <View style={s.emptyWrap}>
              <Icon name="map-marker-off-outline" size={48} color="#CCCCCC" />
              <Text style={s.emptyText}>No saved addresses yet</Text>
            </View>
          ) : (
            <View style={s.list}>
              {addresses.map((addr) => (
                <View key={addr.id} style={{ opacity: deleting === addr.id ? 0.4 : 1 }}>
                  <AddressCard
                    addr={addr}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Add new address — dashed card */}
          <TouchableOpacity style={s.addCard} onPress={handleAdd} activeOpacity={0.8}>
            <View style={s.addIconCircle}>
              <Icon name="map-marker-plus-outline" size={26} color="#AAAAAA" />
            </View>
            <Text style={s.addCardText}>Add New Address</Text>
          </TouchableOpacity>

          {/* Nearby clinic banner */}
          <View style={s.nearbyBanner}>
            <View style={s.nearbyBannerBg} />
            <View style={s.nearbyContent}>
              <View style={s.nearbyTextBlock}>
                <Text style={s.nearbyLabel}>NEARBY CLINIC</Text>
                <Text style={s.nearbyName}>Vitality Hub SF West</Text>
                <Text style={s.nearbyDist}>0.8 miles from Home</Text>
              </View>
              <View style={s.nearbyIconBtn}>
                <Icon name="compass-outline" size={22} color="#FFF" />
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Bottom Add button */}
      <View style={s.footer}>
        <TouchableOpacity style={s.addBtn} onPress={handleAdd} activeOpacity={0.88}>
          <Text style={s.addBtnText}>Add New Address</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: '#F7F9FC' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    paddingHorizontal: 8, paddingTop: Platform.OS === 'ios' ? 54 : 30, paddingBottom: 12,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  hIcon:       { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { marginTop: 4, textAlign: 'center', fontSize: 17, fontFamily: Fonts.secondary.semiBold, color: PINK },

  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
  list:          { gap: 14, marginBottom: 14 },

  emptyWrap: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: Fonts.secondary.regular, color: '#AAAAAA' },

  card: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 16,
  },
  cardTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardLeft:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typeLabel:   { fontSize: 10, fontFamily: Fonts.secondary.semiBold, letterSpacing: 0.8 },
  typeName:    { fontSize: 16, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBtn:   { padding: 6 },

  nameText:    { fontSize: 13, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A', marginBottom: 4 },
  addressLine: { fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#40493D', lineHeight: 20 },
  phoneRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  phoneText:   { fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#707A6C', marginTop: 3 },

  addCard: {
    borderWidth: 2, borderColor: '#DDDDDD', borderStyle: 'dashed',
    borderRadius: 24, paddingVertical: 28, alignItems: 'center',
    justifyContent: 'center', gap: 10, backgroundColor: 'transparent', marginBottom: 16,
  },
  addIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  addCardText:   { fontSize: 14, fontFamily: Fonts.secondary.semiBold, color: '#888888' },

  nearbyBanner:   { borderRadius: 16, overflow: 'hidden', height: 100, marginBottom: 16, position: 'relative' },
  nearbyBannerBg: { ...StyleSheet.absoluteFillObject, backgroundColor: '#CCCCCC', opacity: 0.6 },
  nearbyContent:  {
    ...StyleSheet.absoluteFillObject, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', padding: 16,
  },
  nearbyTextBlock: { backgroundColor: '#FFF', borderRadius: 12, padding: 10, maxWidth: '70%' },
  nearbyLabel:     { fontSize: 9, fontFamily: Fonts.secondary.semiBold, color: PINK, letterSpacing: 1 },
  nearbyName:      { fontSize: 14, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A' },
  nearbyDist:      { fontSize: 11, fontFamily: Fonts.secondary.regular, color: '#777777', marginTop: 2 },
  nearbyIconBtn:   { width: 44, height: 44, borderRadius: 22, backgroundColor: PINK, alignItems: 'center', justifyContent: 'center' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF', paddingHorizontal: 16,
    paddingTop: 14, paddingBottom: Platform.OS === 'ios' ? 32 : 18,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  addBtn: {
    backgroundColor: PINK, borderRadius: 50, paddingVertical: 17, alignItems: 'center',
    shadowColor: PINK, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  addBtnText: { fontSize: 16, fontFamily: Fonts.secondary.semiBold, color: '#FFF' },
});