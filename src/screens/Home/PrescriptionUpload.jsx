// src/screens/Home/PrescriptionUpload.jsx

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, Platform, ActivityIndicator, Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { PermissionsAndroid } from 'react-native';
import { useSelector } from 'react-redux';
import Fonts from '../../constant/Fonts';
import Toast from 'react-native-toast-message';
import { api , BASE_URL } from '../../services/service';

const PINK = '#B6005B';
const PHONE = '09240250346';

const showToast = (type, title, message) => {
  Toast.show({ type, text1: title, text2: message, position: 'top', visibilityTime: 3000 });
};

export default function PrescriptionUpload({ setModalVisible }) {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);   // 👈 to get customer id
  const customerId = user?.id;

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'We need camera access to capture your prescription.',
        buttonNegative: 'Cancel',
        buttonPositive: 'Allow',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;
    if (Platform.Version >= 33) return true;
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'We need access to your gallery to select a prescription.',
        buttonNegative: 'Cancel',
        buttonPositive: 'Allow',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handleGallery = async () => {
    if (!token) { setModalVisible(true); return; }
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      showToast('error', 'Permission Denied', 'Storage permission is required to select images.');
      return;
    }
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset) setImage(asset);
      }
    );
  };

  const handleCamera = async () => {
    if (!token) { setModalVisible(true); return; }
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      showToast('error', 'Permission Denied', 'Camera permission is required.');
      return;
    }
    launchCamera(
      { mediaType: 'photo', quality: 0.8, saveToPhotos: false },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset) setImage(asset);
      }
    );
  };


// const handleUpload = async () => {
//   if (!token) { setModalVisible(true); return; }
//   if (!image) {
//     showToast('info', 'No Image', 'Please select or capture a prescription first.');
//     return;
//   }

//   const formData = new FormData();
//   formData.append('img', {
//     uri: image.uri,
//     type: image.type || 'image/jpeg',
//     name: image.fileName || 'prescription.jpg',
//   });

//   setUploading(true);
//   console.log('------------ ', formData);
  
//   try {
//     const res = await api.post('/customer-medicine-store', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });

//     const status = res?.data?.status;
//     if (status === 200 || status === true) {
//       showToast('success', 'Uploaded!', res?.data?.message || 'Your prescription has been submitted successfully.');
//       setImage(null);
//     } else {
//       throw new Error(res?.data?.message || 'Upload failed.');
//     }
//   } catch (err) {
//     showToast('error', 'Upload Failed', err?.response?.data?.message || err?.message || 'Something went wrong.');
//     console.log('upload error ----------------- ', err?.response?.data || err);
//   } finally {
//     setUploading(false);
//   }
// };

