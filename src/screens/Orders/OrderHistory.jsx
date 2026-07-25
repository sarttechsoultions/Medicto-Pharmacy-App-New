// src/screens/Orders/OrderHistoryScreen.jsx

import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Platform, Image, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { Modal } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fonts from '../../constant/Fonts';
import { useSelector } from 'react-redux';
import GuestScreen from '../../components/GuestLogin';
import { base_api, BASE_URL } from '../../services/service';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { TextInput } from 'react-native';

const PINK = '#B6005B';

const STATUS_CONFIG = {
  Ordered: { label: 'ORDERED', bg: '#FEF3C7', color: '#D97706' },
  Confirmed: { label: 'CONFIRMED', bg: '#D1FAE5', color: '#059669' },
  Processing: { label: 'PROCESSING', bg: '#E8F0FE', color: '#1A56DB' },
  Shipped: { label: 'SHIPPED', bg: '#E8F0FE', color: '#1A56DB' },
  'Out for Delivery': { label: 'OUT FOR DELIVERY', bg: '#EDE9FE', color: '#7C3AED' },
  Delivered: { label: 'DELIVERED', bg: '#D1FAE5', color: '#059669' },
  Cancelled: { label: 'CANCELLED', bg: '#FEE2E2', color: '#DC2626' },
  Pending: { label: 'PENDING', bg: '#FEF3C7', color: '#D97706' },
};

