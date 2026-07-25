// src/screens/Address/EditAddressScreen.jsx

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, StatusBar, Platform, Switch, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fonts from '../../constant/Fonts';
import { api } from '../../services/service';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Alert } from 'react-native';
import * as RNLocationEnabler from 'react-native-android-location-enabler';
import Toast from 'react-native-toast-message'

const PINK = '#B6005B';
const TYPES = [ 'Home', 'Work', 'Other' ];

const showToast = (type, title, message) => {
  Toast.show({ type, text1: title, text2: message, position: 'top', visibilityTime: 3500 });
};

const createAddress = async ( payload, fromCart, navigation ) => {
  const res = await api.post( '/address-created', payload );
  const status = res?.data?.status;
  if ( status === 200 || status === true ) { navigation.goBack(); return true; }
  throw new Error( res?.data?.message || 'Failed to save address.' );
};

const updateAddress = async ( id, payload, navigation ) => {
  const res = await api.post( `/address-updated/${id}`, payload );
  const status = res?.data?.status;
  if ( status === 200 || status === true ) { navigation.goBack(); return true; }
  throw new Error( res?.data?.message || 'Failed to update address.' );
};


const LabelledInput = ({ label, value, onChangeText, placeholder, keyboardType, half, error, maxLength }) => (
  <View style={[f.fieldWrap, half && f.fieldHalf]}>
    <Text style={f.fieldLabel}>{label}</Text>
    <View style={[f.inputBox, error && f.inputBoxError]}>
      <TextInput
        style={f.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#CCCCCC"
        keyboardType={keyboardType || 'default'}
        autoCorrect={false}
        maxLength={maxLength}  
      />
    </View>
    {error ? <Text style={f.fieldError}>{error}</Text> : null}
  </View>
);

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function EditAddressScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { address, mode, addressId } = route.params || {};
  const fromCart = route?.params?.fromCart || false;
  const cartItems = route?.params?.cartItems || [];
  const totalAmount = route?.params?.totalAmount || 0;

  const isEdit = mode === 'edit';
  const resolvedId = addressId ?? address?.id;

  const [ form, setForm ] = useState( {
    name: address?.full_name || '',
    phone: address?.phone_number || '',
    street: address?.street_address || '',
    apt: address?.landmark || '',
    city: address?.city || '',
    state: address?.state || '',
    zip: address?.pin_code || '',
    country: address?.country || 'India',
    type: ( () => {
      const label = address?.address_label;
      if ( !label ) return 'Home';
      if ( TYPES.includes( label ) ) return label;
      return 'Other';
    } )(),
    isDefault: address?.isDefault || false,
  } );

  // ── Field errors state ───────────────────────────────────────────────────
  const [ errors, setErrors ] = useState( {} );
  const [ loading, setLoading ] = useState( false );
  const [ locLoading, setLocLoading ] = useState( false );

  const set = ( key ) => ( val ) => {
    setForm( ( p ) => ( { ...p, [ key ]: val } ) );
    // clear error on change
    if ( errors[ key ] ) setErrors( ( e ) => ( { ...e, [ key ]: '' } ) );
  };

  // ── Request location permission ──────────────────────────────────────────
  const requestLocationPermission = async () => {
    if ( Platform.OS === 'android' ) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need your location to auto-fill your address.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  // ── Nearby landmark ──────────────────────────────────────────────────────
  const fetchNearbyLandmark = async ( latitude, longitude ) => {
    const query = `
      [out:json][timeout:10];
      (
        node["amenity"~"hospital|school|college|pharmacy|bank|temple|mosque|church|police|fire_station|restaurant|hotel"](around:500,${latitude},${longitude});
        way["amenity"~"hospital|school|college|pharmacy|bank|temple|mosque|church|police|fire_station|restaurant|hotel"](around:500,${latitude},${longitude});
      );
      out body 5;
    `;
    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
    ];
    for ( const endpoint of endpoints ) {
      try {
        const res = await fetch( endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent( query )}`,
        } );
        const contentType = res.headers.get( 'content-type' ) || '';
        if ( !contentType.includes( 'application/json' ) && !contentType.includes( 'text/json' ) ) continue;
        const data = await res.json();
        const named = data.elements?.find( ( el ) => el.tags?.name );
        return named?.tags?.name || '';
      } catch { continue; }
    }
    return '';
  };

 

  const reverseGeocode = async (latitude, longitude) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'MedictoPharmacy/1.0' } });
  const data = await res.json();
  const addr = data.address || {};

  const street =
    addr.road ||
    addr.neighbourhood ||
    addr.suburb ||
    addr.village ||
    addr.hamlet ||
    (data.display_name ? data.display_name.split(',')[0].trim() : '') ||
    '';

  const landmark = [addr.suburb, addr.neighbourhood, addr.county].find(Boolean) || '';

  const city =
    addr.state_district ||
    addr.city ||
    addr.municipality ||
    addr.town ||
    addr.village ||
    addr.county ||
    '';

  const state   = addr.state    || '';
  const zip     = addr.postcode || '';
  const country = addr.country  || '';

  return { street, landmark, city, state, zip, country };
};

  const enableLocationServices = async () => {
    if ( Platform.OS !== 'android' ) return true;
    try {
      const enableResult = await RNLocationEnabler.promptForEnableLocationIfNeeded( {
        interval: 10000,
        fastInterval: 5000,
      } );
      return enableResult === 'enabled' || enableResult === 'already-enabled';
    } catch ( error ) {
      
      return false;
    }
  };

const handleUseCurrentLocation = async () => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    showToast('error', 'Permission Denied', 'Location permission is required. Please enable it in Settings.');
    return;
  }

  const locationEnabled = await enableLocationServices();
  if (!locationEnabled) {
    showToast('error', 'Location Off', 'Please turn on location services to auto-fill your address.');
    return;
  }

  setLocLoading(true);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const getPosition = (useHighAccuracy = true, retry = false) => {
    Geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const [addr, nearbyLandmark] = await Promise.all([
            reverseGeocode(latitude, longitude),
            fetchNearbyLandmark(latitude, longitude).catch(() => ''),
          ]);

          // console.log('adrs----------- ',addr);
          
          setForm((prev) => ({
            ...prev,
            street: addr.street   || prev.street,
            apt:    nearbyLandmark || addr.landmark || prev.apt,
            city:   addr.city     || prev.city,
            state:  addr.state    || prev.state,
            zip:    addr.zip      || prev.zip,
            country: addr.country || prev.country,
          }));
          setErrors({});
          showToast('success', 'Location Fetched', 'Your address has been auto-filled.');
        } catch (err) {
          showToast('error', 'Error', err.message || 'Failed to fetch address details.');
        } finally {
          setLocLoading(false);
        }
      },
      (error) => {
        if (error.code === 2 && !retry) {
          setTimeout(() => getPosition(false, true), 1500);
          return;
        }
        if (useHighAccuracy && !retry) {
          getPosition(false, true);
          return;
        }
        setLocLoading(false);
        showToast(
          'error',
          'Location Error',
          error.code === 1
            ? 'Permission denied. Please allow location access in Settings.'
            : error.code === 2
            ? 'Location unavailable. Please check your GPS settings.'
            : 'Could not get your location. Please try again.',
        );
      },
      {
        enableHighAccuracy: useHighAccuracy,
        timeout: useHighAccuracy ? 10000 : 20000,
        maximumAge: useHighAccuracy ? 5000 : 30000,
      }
    );
  };

  getPosition(true);
};


const validate = () => {
  const newErrors = {};

  if (!form.name.trim())
    newErrors.name = 'Full name is required.';

  if (!form.phone.trim())
    newErrors.phone = 'Phone number is required.';
  else if (!/^\+?[\d\s\-]{10,13}$/.test(form.phone.trim()) || form.phone.replace(/\D/g, '').length !== 10)
    newErrors.phone = 'Enter a valid 10-digit mobile number.';

  if (!form.street.trim())
    newErrors.street = 'Street address is required.';

  if (!form.city.trim())
    newErrors.city = 'City is required.';

  if (!form.state.trim())
    newErrors.state = 'State is required.';

  if (!form.zip.trim())
    newErrors.zip = 'PIN code is required.';
  else if (!/^\d{6}$/.test(form.zip.trim()))
    newErrors.zip = 'Enter a valid 6-digit PIN code.';

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSave = async () => {
  if (!validate()) return;
  const payload = {
    full_name:      form.name.trim(),
    phone_number:   form.phone.trim(),
    street_address: form.street.trim(),
    landmark:       form.apt.trim(),
    city:           form.city.trim(),
    state:          form.state.trim(),
    pin_code:       form.zip.trim(),
    address_label:  form.type,
  };
  setLoading(true);
  try {
    if (isEdit) {
      await updateAddress(resolvedId, payload, navigation);
    } else {
      await createAddress(payload, fromCart, navigation);
    }
  } catch (error) {
    showToast('error', 'Error', error?.response?.data?.message || error?.message || 'Something went wrong.');
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={f.screen}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={f.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={f.hIcon}>
          <MaterialIcons name="arrow-back" size={22} color={PINK} />
        </TouchableOpacity>
        <Text style={f.headerTitle}>{isEdit ? 'Edit Address' : 'Add Address'}</Text>

        {!isEdit && (
          <TouchableOpacity
            style={f.locBtn}
            onPress={handleUseCurrentLocation}
            disabled={locLoading}
            activeOpacity={0.8}
          >
            {locLoading ? (
              <ActivityIndicator size="small" color={PINK} />
            ) : (
              <>
                <MaterialIcons name="my-location" size={16} color={PINK} />
                <Text style={f.locBtnText}>Use Location</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {locLoading && (
        <View style={f.locBanner}>
          <ActivityIndicator size="small" color="#FFF" />
          <Text style={f.locBannerText}>Fetching your location...</Text>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={f.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={f.sectionLabel}>SHIPPING INFORMATION</Text>
        <Text style={f.sectionSub}>
          Please ensure your delivery details are accurate for temperature-sensitive medications.
        </Text>

        <View style={f.formBlock}>
          <LabelledInput label="Full Name" value={form.name} onChangeText={set( 'name' )} placeholder="Cameron Williamson" error={errors.name} />
          <LabelledInput label="Phone Number" value={form.phone} onChangeText={set( 'phone' )} placeholder="+91 9876543210" error={errors.phone} keyboardType="phone-pad"  maxLength={10}  />
          <LabelledInput label="Street Address" value={form.street} onChangeText={set( 'street' )} placeholder="4522 Medical Center Drive" error={errors.street} />
          <LabelledInput label="Landmark (Optional)" value={form.apt} onChangeText={set( 'apt' )} placeholder="Near City Hospital" />
          <View style={f.halfRow}>
            <LabelledInput label="City" value={form.city} onChangeText={set( 'city' )} placeholder="Jaipur" half error={errors.city} />
            <LabelledInput label="State" value={form.state} onChangeText={set( 'state' )} placeholder="RJ" half error={errors.state} />
          </View>
          <LabelledInput label="PIN Code" value={form.zip} onChangeText={set( 'zip' )} placeholder="400001"  maxLength={6}  keyboardType="number-pad" error={errors.zip} />
        </View>

        {/* Address label chips */}
        <Text style={f.labelTitle}>Address Label</Text>
        <View style={f.typeRow}>
          {TYPES.map( ( t ) => {
            const active = form.type === t;
            const iconName = t === 'Home' ? 'home' : t === 'Work' ? 'briefcase-outline' : 'dots-horizontal';
            return (
              <TouchableOpacity
                key={t}
                style={[ f.typeChip, active && f.typeChipActive ]}
                onPress={() => set( 'type' )( t )}
                activeOpacity={0.8}
              >
                <Icon name={iconName} size={15} color={active ? '#FFF' : '#555'} />
                <Text style={[ f.typeChipText, active && f.typeChipTextActive ]}>{t}</Text>
              </TouchableOpacity>
            );
          } )}
        </View>

        {/* Set as Default toggle */}
        <View style={f.toggleCard}>
          <View style={f.toggleLeft}>
            <Text style={f.toggleTitle}>Set as Default Address</Text>
            <Text style={f.toggleSub}>Use this as primary for future orders</Text>
          </View>
          <Switch
            value={form.isDefault}
            onValueChange={set( 'isDefault' )}
            trackColor={{ false: '#E0E0E0', true: PINK }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E0E0E0"
          />
        </View>

        {/* <View style={f.mapBox}>
          <View style={f.mapPlaceholder}>
            <View style={f.mapGrid}>
              {Array.from( { length: 20 } ).map( ( _, i ) => <View key={i} style={f.mapCell} /> )}
            </View>
            <View style={f.mapPinWrap}>
              <View style={f.mapPin}>
                <Icon name="map-marker" size={28} color={PINK} />
              </View>
            </View>
          </View>
        </View> */}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save button */}
      <View style={f.footer}>
        <TouchableOpacity
          style={[ f.saveBtn, loading && f.saveBtnDisabled ]}
          onPress={handleSave}
          activeOpacity={0.88}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#FFF" size="small" />
            : <Text style={f.saveBtnText}>Save Address</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const f = StyleSheet.create( {
  screen: { flex: 1, backgroundColor: '#F7F7F9' },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    paddingHorizontal: 8, paddingTop: Platform.OS === 'ios' ? 54 : 36, paddingBottom: 12,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  hIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, marginTop: 5, fontSize: 17, fontFamily: Fonts.secondary.semiBold, color: PINK },
  locBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FFF0F6', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: '#F4C0D1',
    marginRight: 8, minWidth: 44, justifyContent: 'center',
  },
  locBtnText: { fontSize: 12, fontFamily: Fonts.secondary.semiBold, color: PINK, marginBottom: -2 },
  locBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: PINK, paddingVertical: 10,
  },
  locBannerText: { fontSize: 13, fontFamily: Fonts.secondary.medium, color: '#FFF' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 24 },
  sectionLabel: { fontSize: 15, fontFamily: Fonts.secondary.semiBold, color: PINK, letterSpacing: 1.2, marginBottom: 8 },
  sectionSub: { fontSize: 13.5, fontFamily: Fonts.secondary.regular, color: '#5A4046', lineHeight: 20, marginBottom: 24 },
  formBlock: { gap: 16, marginBottom: 24 },
  halfRow: { flexDirection: 'row', gap: 12 },
  fieldWrap: { flex: 1 },
  fieldHalf: { flex: 1 },
  fieldLabel: { fontSize: 13, fontFamily: Fonts.secondary.semiBold, color: '#5A4046', marginBottom: 4 },
  inputBox: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2BDC5' },
  inputBoxError: { borderColor: '#DC2626' },   // 👈 red border on error
  input: {
    paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 15 : 13,
    fontSize: 14, fontFamily: Fonts.secondary.regular, color: '#1A1C1C', marginBottom: -4,
  },
  fieldError: {
    fontSize: 10,                              // 👈 as requested
    fontFamily: Fonts.secondary.regular,       // 👈 as requested
    color: '#DC2626',                          // 👈 red
    marginTop: 4,
    marginLeft: 4,
  },
  labelTitle: { fontSize: 15, fontFamily: Fonts.secondary.semiBold, color: '#1A1C1C', marginBottom: 12 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#EEEEEE', borderWidth: 1, borderColor: '#EEEEEE' },
  typeChipActive: { backgroundColor: PINK, borderColor: PINK },
  typeChipText: { fontSize: 13, fontFamily: Fonts.secondary.semiBold, color: '#555555', marginBottom: -3 },
  typeChipTextActive: { color: '#FFFFFF' },
  toggleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F3F3F4', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#EEEEEE' },
  toggleLeft: { flex: 1, paddingRight: 12 },
  toggleTitle: { fontSize: 15, fontFamily: Fonts.secondary.semiBold, color: '#1A1C1C' },
  toggleSub: { fontSize: 11, fontFamily: Fonts.secondary.regular, color: '#5A4046', marginTop: -2 },
  mapBox: { borderRadius: 16, overflow: 'hidden', height: 160, marginBottom: 20 },
  mapPlaceholder: { flex: 1, backgroundColor: '#E8E8E8', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  mapGrid: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', flexWrap: 'wrap' },
  mapCell: { width: '20%', height: 32, borderWidth: 0.5, borderColor: 'rgba(180,180,180,0.5)' },
  mapPinWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  mapPin: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 14, paddingBottom: Platform.OS === 'ios' ? 32 : 28, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  saveBtn: { backgroundColor: PINK, borderRadius: 50, paddingVertical: 17, alignItems: 'center', shadowColor: PINK, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { fontSize: 16, fontFamily: Fonts.secondary.semiBold, color: '#FFF', marginBottom: -3 },
} );