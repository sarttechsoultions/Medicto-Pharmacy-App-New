// src/screens/Auth/ProfileUpdate.jsx

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView, Image, Alert,ActivityIndicator,
  Modal, Pressable
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth } from '../../redux/slice/authSlice';
import Toast from 'react-native-toast-message';
import Fonts from '../../constant/Fonts';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { api, base_api , BASE_URL } from '../../services/service';



import { setApiToken } from '../../services/service';


const PINK = '#B6005B';
const GENDER_OPTIONS = [ 'Male', 'Female', 'Other', 'Prefer not to say' ];

const Logo = () => (
  <View style={styles.logoWrap}>
    <Image
      source={require( '../../assets/images/medicto_logo_text.jpg.png' )}
      style={styles.logoImg}
      resizeMode="contain"
    />
  </View>
);

export default function ProfileUpdate( { navigation } ) {
  const dispatch = useDispatch();
  const token = useSelector( ( state ) => state.auth.token );
  const reduxUser = useSelector( ( state ) => state.auth.user );
  const route = useRoute();
  const isNotCompleted = route.params?.isNotCompleted;
  const existingImageUri = reduxUser?.profile_img
    ? `${base_api}${reduxUser.profile_img}`
    : reduxUser?.profileImage || null;
   
  const [ avatar, setAvatar ] = useState( null );
  const [ loading, setLoading ] = useState( false );
  const [ photoSheetVisible, setPhotoSheetVisible ] = useState( false );
  const normalizeGender = ( g = '' ) => {
    const map = { male: 'Male', female: 'Female', other: 'Other', 'prefer not to say': 'Prefer not to say' };
    return map[ g.toLowerCase() ] ?? g ?? '';
  };

  // console.log('reduc user ------------ ', reduxUser);
  

  const [ form, setForm ] = useState( {
    name: reduxUser?.name || '',
    phone: reduxUser?.number || '',
    gender: normalizeGender( reduxUser?.gender || '' ),
  });


  const set = ( key ) => ( val ) => setForm( ( f ) => ( { ...f, [ key ]: val } ) );

  // ── Permissions ───────────────────────────────────────────────────────────
  const requestCameraPermission = async () => {
    if ( Platform.OS !== 'android' ) return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        { title: 'Camera Permission', message: 'Allow access to your camera', buttonPositive: 'Allow', buttonNegative: 'Cancel' }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch { return false; }
  };

  const requestGalleryPermission = async () => {
    if ( Platform.OS !== 'android' ) return true;
    try {
      const permission = Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const granted = await PermissionsAndroid.request( permission, {
        title: 'Photo Permission', message: 'Allow access to your photos', buttonPositive: 'Allow', buttonNegative: 'Cancel',
      } );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch { return false; }
  };

  // ── Pick image — store full object ────────────────────────────────────────
  const handleImageResult = ( response ) => {
    if ( response.didCancel || response.errorCode ) return;
    const image = response.assets?.[ 0 ];
    if ( image?.uri ) {
      // Store full object so we have uri + type + fileName for FormData
      setAvatar( {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        fileName: image.fileName || 'profile.jpg',
      } );
    }
  };

  const openCamera = async () => {
    setPhotoSheetVisible( false );
    const ok = await requestCameraPermission();
    if ( !ok ) { Alert.alert( 'Permission Required', 'Camera permission is required.' ); return; }
    launchCamera( { mediaType: 'photo', quality: 0.8, saveToPhotos: true }, handleImageResult );
  };

  const openGallery = async () => {
    setPhotoSheetVisible( false );
    const ok = await requestGalleryPermission();
    if ( !ok ) { Alert.alert( 'Permission Required', 'Gallery permission is required.' ); return; }
    launchImageLibrary( { mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, handleImageResult );
  };

  const handlePickImage = () => {
    setPhotoSheetVisible( true );
  };

  const handleSubmit = async () => {
    if ( !form.name.trim() ) { Alert.alert( 'Required', 'Please enter your full name.' ); return; }
    if ( !form.phone.trim() ) { Alert.alert( 'Required', 'Please enter your phone number.' ); return; }

    setLoading( true );
    try {
      const formData = new FormData();
      formData.append( 'name', form.name.trim() );
      formData.append( 'number', form.phone.trim() );
      formData.append( 'gender', form.gender.toLowerCase() );

      if ( avatar?.uri ) {
        formData.append( 'profile_img', {
          uri: Platform.OS === 'android'
            ? avatar.uri
            : avatar.uri.replace( 'file://', '' ),
          type: avatar.type,
          name: avatar.fileName,
        } );
      }
      const response = await fetch( `${BASE_URL}/update-profile`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...( token && { Authorization: `Bearer ${token}` } ),
        },
        body: formData,
      } );
      const data = await response.json();
      console.log( 'UPDATE PROFILE RESPONSE =>', data );

      if ( response.status === 200) {
        const updatedUser = data?.user ?? {
          ...reduxUser,
          name: form.name.trim(),
          number: form.phone.trim(),
          gender: form.gender.toLowerCase(),
        };

        await AsyncStorage.setItem( 'user', JSON.stringify( updatedUser ) );
        dispatch( setAuth( { token, user: updatedUser } ) );
        // console.log('---------- ', updatedUser);
        

        Toast.show( {
          type: 'success',
          text1: 'Profile Updated!',
          text2: data?.message || 'Your profile has been saved.',
        } );

        setTimeout( () => navigation?.navigate( 'Home' ), 600 );
      } else {
        Toast.show( {
          type: 'error',
          text1: 'Update Failed',
          text2: data?.message || 'Something went wrong.',
        } );
      }
    } catch ( err ) {
      console.log( 'UPLOAD ERROR =>', err?.message );
      Toast.show( {
        type: 'error',
        text1: 'Network Error',
        text2: 'Could not update profile. Please try again.',
      } );
    } finally {
      setLoading( false );
    }
  };

  const isDisabled = loading || !form.name.trim() || !form.phone.trim();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar backgroundColor="#F7F7F9" barStyle="dark-content" />
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {!isNotCompleted &&  (
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.hIcon}>
            <MaterialIcons name="arrow-back" size={22} color="#DB2777" />
          </TouchableOpacity>)}
          <Text style={styles.hTitle}>{isNotCompleted ? "Register" : 'Update Profile'}</Text>
        </View>

      </View>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Logo />

        <View style={styles.headingBlock}>
          {!isNotCompleted && (
            <Text style={styles.heading}>{!isNotCompleted && 'Update Your Profile'}</Text>
          )}
          <Text style={[ styles.headingSub, { marginTop: isNotCompleted ? -20 : 0 } ]}>{isNotCompleted && 'Join our premium health concierge'} </Text>
        </View>

        {/* Avatar picker */}
        <TouchableOpacity style={styles.avatarWrap} onPress={handlePickImage} activeOpacity={0.85}>
          {avatar?.uri ? (
            <Image source={{ uri: avatar.uri }} style={styles.avatarImg} resizeMode='cover'/>
          ) : existingImageUri ? (
            <Image source={{ uri: existingImageUri }} style={styles.avatarImg} resizeMode='cover' />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons name="person" size={46} color="#BDBDBD" />
            </View>
          )}
          <View style={styles.cameraBadge}>
            <MaterialIcons name="camera-alt" size={16} color="#FFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>Tap to upload profile photo</Text>

        {/* Form */}
        <View style={styles.form}>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons name="person-outline" size={18} color="#BDBDBD" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#BDBDBD"
                value={form.name}
                onChangeText={set( 'name' )}
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons name="phone" size={18} color="#BDBDBD" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#BDBDBD"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={set( 'phone' )}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderGrid}>
              {GENDER_OPTIONS.map( ( g ) => {
                const active = form.gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    style={[ styles.genderChip, active && styles.genderChipActive ]}
                    onPress={() => set( 'gender' )( g )}
                    activeOpacity={0.8}
                  >
                    <Text style={[ styles.genderChipText, active && styles.genderChipTextActive ]}>{g}</Text>
                  </TouchableOpacity>
                );
              } )}
            </View>
          </View>

          <TouchableOpacity
            style={[ styles.primaryBtn, isDisabled && styles.primaryBtnDisabled ]}
            onPress={handleSubmit}
            activeOpacity={(loading || isDisabled) ? .4 : 0.85}
            disabled={isDisabled}
          >
            <Text style={styles.primaryBtnText}>{loading ? <ActivityIndicator size={20} color={'#B6005B'} /> : 'Continue'}</Text>
            {!loading && (
              <MaterialIcons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 6 }} />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>HEALTH CONCIERGE PREMIUM MEDICAL NETWORK</Text>
      </ScrollView>

      {/* Custom photo option sheet */}
      <Modal
        visible={photoSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoSheetVisible( false )}
        statusBarTranslucent
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setPhotoSheetVisible( false )}>
          <Pressable style={styles.sheetCard} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Profile Photo</Text>
            <Text style={styles.sheetSubtitle}>Choose how you'd like to add your photo</Text>

            <TouchableOpacity style={styles.sheetOption} onPress={openCamera} activeOpacity={0.75}>
              <View style={styles.sheetIconWrap}>
                <MaterialIcons name="camera-alt" size={20} color={PINK} />
              </View>
              <View style={styles.sheetOptionTextWrap}>
                <Text style={styles.sheetOptionTitle}>Take Photo</Text>
                <Text style={styles.sheetOptionDesc}>Use your camera</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#D9D9D9" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetOption} onPress={openGallery} activeOpacity={0.75}>
              <View style={styles.sheetIconWrap}>
                <MaterialIcons name="photo-library" size={20} color={PINK} />
              </View>
              <View style={styles.sheetOptionTextWrap}>
                <Text style={styles.sheetOptionTitle}>Choose from Gallery</Text>
                <Text style={styles.sheetOptionDesc}>Pick an existing photo</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#D9D9D9" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetCancelBtn}
              onPress={() => setPhotoSheetVisible( false )}
              activeOpacity={0.85}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ─── Styles (original — untouched, + new sheet styles) ──────────────────────