// ── Submit to /customer-medicine-store ──────────────────────────────────────
const handleUpload = async () => {
  if (!token) { setModalVisible(true); return; }
  if (!image) {
    showToast('info', 'No Image', 'Please select or capture a prescription first.');
    return;
  }

  const formData = new FormData();
  formData.append('img', {
    uri: image.uri,
    type: image.type || 'image/jpeg',
    name: image.fileName || 'prescription.jpg',
  });

  setUploading(true);

  try {
    const res = await fetch(`${BASE_URL}/customer-medicine-store`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
      
    const json = await res.json();

    // console.log('json ------- ', json);
    

    if (!res.ok) {
      throw new Error(json?.message || 'Upload failed.');
    }

    const status = json?.status;
    if (status === 200 || status === true) {
      showToast('success', 'Uploaded!', json?.message || 'Your prescription has been submitted successfully.');
      setImage(null);
    } else {
      throw new Error(json?.message || 'Upload failed.');
    }
  } catch (err) {
    showToast('error', 'Upload Failed', err?.message || 'Something went wrong.');
    console.log('upload error ----------------- ', err);
  } finally {
    setUploading(false);
  }
};

  return (
    <View style={s.wrapper}>
      {/* ── Main row ── */}
      <View style={[s.card, { borderBottomLeftRadius: image ? 0 : 16, borderBottomRightRadius: image ? 0 : 16 }]}>
        {/* Left: doc icon */}
        <View style={s.iconWrap}>
          <Icon name="file-document" size={26} color={PINK} />
        </View>

        {/* Center: text */}
        <View style={s.center}>
          <Text style={s.title}>Add a prescription</Text>
          <Text style={s.sub}>to place your order</Text>
          <Text style={s.orCall}>
            Or call us to order on{' '}
            <Text
              style={s.phone}
              onPress={() => Linking.openURL(`tel:${PHONE}`)}
            >
              {PHONE}
            </Text>
          </Text>
        </View>

        {/* Right: Upload + Call buttons */}
        <View style={s.actions}>
          <TouchableOpacity
            style={s.uploadBtn}
            onPress={image ? handleUpload : handleGallery}
            activeOpacity={0.8}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={PINK} />
            ) : (
              <>
                <MaterialIcons name="upload" size={14} color={PINK} />
                <Text style={s.uploadText}>{image ? 'Submit' : 'Upload'}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.callBtn}
            onPress={() => Linking.openURL(`tel:${PHONE}`)}
            activeOpacity={0.8}
          >
            <Icon name="phone" size={18} color={PINK} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Thumbnail preview — shown BELOW the card row ── */}
      {image && (
        <View style={s.previewBar}>
          <View style={s.previewThumbWrap}>
            <Image source={{ uri: image.uri }} style={s.thumb} />
            <TouchableOpacity onPress={() => setImage(null)} style={s.removeBtn}>
              <MaterialIcons name="close" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={s.previewInfo}>
            <Text style={s.previewName} numberOfLines={1}>
              {image.fileName || 'prescription.jpg'}
            </Text>
            <Text style={s.previewSize}>
              {image.fileSize ? `${(image.fileSize / 1024).toFixed(1)} KB` : 'Ready to submit'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 7, gap: 10,
    borderWidth: 1, borderColor: '#F4C0D1',
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#FFF0F6', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#F4C0D1',
  },
  center: { flex: 1, gap: 2 },
  title: { fontSize: 13, fontFamily: Fonts.secondary?.semiBold || Fonts.bold, color: '#1A1C1C' },
  sub: { fontSize: 11, fontFamily: Fonts.secondary?.regular || Fonts.regular, color: '#888' },
  orCall: { fontSize: 10, fontFamily: Fonts.secondary?.regular || Fonts.regular, color: '#888', marginTop: 3 },
  phone: { color: PINK, fontFamily: Fonts.secondary?.semiBold || Fonts.bold },
  actions: { alignItems: 'center', gap: 8 },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 0.7, borderColor: PINK, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#FFF0F6',
  },
  uploadText: { fontSize: 13, fontFamily: Fonts.secondary?.semiBold || Fonts.bold, color: PINK, marginBottom: -2 },
  callBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#FFF0F6', borderWidth: 0.7, borderColor: '#F4C0D1',
    alignItems: 'center', justifyContent: 'center',
  },
  previewBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF0F6',
    borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
    borderWidth: 1, borderTopWidth: 0, borderColor: '#F4C0D1',
    paddingHorizontal: 14, paddingVertical: 10, gap: 10, marginTop: -4,
  },
  previewThumbWrap: { position: 'relative' },
  thumb: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#F4C0D1' },
  removeBtn: {
    position: 'absolute', top: -5, right: -5,
    backgroundColor: PINK, borderRadius: 9, width: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  previewInfo: { flex: 1, gap: 2 },
  previewName: { fontSize: 11, fontFamily: Fonts.secondary?.semiBold || Fonts.bold, color: '#1A1C1C' },
  previewSize: { fontSize: 10, fontFamily: Fonts.secondary?.regular || Fonts.regular, color: '#888' },
});