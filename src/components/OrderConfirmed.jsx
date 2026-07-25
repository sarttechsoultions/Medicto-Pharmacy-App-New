import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Platform, Animated, Modal, TextInput, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fonts from '../constant/Fonts';
import { useRoute } from '@react-navigation/native';
import { api } from '../services/service';
import Toast from 'react-native-toast-message';

const PINK = '#B6005B';
const GREEN = '#1B6B2F';

const showToast = (type, title, message) => {
  Toast.show({ type, text1: title, text2: message, position: 'top', visibilityTime: 3000 });
};


export default function OrderConfirmed( { navigation, route } ) {
  const orderDetails = route?.params?.orderDetail
  const orderId = orderDetails?.order_id || '12345';
  const firstItem = orderDetails?.items?.[0];
  const medicineId = firstItem?.order_id;

  // console.log('medicine ---------- ', orderDetails);
  

  const paymentMode = route?.params?.paymentMode || 'online';

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const scaleAnim = useRef( new Animated.Value( 0 ) ).current;
  const fadeAnim = useRef( new Animated.Value( 0 ) ).current;
  const slideAnim = useRef( new Animated.Value( 40 ) ).current;
  const dotAnim = useRef( new Animated.Value( 0 ) ).current;
  



  useEffect( () => {
    // 1. Pop the checkmark circle
    Animated.spring( scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 14,
      delay: 100,
    } ).start();

    // 2. Fade + slide content up
    Animated.parallel( [
      Animated.timing( fadeAnim, {
        toValue: 1, duration: 500, delay: 350, useNativeDriver: true,
      } ),
      Animated.timing( slideAnim, {
        toValue: 0, duration: 420, delay: 350, useNativeDriver: true,
      } ),
    ] ).start();

    // 3. Pulse the green dot
    Animated.loop(
      Animated.sequence( [
        Animated.timing( dotAnim, { toValue: 1, duration: 700, useNativeDriver: true } ),
        Animated.timing( dotAnim, { toValue: 0.3, duration: 700, useNativeDriver: true } ),
      ] )
    ).start();
  }, [] );

  const dotOpacity = dotAnim.interpolate( { inputRange: [ 0, 1 ], outputRange: [ 0.3, 1 ] } );


  // Add this helper above the component
  const getEstimatedArrival = () => {
    const now = new Date();

    const from = new Date( now.getTime() + 2 * 60 * 60 * 1000 ); // +2 hours
    const to = new Date( now.getTime() + 3 * 60 * 60 * 1000 ); // +3 hours

    const fmt = ( date ) =>
      date.toLocaleTimeString( 'en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      } );

    const isToday = true; // always today since it's estimated from now
    const dayLabel = isToday ? 'Today' : '';

    return `${dayLabel}, ${fmt( from )} – ${fmt( to )}`;
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      setReviewError('Please select a star rating.');
      return;
    }
    setReviewError('');
    setSubmittingReview(true);
    try {
      const formData = new FormData();
      formData.append('medicine_id', String(medicineId));
      formData.append('rating', String(rating));
      formData.append('review', reviewText.trim());

      const res = await api.post('/review-add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('resp ------------- ', res);
      
      const status = res?.data?.status;
      if (status === 200 || status === true) {
        showToast('success', 'Thank You!', 'Your review has been submitted.');
        setReviewModalVisible(false);
        setRating(0);
        setReviewText('');
      } else {
        throw new Error(res?.data?.message || 'Failed to submit review.');
      }
    } catch (err) {
      showToast('error', 'Error', err?.response?.data?.message || err?.message || 'Something went wrong.');
    } finally {
      setSubmittingReview(false);
    }
  };
  


  return (
    <View style={s.screen}>
      <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />

      {/* ── Background decorative circles ── */}
      <View style={s.bgCircleTL} />
      <View style={s.bgCircleBR} />

      {/* ── Diamond decorators ── */}
      <View style={[ s.diamond, { top: 160, left: 28 } ]} />
      <View style={[ s.diamond, { top: 220, right: 36 } ]} />

      <View style={s.content}>

        {/* ── Checkmark circle ── */}
        <Animated.View style={[ s.checkCircleWrap, { transform: [ { scale: scaleAnim } ] } ]}>
          {/* Outer glow ring */}
          <View style={s.checkCircleOuter}>
            <View style={s.checkCircleInner}>
              <Icon name="check" size={42} color="#FFFFFF" />
            </View>
          </View>
          {/* Pulsing green dot top-right */}
          <Animated.View style={[ s.greenDot, { opacity: dotOpacity } ]} />
        </Animated.View>

        {/* ── Text block ── */}
        <Animated.View
          style={[ s.textBlock, { opacity: fadeAnim, transform: [ { translateY: slideAnim } ] } ]}
        >
          <Text style={s.title}>Order Confirmed!</Text>
          <Text style={s.subtitle}>
            Your order{' '}
            <Text style={s.orderId}>#{orderId}</Text>
            {' '}has been placed{'\n'}successfully. We've sent a detailed{'\n'}receipt to your registered email.
          </Text>
        </Animated.View>

        {/* ── Delivery Status card ── */}
        <Animated.View
          style={[ s.statusCard, { opacity: fadeAnim, transform: [ { translateY: slideAnim } ] } ]}
        >
          <View style={s.statusCardHeader}>
            <Text style={s.statusLabel}>DELIVERY STATUS</Text>
            <View style={s.preparingBadge}>
              <Text style={s.preparingText}>PREPARING</Text>
            </View>
          </View>

          <View style={s.statusCardBody}>
            <View style={s.truckIconBox}>
              <Icon name="truck-delivery-outline" size={22} color="#555555" />
            </View>
            <View>
              <Text style={s.arrivalTitle}>Estimated Arrival</Text>
              <Text style={s.arrivalTime}>{getEstimatedArrival()}</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Buttons ── */}
      <Animated.View
          style={[ s.buttonsBlock, { opacity: fadeAnim, transform: [ { translateY: slideAnim } ] } ]}
        >
          {/* Rate Order */}
          {/* {medicineId && ( */}
            {/* <TouchableOpacity
              style={s.rateBtn}
              activeOpacity={0.85}
              onPress={() => setReviewModalVisible(true)}
            >
              <Icon name="star-outline" size={18} color={PINK} />
              <Text style={s.rateBtnText}>Rate Order</Text>
            </TouchableOpacity> */}
          {/* )} */}

          <TouchableOpacity
            style={s.continueBtn}
            activeOpacity={0.8}
            onPress={() => navigation?.navigate( 'Home' )}
          >
            <Text style={s.continueBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
       <Modal
        visible={reviewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <TouchableOpacity
              style={s.modalCloseBtn}
              onPress={() => setReviewModalVisible(false)}
            >
              <MaterialIcons name="close" size={20} color="#888" />
            </TouchableOpacity>

            <Text style={s.modalTitle}>Rate Your Order</Text>
            <Text style={s.modalSub}>
              How was {firstItem?.medicine_name || 'this medicine'}?
            </Text>

            {/* Stars */}
            <View style={s.starsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => { setRating(i); setReviewError(''); }}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={i <= rating ? 'star' : 'star-border'}
                    size={36}
                    color={i <= rating ? '#0D631B' : '#a0a0a0'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {reviewError ? <Text style={s.modalError}>{reviewError}</Text> : null}

            {/* Review text */}
            <View style={s.reviewInputBox}>
              <TextInput
                style={s.reviewInput}
                placeholder="Write your review (optional)"
                placeholderTextColor="#BBBBBB"
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[s.submitReviewBtn, submittingReview && { opacity: 0.7 }]}
              onPress={handleSubmitReview}
              activeOpacity={0.88}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={s.submitReviewText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create( {
  screen: {
    flex: 1,
    backgroundColor: '#F7F9FC',   // light greenish-white bg from design
  },

  // Background decorative blobs
  bgCircleTL: {
    position: 'absolute',
    top: -60, left: -60,
    width: 220, height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(200,230,200,0.45)',
  },
  bgCircleBR: {
    position: 'absolute',
    bottom: -80, right: -60,
    width: 260, height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(180,220,180,0.35)',
  },

  // Small diamond decorators
  diamond: {
    position: 'absolute',
    width: 10, height: 10,
    borderRadius: 2,
    backgroundColor: 'rgba(150,200,150,0.5)',
    transform: [ { rotate: '45deg' } ],
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    gap: 24,
  },

  // ── Check circle ──────────────────────────────────────────────────────────────
  checkCircleWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  checkCircleOuter: {
    width: 110, height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(27,107,47,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleInner: {
    width: 84, height: 84,
    borderRadius: 42,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  greenDot: {
    position: 'absolute',
    top: 6, right: 6,
    width: 14, height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#EEF6EE',
  },

  // ── Text ─────────────────────────────────────────────────────────────────────
  textBlock: { alignItems: 'center', gap: 10 },
  title: {
    fontSize: 26,
    fontFamily: Fonts.secondary.semiBold,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.secondary.regular,
    color: '#40493D',
    textAlign: 'center',
    lineHeight: 22,
  },
  orderId: {
    fontFamily: Fonts.secondary.bold,
    color: PINK,
  },

  // ── Status card ──────────────────────────────────────────────────────────────
  statusCard: {
    width: '100%',
    backgroundColor: '#F2F4F7',
    borderRadius: 16,
    padding: 16,
    gap: 14,

  },
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 11,
    fontFamily: Fonts.secondary.semiBold,
    color: '#AAAAAA',
    letterSpacing: 1.2,
  },
  preparingBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  preparingText: {
    fontSize: 10,
    fontFamily: Fonts.secondary.semiBold,
    color: '#2E7D32',
    letterSpacing: 0.8,
  },
  statusCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  truckIconBox: {
    width: 44, height: 44,
    borderRadius: 12,
    backgroundColor: '#e4e4e4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrivalTitle: {
    fontSize: 14,
    fontFamily: Fonts.secondary.semiBold,
    color: '#1A1A1A',
  },
  arrivalTime: {
    fontSize: 12,
    fontFamily: Fonts.secondary.medium,
    color: '#777777',
    marginTop: -2,
  },

  // ── Buttons ──────────────────────────────────────────────────────────────────
  buttonsBlock: { width: '100%', gap: 12 },

  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#B6005B',
    borderRadius: 50,
    paddingVertical: 17,
    width: '100%',
    // shadowColor: PINK,
    // shadowOpacity: 0.35,
    // shadowRadius: 12,
    // shadowOffset: { width: 0, height: 5 },
    // elevation: 7,
  },
  trackBtnText: {
    fontSize: 16,
    fontFamily: Fonts.secondary.semiBold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: -3
  },

  continueBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#d5d5d5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    fontSize: 16,
    fontFamily: Fonts.secondary.semiBold,
    color: '#B6005B',
    marginBottom: -4,
  },

  // ── Security ─────────────────────────────────────────────────────────────────
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  securityText: {
    fontSize: 9,
    fontFamily: Fonts.secondary.medium,
    color: '#40493D',
    letterSpacing: 1.2,
  },
  rateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: PINK, borderRadius: 50,
    paddingVertical: 15, width: '100%', backgroundColor: '#FFF0F6',
  },
  rateBtnText: {
    fontSize: 15, fontFamily: Fonts.secondary.semiBold, color: PINK, marginBottom: -3,
  },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20,
    padding: 24, alignItems: 'center', position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute', top: 14, right: 14, padding: 4, zIndex: 1,
  },
  modalTitle: {
    fontSize: 18, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A', marginBottom: 4,
  },
  modalSub: {
    fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#888',
    textAlign: 'center', marginBottom: 18,
  },
  starsRow: {
    flexDirection: 'row', gap: 6, marginBottom: 6,
  },
  modalError: {
    fontSize: 11, fontFamily: Fonts.secondary.regular, color: '#DC2626', marginBottom: 8,
  },
  reviewInputBox: {
    width: '100%', backgroundColor: '#F7F7F9', borderRadius: 14,
    borderWidth: 1, borderColor: '#a7a7a7', padding: 12, marginTop: 14, marginBottom: 18,
    minHeight: 80,
  },
  reviewInput: {
    fontSize: 14, fontFamily: Fonts.secondary.regular, color: '#1A1A1A',
  },
  submitReviewBtn: {
    width: '100%', backgroundColor: PINK, borderRadius: 50,
    paddingVertical: 15, alignItems: 'center',
  },
  submitReviewText: {
    fontSize: 15, fontFamily: Fonts.secondary.semiBold, color: '#FFF', marginBottom: -3,
  },
} );