const styles = StyleSheet.create( {
  flex: { flex: 1, backgroundColor: '#F7F7F9' },
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

  container: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 28, paddingTop: 56, paddingBottom: 32, backgroundColor: '#F7F7F9' },
  logoWrap: { marginBottom: 28 , marginTop : -45 },
  logoImg: { width: 180, height: 50 },
  headingBlock: { alignItems: 'center', marginBottom: 28 },
  heading: { fontSize: 24, fontFamily: Fonts.semiBold, color: '#1A1A1A', marginBottom: 6 },
  headingSub: { fontSize: 14.5, fontFamily: Fonts.regular, color: '#6C5964', textAlign: 'center' },
  avatarWrap: { width: 80, height: 80, borderRadius: 52, marginBottom: 8, position: 'relative' },
  avatarImg: { width: 80, height: 80, borderRadius: 52, borderWidth: 3, borderColor: PINK },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 52, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dashed' },
  cameraBadge: { position: 'absolute', bottom: 1, right: 1, width: 25, height: 25, borderRadius: 15, backgroundColor: PINK, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  avatarHint: { fontSize: 12, fontFamily: Fonts.regular, color: '#AAAAAA', marginBottom: 28 },
  form: { width: '100%' },
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontFamily: Fonts.semiBold, color: '#444444', marginBottom: 8 },
  inputWrap: { backgroundColor: '#FFFFFF', borderRadius: 32, borderWidth: 1, borderColor: '#EBEBEB', flexDirection: 'row', alignItems: 'center' },
  inputIcon: { paddingLeft: 14 },
  input: { flex: 1, paddingHorizontal: 10, paddingVertical: 17, fontSize: 15, fontFamily: Fonts.regular, color: '#1A1A1A' },
  genderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  genderChip: { paddingHorizontal: 22, paddingVertical: 9, borderRadius: 24, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FFFFFF' },
  genderChipActive: { borderColor: PINK, backgroundColor: '#FFF0F6' },
  genderChipText: { fontSize: 13, fontFamily: Fonts.medium, color: '#777777' },
  genderChipTextActive: { color: PINK, fontFamily: Fonts.semiBold },
  primaryBtn: { backgroundColor: PINK, borderRadius: 14, paddingVertical: 17, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 8, marginBottom: 32, shadowColor: PINK, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  primaryBtnDisabled: { opacity: 0.45, elevation: 0, shadowOpacity: 0 },
  primaryBtnText: { fontFamily: Fonts.bold, color: '#FFF', fontSize: 16, letterSpacing: 0.3 },
  footer: { fontFamily: Fonts.regular, fontSize: 9, color: '#BDBDBD', letterSpacing: 1.2, textAlign: 'center' },

  // ── Custom photo sheet ──────────────────────────────────────────────────
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 15, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 22,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#E5E5E5',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontFamily: Fonts.semiBold,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#9A9A9A',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sheetIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sheetOptionTextWrap: { flex: 1 },
  sheetOptionTitle: { fontSize: 14.5, fontFamily: Fonts.semiBold, color: '#1A1A1A' },
  sheetOptionDesc: { fontSize: 12, fontFamily: Fonts.regular, color: '#9A9A9A', marginTop: 1 },
  sheetCancelBtn: {
    marginTop: 4,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  sheetCancelText: { fontSize: 15, fontFamily: Fonts.semiBold, color: '#777777' },
} );