const formatDate = ( dateStr ) => {
  if ( !dateStr ) return '';
  const d = new Date( dateStr );
  return d.toLocaleDateString( 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' } );
};


const ReviewModal = ( { visible, medicineName, onClose, onSubmit, submitting } ) => {
  const [ rating, setRating ] = useState( 0 );
  const [ review, setReview ] = useState( '' );
  const [ error, setError ] = useState( '' );

  const handleSubmit = () => {
    if ( rating === 0 ) {
      setError( 'Please select a star rating.' );
      return;
    }
    setError( '' );
    onSubmit( { rating, review: review.trim() } );
  };

  const handleClose = () => {
    setRating( 0 );
    setReview( '' );
    setError( '' );
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={s.modalOverlay}>
        <View style={s.modalCard}>
          <TouchableOpacity style={s.modalCloseBtn} onPress={handleClose}>
            <MaterialIcons name="close" size={20} color="#888" />
          </TouchableOpacity>

          <Text style={s.modalTitle}>Rate Your Order</Text>
          <Text style={s.modalSub}>
            How was {medicineName || 'this medicine'}?
          </Text>

          {/* Stars */}
          <View style={s.starsRow}>
            {[ 1, 2, 3, 4, 5 ].map( ( i ) => (
              <TouchableOpacity
                key={i}
                onPress={() => { setRating( i ); setError( '' ); }}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={i <= rating ? 'star' : 'star-border'}
                  size={36}
                  color={i <= rating ? '#2E7D32' : '#b7b7b7'}
                />
              </TouchableOpacity>
            ) )}
          </View>
          {error ? <Text style={s.modalError}>{error}</Text> : null}

          {/* Review text */}
          <View style={s.reviewInputBox}>
            <TextInput
              style={s.reviewInput}
              placeholder="Write your review (optional)"
              placeholderTextColor="#BBBBBB"
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[ s.submitReviewBtn, submitting && { opacity: 0.7 } ]}
            onPress={handleSubmit}
            activeOpacity={0.88}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={s.submitReviewText}>Submit Review</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


const CancelConfirmModal = ( { visible, orderId, onConfirm, onClose } ) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={s.modalOverlay}>
      <View style={s.modalCard}>
        <View style={s.modalIconWrap}>
          <Icon name="alert-circle-outline" size={32} color="#DC2626" />
        </View>

        <Text style={s.modalTitle}>Cancel Order?</Text>
        <Text style={s.modalSub}>
          Are you sure you want to cancel order #{orderId}? This action cannot be undone.
        </Text>

        <View style={s.modalBtnRow}>
          <TouchableOpacity style={s.modalNoBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={s.modalNoText}>No, Keep It</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.modalYesBtn} onPress={onConfirm} activeOpacity={0.85}>
            <Text style={s.modalYesText}>Yes, Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ( { order, token, onCancelSuccess, onReviewSuccess } ) => {
  const navigation = useNavigation();
  const [ cancelling, setCancelling ] = useState( false );
  const [ confirmVisible, setConfirmVisible ] = useState( false );
  const [ reviewModalVisible, setReviewModalVisible ] = useState( false );
  const [ submittingReview, setSubmittingReview ] = useState( false );

  const cfg = STATUS_CONFIG[ order.status ] ?? {
    label: order.status?.toUpperCase() ?? 'UNKNOWN',
    bg: '#F0F0F0',
    color: '#888',
  };

  const isDelivered = order.status === 'Delivered';
  const isCancelled = order.status === 'Cancelled';

  // console.log('order is ------ ', order?.items[0]?.is_rated);
  
  const firstItem = order.items?.[ 0 ];
  const imageUri = firstItem?.medicine_image
    ? `${base_api}${firstItem.medicine_image}`
    : null;
  const totalItems = order.items?.length ?? 0;

  const handleTrackOrder = () => {
    navigation.navigate( 'TrackOrderScreen', { order } );
  };

  const handleCancelOrder = async () => {
    setConfirmVisible( false );
    setCancelling( true );
    try {
      const res = await fetch( `${BASE_URL}/cancel-order`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify( { order_id: order?.id } ),
      } );

      const json = await res.json();

      if ( !res.ok ) {
        throw new Error( json?.message || 'Failed to cancel order' );
      }

      Toast.show( {
        type: 'success',
        text1: 'Order Cancelled',
        text2: json?.message || 'Your order has been cancelled.',
      } );

      onCancelSuccess?.();
    } catch ( err ) {
      Toast.show( {
        type: 'error',
        text1: 'Cancellation Failed',
        text2: err.message || 'Failed to cancel order',
      } );
    } finally {
      setCancelling( false );
    }
  };

  const handleSubmitReview = async ( { rating, review } ) => {
    setSubmittingReview( true );

    try {
      const formData = new FormData();
      formData.append( 'order_id', ( order?.id ) );
      formData.append( 'rating', String( rating ) );
      formData.append( 'review', review );

      const res = await fetch( `${BASE_URL}/review-add`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      } );

      const json = await res.json();

      if ( !res.ok ) {
        throw new Error( json?.message || 'Failed to submit review' );
      }

      Toast.show( {
        type: 'success',
        text1: 'Thank You!',
        text2: json?.message || 'Your review has been submitted.',
      } );
      setReviewModalVisible( false );

      // 👈 refetch orders so review_add flag updates and button hides
      onReviewSuccess?.();
    } catch ( err ) {
      Toast.show( {
        type: 'error',
        text1: 'Submission Failed',
        text2: err.message || 'Failed to submit review',
      } );
    } finally {
      setSubmittingReview( false );
    }
  };



  return (
    <View style={s.orderCard}>

      {/* ── Top: status badge + amount ── */}
      <View style={s.orderCardTop}>
        <View style={[ s.statusBadge, { backgroundColor: cfg.bg } ]}>
          <Text style={[ s.statusText, { color: cfg.color } ]}>{cfg.label}</Text>
        </View>
        <Text style={s.orderAmount}>₹{parseFloat( order.total_amount ?? 0 ).toFixed( 2 )}</Text>
      </View>

      <Text style={s.orderId}>Order #{order.order_id}</Text>
      <Text style={s.orderDate}>Placed on {formatDate( order.ordered_at )}</Text>

      {firstItem && (
        <TouchableOpacity onPress={() => navigation.navigate( 'ProductDetails', { medicineId: order?.items[ 0 ]?.medicine_id } )} style={s.itemPreview}>
          <View style={s.itemThumb}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <Icon name="pill" size={22} color="rgba(255,255,255,0.35)" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.itemPreviewName} numberOfLines={1}>
              {firstItem.medicine_name}
            </Text>
            <Text style={s.itemPreviewMeta}>
              {totalItems} item{totalItems > 1 ? 's' : ''} • Qty: {firstItem.quantity}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {isDelivered && (
        <View style={s.infoRow}>
          <Icon name="check-circle" size={16} color="#059669" />
          <Text style={[ s.infoRowText, { color: '#059669' } ]}>Successfully Delivered</Text>
        </View>
      )}

      {isCancelled && (
        <View style={s.infoRow}>
          <Icon name="close-circle" size={16} color="#DC2626" />
          <Text style={[ s.infoRowText, { color: '#DC2626' } ]}>Order Cancelled</Text>
        </View>
      )}

      <View style={s.btnRow}>
        {!isDelivered && !isCancelled && (
          <TouchableOpacity style={s.trackBtn} onPress={handleTrackOrder} activeOpacity={0.88}>
            <Icon name="truck-delivery-outline" size={14} color="#FFF" />
            <Text style={s.trackBtnText}>Track Order</Text>
          </TouchableOpacity>
        )}
        {!isDelivered && !isCancelled && (
          <TouchableOpacity
            style={s.cancelBtn}
            onPress={() => setConfirmVisible( true )}   // 👈 open modal instead of direct cancel
            activeOpacity={0.8}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <Icon name="close-circle-outline" size={14} color="#DC2626" />
                <Text style={s.cancelBtnText}>Cancel Order</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {isDelivered && !order?.items[0]?.is_rated && (
          <TouchableOpacity
            style={s.reviewBtn}
            onPress={() => setReviewModalVisible( true )}
            activeOpacity={0.88}
          >
            <Icon name="star-outline" size={14} color="#FFF" />
            <Text style={s.reviewBtnText}>Add Review</Text>
          </TouchableOpacity>
        )}
      </View>

      {isDelivered && order?.items[0]?.is_rated && (
        <View style={s.infoRow}>
          <Icon name="star-check" size={16} color="#2E7D32" />
          <Text style={[ s.infoRowText, { color: '#2E7D32' } ]}>Thank you for your review!</Text>
        </View>
      )}

      {/* ── Cancel Confirmation Modal ── */}
      <CancelConfirmModal
        visible={confirmVisible}
        orderId={order.order_id}
        onConfirm={handleCancelOrder}
        onClose={() => setConfirmVisible( false )}
      />

      <ReviewModal
        visible={reviewModalVisible}
        medicineName={firstItem?.medicine_name}
        onClose={() => setReviewModalVisible( false )}
        onSubmit={handleSubmitReview}
        submitting={submittingReview}
      />
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const token = useSelector( ( state ) => state.auth.token );

  const [ orders, setOrders ] = useState( [] );
  const [ loading, setLoading ] = useState( true );
  const [ loadingMore, setLoadingMore ] = useState( false );
  const [ error, setError ] = useState( null );

  // ── Pagination state ────────────────────────────────────────────────────────
  const [ currentPage, setCurrentPage ] = useState( 1 );
  const [ lastPage, setLastPage ] = useState( 1 );
  const [ refreshing, setRefreshing ] = useState( false );

  const fetchOrders = useCallback( async ( isRefresh = false ) => {
    if ( !token ) return;

    isRefresh ? setRefreshing( true ) : setLoading( true );
    setError( null );

    try {
      const res = await fetch( `${BASE_URL}/orders?page=1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest',
        },
      } );

      const json = await res.json();
      // console.log('orders ----- ', json);
      
      const payload = json?.data;
      const list = payload?.data ?? [];

      setOrders( list );
      setCurrentPage( payload?.current_page ?? 1 );
      setLastPage( payload?.last_page ?? 1 );

    } catch ( err ) {
      // console.log( 'fetchOrders error:', err.message );
      setError( err.message || 'Something went wrong' );
      setOrders( [] );
    } finally {
      setLoading( false );
      setRefreshing( false );
    }
  }, [ token ] );

  const onRefresh = useCallback( () => {
    setCurrentPage( 1 );
    setLastPage( 1 );
    fetchOrders( true );
  }, [ fetchOrders ] );


  const loadMoreOrders = useCallback( async () => {
    if ( !token ) return;
    if ( loadingMore || loading ) return;
    if ( currentPage >= lastPage ) return;   // already at last page

    setLoadingMore( true );
    try {
      const nextPage = currentPage + 1;
      const res = await fetch( `${BASE_URL}/orders?page=${nextPage}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest',
        },
      } );

      const json = await res.json();
      const payload = json?.data;
      const newList = payload?.data ?? [];

      setOrders( ( prev ) => [ ...prev, ...newList ] );
      setCurrentPage( payload?.current_page ?? nextPage );
      setLastPage( payload?.last_page ?? lastPage );
    } catch ( err ) {
      // silently fail load-more, keep existing list
    } finally {
      setLoadingMore( false );
    }
  }, [ token, currentPage, lastPage, loadingMore, loading ] );

  useEffect( () => {
    if ( token ) fetchOrders();
  }, [ token, fetchOrders ] );

  useFocusEffect(
    useCallback( () => {
      if ( token ) fetchOrders();
    }, [ token, fetchOrders ] )
  );

  // ── Detect scroll-to-bottom ──────────────────────────────────────────────────
  const handleScroll = ( e ) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 80;

    if ( isCloseToBottom ) {
      loadMoreOrders();
    }
  };

  if ( !token ) return <GuestScreen navigation={navigation} />;

  return (
    <View style={s.screen}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerAvatar}>
            <MaterialIcons name="arrow-back" size={22} color={PINK} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>My Orders</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={200}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[ PINK ]}
            tintColor={PINK}
          />
        }
      >
        <View style={s.titleBlock}>
          <Text style={s.pageTitle}>Order History</Text>
          <Text style={s.pageSub}>Manage your prescriptions and healthcare essentials.</Text>
        </View>

        {loading && (
          <View style={s.centered}>
            <ActivityIndicator size="large" color={PINK} />
          </View>
        )}

        {!loading && error && (
          <View style={s.centered}>
            <Icon name="alert-circle-outline" size={48} color="#CCCCCC" />
            <Text style={s.stateText}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={fetchOrders}>
              <Text style={s.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && orders.length === 0 && (
          <View style={s.centered}>
            <Icon name="archive-outline" size={48} color="#CCCCCC" />
            <Text style={s.stateText}>No orders yet.</Text>
            <TouchableOpacity style={s.retryBtn} onPress={() => navigation.navigate( 'Home' )}>
              <Text style={s.retryText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && orders.length > 0 && (
          <View style={s.cardsList}>
            {orders.map( ( order ) => (
              <OrderCard
                key={String( order.id )}
                order={order}
                token={token}
                onCancelSuccess={fetchOrders}
                onReviewSuccess={fetchOrders}
              />
            ) )}
          </View>
        )}

        {/* ── Loading more indicator ── */}
        {loadingMore && (
          <View style={s.loadMoreWrap}>
            <ActivityIndicator size="small" color={PINK} />
          </View>
        )}

        {/* End of list note */}
        {!loading && !loadingMore && currentPage >= lastPage && orders.length > 0 && (
          <View style={s.footerNote}>
            <Icon name="archive-outline" size={20} color="#191C1E" style={{ opacity: 0.4 }} />
            <Text style={s.footerNoteText}>Showing all your orders</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create( {
  screen: { flex: 1, backgroundColor: '#F7F7F9' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 36, paddingBottom: 12,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: Fonts.secondary.semiBold, color: PINK, marginTop: 3 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 },

  titleBlock: { marginBottom: 20 },
  pageTitle: { fontSize: 26, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A', marginBottom: 4 },
  pageSub: { fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#40493D', lineHeight: 20 },

  cardsList: { gap: 14 },

  orderCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  orderCardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  statusBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  statusText: { fontSize: 10, fontFamily: Fonts.secondary.semiBold, letterSpacing: 0.6, marginTop: 3 },
  orderAmount: { fontSize: 17, fontFamily: Fonts.secondary.semiBold, color: PINK },
  orderId: { fontSize: 16, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A', marginBottom: 3 },
  orderDate: { fontSize: 12, fontFamily: Fonts.secondary.regular, color: '#AAAAAA', marginBottom: 14 },

  itemPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F8F8F8', borderRadius: 14,
    padding: 12, marginBottom: 12,
  },
  itemThumb: {
    width: 48, height: 48, borderRadius: 10, backgroundColor: '#1A2A3A',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  itemPreviewName: { fontSize: 14, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A' },
  itemPreviewMeta: { fontSize: 12, fontFamily: Fonts.secondary.regular, color: '#AAAAAA', marginTop: 3 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  infoRowText: { fontSize: 13, fontFamily: Fonts.secondary.semiBold },

  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },

  trackBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: PINK, borderRadius: 12,
    paddingVertical: 11,
    shadowColor: PINK, shadowOpacity: 0.25,
    shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  trackBtnText: { fontSize: 12, fontFamily: Fonts.secondary.semiBold, color: '#FFFFFF', marginTop: 2 },

  cancelBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#FEE2E2', borderRadius: 12,
    paddingVertical: 11,
    borderWidth: 1, borderColor: '#FECACA',
  },
  cancelBtnText: { fontSize: 12, fontFamily: Fonts.secondary.semiBold, color: '#DC2626', marginTop: 2 },

  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  stateText: { fontSize: 14, fontFamily: Fonts.secondary.regular, color: '#AAAAAA', textAlign: 'center' },
  retryBtn: { backgroundColor: PINK, borderRadius: 50, paddingHorizontal: 28, paddingVertical: 10, marginTop: 4 },
  retryText: { fontSize: 14, fontFamily: Fonts.secondary.bold, color: '#FFF' },

  footerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 },
  footerNoteText: { fontSize: 12, fontFamily: Fonts.secondary.regular, color: '#191C1E', opacity: 0.5 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20,
    padding: 24, alignItems: 'center',
  },
  modalIconWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A',
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#777',
    textAlign: 'center', lineHeight: 19, marginBottom: 22,
  },
  modalBtnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  modalNoBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, paddingVertical: 13,
    borderWidth: 1.5, borderColor: '#E0E0E0',
  },
  modalNoText: { fontSize: 14, fontFamily: Fonts.secondary.semiBold, color: '#555' },
  modalYesBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, paddingVertical: 13,
    backgroundColor: '#DC2626',
  },
  modalYesText: { fontSize: 14, fontFamily: Fonts.secondary.semiBold, color: '#FFF', marginBottom: -3 },
  reviewBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#2E7D32', borderRadius: 12,
    paddingVertical: 11,
    shadowColor: '#2E7D32', shadowOpacity: 0.25,
    shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  reviewBtnText: { fontSize: 12, fontFamily: Fonts.secondary.semiBold, color: '#FFFFFF', marginTop: 2 },

  modalCloseBtn: {
    position: 'absolute', top: 14, right: 14, padding: 4, zIndex: 1,
  },
  starsRow: {
    flexDirection: 'row', gap: 6, marginVertical: 6,
  },
  modalError: {
    fontSize: 11, fontFamily: Fonts.secondary.regular, color: '#DC2626', marginBottom: 8,
  },
  reviewInputBox: {
    width: '100%', backgroundColor: '#F7F7F9', borderRadius: 14,
    borderWidth: 1, borderColor: '#c8c8c8', padding: 12, marginTop: 14, marginBottom: 18,
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
  loadMoreWrap: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 20,
  },
} );