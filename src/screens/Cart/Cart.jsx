// src/screens/Cart/CartScreen.jsx

import React, { useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Platform, Image, TextInput,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fonts from '../../constant/Fonts';
import { api, base_api } from '../../services/service';
import {
  setCart, updateItemQty, removeItem as removeItemAction,
  setCartLoading, setCartError,
  selectCartItems, selectCartTotal,
} from '../../redux/slice/cartSlice';
import GlobalLoader from '../../components/Loader';
import GuestScreen from '../../components/GuestLogin';
import Toast from 'react-native-toast-message';
const PINK = '#B6005B';
const DELIVERY_FEE = 0;


const getImageUrl = ( filename ) =>
  filename ? `${base_api}${filename}` : null;
const discountedPrice = ( price, discount ) => {
  const p = Number( price ) || 0;
  const d = Number( discount ) || 0;
  return Number( ( p - ( p * d ) / 100 ).toFixed( 2 ) );
};


export default function CartScreen( { navigation } ) {
  const dispatch = useDispatch();
  const cartItems = useSelector( selectCartItems );
  const subtotal = useSelector( selectCartTotal );
  const loading = useSelector( ( s ) => s.cart.loading );
  const error = useSelector( ( s ) => s.cart.error );
  const token = useSelector( ( state ) => state.auth.token );

  const [ promoCode, setPromoCode ] = React.useState( '' );
  const [ promoFocused, setPromoFocused ] = React.useState( false );
  const [ refreshing, setRefreshing ] = React.useState( false );
  const [ discount, setDiscount ] = React.useState( 0 );
  const [ count, setCount ] = React.useState( 0 )
  const [ rewardsApplied, setRewardsApplied ] = React.useState( false );
  const [ currentPage, setCurrentPage ] = React.useState( 1 );
  const [ lastPage, setLastPage ] = React.useState( 1 );
  const [ loadingMore, setLoadingMore ] = React.useState( false );
  const REWARDS_AMOUNT = 17.15;

  const mapCartItem = ( item ) => ( {
    cartId: item.id,
    id: item.medicine_id,
    qty: Math.max( 1, Number( item.quantity ) || 1 ),
    name: item.medicine?.name ?? 'Unknown',
    desc: `${item.medicine?.unit_type ?? ''} • ${item.medicine?.pack_size ?? ''} qty`,
    price: discountedPrice( item.medicine?.price, item.medicine?.discount ),
    rawPrice: Number( item.medicine?.price ) || 0,
    discountPct: Number( item.medicine?.discount ) || 0,
    image: getImageUrl( item.medicine?.image ),
    status: item.medicine?.status ?? 'In Stock',
    stock: Number( item.medicine?.quantity  ) || 0,
  } );

  const fetchCart = useCallback( async ( isRefresh = false ) => {
    try {
      isRefresh ? setRefreshing( true ) : dispatch( setCartLoading( true ) );
      const response = await api.get( '/cart?page=1' );

      if ( response.data?.status ) {
        const payload = response.data.data;            // { current_page, data: [...], last_page, ... }
        const list = payload?.data ?? [];

        console.log('respon cart is ---------- ', response?.data);
        

        dispatch( setCart( list.map( mapCartItem ) ) );
        setCurrentPage( payload?.current_page ?? 1 );
        setLastPage( payload?.last_page ?? 1 );
      } else {
        dispatch( setCartError( 'Failed to load cart.' ) );
      }
    } catch ( err ) {
      dispatch( setCartError( 'Something went wrong. Please try again.' ) );
    } finally {
      setRefreshing( false );
    }
  }, [ dispatch ] );

  const loadMoreCart = useCallback( async () => {
    if ( loadingMore || loading || refreshing ) return;
    if ( currentPage >= lastPage ) return;

    setLoadingMore( true );
    try {
      const nextPage = currentPage + 1;
      const response = await api.get( `/cart?page=${nextPage}` );

      if ( response.data?.status ) {
        const payload = response.data.data;
        const newList = payload?.data ?? [];

        dispatch( setCart( [ ...cartItems, ...newList.map( mapCartItem ) ] ) );
        setCurrentPage( payload?.current_page ?? nextPage );
        setLastPage( payload?.last_page ?? lastPage );
      }
    } catch ( err ) {
      // silently fail, keep existing list
    } finally {
      setLoadingMore( false );
    }
  }, [ currentPage, lastPage, loadingMore, loading, refreshing, cartItems, dispatch ] );


  useEffect( () => { fetchCart(); }, [ fetchCart ] );

  const updateQty = async ( cartId, currentQty, delta, maxStock ) => {
    const newQty = Number( currentQty ) + delta;
    if ( newQty > maxStock ) return;
    dispatch( updateItemQty( { cartId, qty: newQty } ) );
    try {
      if ( newQty <= 0 ) {
        await api.post( `/cart-remove/${cartId}` );
      } else {
        await api.post( `/cart-update/${cartId}`, { quantity: newQty } );
      }
    } catch {
      dispatch( updateItemQty( { cartId, qty: currentQty } ) );
    }
  };

  const handleScroll = ( e ) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 80;

    if ( isCloseToBottom ) {
      loadMoreCart();
    }
  };

  const fetchAddressesLength = async () => {
    try {
      const data = ( await api.get( '/addresses' ) ).data;
      const payload = data?.address ?? data?.data ?? data;

      return Array.isArray( payload )
        ? payload.length
        : payload?.id
          ? 1
          : 0;
    } catch {
      return 0;
    }
  };

  useFocusEffect(
    useCallback( () => {
      const getCount = async () => {
        const count = await fetchAddressesLength();
        setCount( count );
      };

      getCount();

      return () => {
        // cleanup if needed
      };
    }, [] )
  );



  const removeItem = async ( cartId ) => {
    const snapshot = [ ...cartItems ];
    dispatch( removeItemAction( cartId ) );
    try {
      await api.post( `/cart-remove/${cartId}` );
    } catch {
      dispatch( setCart( snapshot ) );
    }
  };

  const totalItems = cartItems.reduce( ( sum, i ) => sum + i.qty, 0 );
  // const totalAmount = subtotal + DELIVERY_FEE - discount;

  const totalAmount = subtotal + DELIVERY_FEE - discount - ( rewardsApplied ? REWARDS_AMOUNT : 0 );


  const handleProcessToCheckout = ( cartItems, totalAmount ) => {
    if ( count <= 0 ) {
      Toast.show( {
        type: 'error',
        text1: 'Please add address first to checkout.',
        text2: 'Your profile has been saved.',
      } );
      navigation.navigate( 'EditAddress', { address: null, mode: 'add', fromCart: true, cartItems, totalAmount } );
    } else {
      navigation.navigate( 'CheckoutScreen', { cartItems, totalAmount } )
    }

    //  cartItems, totalAmount
  }

  if ( loading ) {
    return (
      <GlobalLoader visible={loading} />
    );
  }
  if ( !token ) {
    return <GuestScreen />
  }

  if ( error ) {
    return (
      <View style={[ s.screen, s.centered ]}>
        <Icon name="cart-off" size={56} color="#CCCCCC" />
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => fetchCart()}>
          <Text style={s.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={s.hIcon}>
            <MaterialIcons name="arrow-back" size={22} color={PINK} />
          </TouchableOpacity>
          <Text style={s.hTitle}>Your Cart</Text>
        </View>
        {/* <View style={s.hRight}>
          <TouchableOpacity style={s.hIcon}>
            <MaterialIcons name="search" size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <View style={s.avatar}>
            <Icon name="account-circle" size={32} color="#CCCCCC" />
          </View>
        </View> */}
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
            onRefresh={() => fetchCart( true )}
            colors={[ PINK ]}
            tintColor={PINK}
          />
        }
      >
        {cartItems.length === 0 ? (
          <View style={s.emptyWrap}>
            <Icon name="cart-outline" size={72} color="#DDDDDD" />
            <Text style={s.emptyTitle}>Your cart is empty</Text>
            <Text style={s.emptySubtitle}>Add medicines to get started</Text>
            <TouchableOpacity style={s.shopBtn} onPress={() => navigation?.goBack()}>
              <Text style={s.shopBtnText}>Browse Medicines</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={s.selectedRow}>
              <Icon name="shopping-outline" size={18} color={PINK} />
              <Text style={s.selectedText}>{cartItems.length} Items Selected</Text>
            </View>

            <View style={s.itemsList}>
              {cartItems.map( ( item ) => (
                <TouchableOpacity onPress={() => navigation.navigate( 'ProductDetails', { medicineId: item?.id } )} key={item.cartId} style={s.itemCard}>
                  <View style={[ s.itemImgBox, { backgroundColor: '#1A1A2E' } ]}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={s.itemImg} resizeMode="cover" />
                    ) : (
                      <Icon name="pill" size={28} color="rgba(255,255,255,0.3)" />
                    )}
                    {item.stock <= 0 && (
                      <View style={s.outOfStockBadge}>
                        <Text style={s.outOfStockText}>Out of Stock</Text>
                      </View>
                    )}
                  </View>

                  <View style={s.itemInfo}>
                    <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={s.itemDesc}>{item.desc}</Text>
                   
                    <View style={{flexDirection : 'row' , alignItems : 'center' , gap : 3}}>
                      <Text style={s.itemPrice}>₹{( item.price * item.qty ).toFixed( 1 )}</Text>
                   
                       {item.discountPct > 0 && (
                      <Text style={s.itemOrigPrice}>
                        ₹{( item.rawPrice * item.qty ).toFixed( 2 )}
                      </Text>
                    )}
                   
                    </View>
                    {item.discountPct > 0 && (
                      <View style={s.discountBadge}>
                        <Text style={s.discountBadgeText}>{item.discountPct}% OFF</Text>
                      </View>
                    )}
                  </View>

                  <View style={s.itemActions}>
                    <TouchableOpacity onPress={() => removeItem( item.cartId )} style={s.deleteBtn}>
                      <Icon name="delete-outline" size={18} color="#9F2C00" />
                    </TouchableOpacity>
                    <View style={s.qtyRow}>
                      <TouchableOpacity
                        style={s.qtyBtn}
                        onPress={() => updateQty( item.cartId, item.qty, -1, item.stock )}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="remove" size={16} color="#555" />
                      </TouchableOpacity>
                      <Text style={s.qtyText}>{String( item.qty ).padStart( 2, '0' )}</Text>
                      <TouchableOpacity
                        style={[ s.qtyBtn, s.qtyBtnAdd, item.qty >= item.stock && s.qtyBtnDisabled ]}
                        onPress={() => updateQty( item.cartId, item.qty, 1, item.stock )}
                        activeOpacity={0.8}
                        disabled={item.qty >= item.stock}
                      >
                        <MaterialIcons name="add" size={16} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ) )}
            </View>



            {/* Promo */}
            {/* <View style={[s.promoRow, promoFocused && s.promoRowFocused]}>
              <Icon name="tag-outline" size={20} color="#40493D" style={{ marginRight: 8 }} />
              <TextInput
                style={s.promoInput}
                placeholder="Promo code or coupon"
                placeholderTextColor="#707A6C"
                value={promoCode}
                onChangeText={setPromoCode}
                onFocus={() => setPromoFocused(true)}
                onBlur={() => setPromoFocused(false)}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={s.applyBtn} activeOpacity={0.85}>
                <Text style={s.applyBtnText}>APPLY</Text>
              </TouchableOpacity>
            </View> */}

            {/* Summary */}
            <View style={s.summaryCard}>
              <Text style={s.summaryTitle}>Order Summary</Text>
              <View style={s.divider} />
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Subtotal ({totalItems} items)</Text>
                <Text style={s.summaryValue}>₹{subtotal.toFixed( 2 )}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Delivery Fee</Text>
                <Text style={[ s.summaryValue, s.freeText ]}>FREE</Text>
              </View>
              {discount > 0 && (
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>Promo Discount</Text>
                  <Text style={[ s.summaryValue, s.discountText ]}>-₹{discount.toFixed( 2 )}</Text>
                </View>
              )}
              <View style={s.divider} />

              <View style={s.rewardsRow}>
                <View style={s.rewardsLeft}>
                  <View style={s.rewardsIconWrap}>
                    <Icon name="wallet-giftcard" size={16} color={PINK} />
                  </View>
                  <Text style={s.rewardsText}>
                    Use <Text style={s.rewardsAmount}>₹{REWARDS_AMOUNT.toFixed( 2 )}</Text> from TM Rewards
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setRewardsApplied( ( p ) => !p )}
                  activeOpacity={0.8}
                  style={[ s.rewardsCheck, rewardsApplied && s.rewardsCheckActive ]}
                >
                  {rewardsApplied && <Icon name="check" size={13} color="#fff" />}
                </TouchableOpacity>
              </View>

              {/* ── OR divider ── */}
              <View style={s.orRow}>
                <View style={s.orLine} />
                <Text style={s.orText}>OR</Text>
                <View style={s.orLine} />
              </View>

              {/* ── Apply Coupon ── */}
              <TouchableOpacity style={s.couponRow} activeOpacity={0.8}>
                <View style={s.couponLeft}>
                  <Icon name="tag-outline" size={18} color="#B6005B" />
                  <Text style={s.couponText}>Apply coupon</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#B6005B" />
              </TouchableOpacity>
              <View style={s.divider} />


              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Total Amount</Text>
                <Text style={s.totalValue}>₹{totalAmount.toFixed( 2 )}</Text>
              </View>
              <View style={s.securityNote}>
                <Icon name="shield-check-outline" size={16} color="#4CAF50" style={{ marginTop: 1 }} />
                <Text style={s.securityText}>
                  Your health data and payment information are protected by end-to-end clinical-grade encryption.
                </Text>
              </View>
            </View>
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={s.checkoutWrap}>
          <TouchableOpacity
            onPress={() => handleProcessToCheckout( cartItems, totalAmount )}
            style={s.checkoutBtn}
            activeOpacity={0.88}
          >
            <Text style={s.checkoutText}>Proceed to Checkout</Text>
            <MaterialIcons name="chevron-right" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={s.bottomIcons}>
            <Icon name="credit-card-outline" size={16} color="#CCCCCC" />
            <Icon name="lock-outline" size={16} color="#CCCCCC" />
            <Icon name="shield-outline" size={16} color="#CCCCCC" />
          </View>
        </View>
      )}

      {loadingMore && (
        <View style={s.loadMoreWrap}>
          <ActivityIndicator size="small" color={PINK} />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create( {
  screen: { flex: 1, backgroundColor: '#F7F7F9' },
  centered: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    paddingHorizontal: 8, paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, justifyContent: 'space-between',
  },
  hIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { textAlign: 'center', fontSize: 17, fontFamily: Fonts.secondary.bold, color: PINK, marginBottom: -5 },
  hRight: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  loadingText: { fontSize: 14, fontFamily: Fonts.secondary.regular, color: '#707A6C', marginTop: 8 },
  errorText: { fontSize: 15, fontFamily: Fonts.secondary.regular, color: '#40493D', textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { backgroundColor: PINK, borderRadius: 50, paddingHorizontal: 28, paddingVertical: 12, marginTop: 4 },
  retryBtnText: { fontSize: 14, fontFamily: Fonts.secondary.bold, color: '#FFF' },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 20, fontFamily: Fonts.secondary.bold, color: '#1A1A1A' },
  emptySubtitle: { fontSize: 14, fontFamily: Fonts.secondary.regular, color: '#707A6C' },
  shopBtn: { backgroundColor: PINK, borderRadius: 50, paddingHorizontal: 28, paddingVertical: 13, marginTop: 8 },
  shopBtnText: { fontSize: 14, fontFamily: Fonts.secondary.bold, color: '#FFF' },
  selectedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  selectedText: { fontSize: 15, fontFamily: Fonts.secondary.semiBold, color: '#40493D' },
  itemsList: { gap: 12, marginBottom: 16 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, gap: 12 },
  itemImgBox: { width: 83, height: 87, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  itemImg: { width: '100%', height: '100%' },
  outOfStockBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 3, alignItems: 'center' },
  outOfStockText: { fontSize: 8, fontFamily: Fonts.secondary.bold, color: '#FFF', letterSpacing: 0.3 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontFamily: Fonts.secondary.semiBold, color: '#191C1E', marginBottom: -3 },
  itemDesc: { fontSize: 11, fontFamily: Fonts.secondary.regular, color: '#40493D', marginBottom: 4 },
  itemOrigPrice: { fontSize: 10, fontFamily: Fonts.secondary.regular, color: '#AAAAAA', textDecorationLine: 'line-through' },
  itemPrice: { fontSize: 15, fontFamily: Fonts.secondary.semiBold, color: '#B6005B' },
  discountBadge: { backgroundColor: '#FFF0F0', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 3 },
  discountBadgeText: { fontSize: 10, fontFamily: Fonts.secondary.bold, color: PINK, letterSpacing: 0.3 , marginTop : 2 },
  itemActions: { alignItems: 'flex-end', justifyContent: 'space-between', height: 80 },
  deleteBtn: { padding: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F2F4F7', paddingHorizontal: 7, paddingVertical: 5, borderRadius: 50, borderWidth: 0.7, borderColor: '#BFCABA' },
  qtyBtn: { width: 28, height: 28, borderRadius: 50, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  qtyBtnAdd: { backgroundColor: PINK, shadowColor: PINK, shadowOpacity: 0.3, shadowRadius: 50, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  qtyBtnDisabled: { backgroundColor: '#CCCCCC', shadowOpacity: 0, elevation: 0 },
  qtyText: { fontSize: 14, fontFamily: Fonts.secondary.bold, color: '#1A1A1A', minWidth: 24, textAlign: 'center' },
  promoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F4F7', borderRadius: 50, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 4 : 2, borderWidth: 1.5, borderColor: '#EEEEEE', marginBottom: 20 },
  promoRowFocused: { borderColor: PINK },
  promoInput: { flex: 1, fontSize: 14, fontFamily: Fonts.secondary.regular, color: '#1A1A1A', paddingVertical: 12 },
  applyBtn: { backgroundColor: '#A3F69C', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 9 },
  applyBtnText: { fontSize: 12, fontFamily: Fonts.secondary.bold, color: '#000', letterSpacing: 0.6 },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, gap: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1, marginBottom: 90 },
  summaryTitle: { fontSize: 18, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A', marginBottom: 2 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, fontFamily: Fonts.secondary.regular, color: '#40493D' },
  summaryValue: { fontSize: 14, fontFamily: Fonts.secondary.medium, color: '#191C1E' },
  freeText: { color: '#B6005B', fontFamily: Fonts.secondary.bold },
  discountText: { color: '#9F2C00', fontFamily: Fonts.secondary.bold },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 2 },
  rewardsRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF0F6', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 11,
    borderWidth: 1, borderColor: '#F4C0D1',
  },
  rewardsLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  rewardsIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#F4C0D1',
  },
  rewardsText: {
    fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#1A1C1C',
  },
  rewardsAmount: {
    fontFamily: Fonts.secondary.bold, color: PINK,
  },
  rewardsCheck: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: '#ccc',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  rewardsCheckActive: {
    backgroundColor: PINK, borderColor: PINK,
  },
  orRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  orLine: { flex: 1, height: 1, backgroundColor: '#EEEEEE' },
  orText: {
    fontSize: 11, fontFamily: Fonts.secondary.regular, color: '#aaa',
  },
  couponRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  couponLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6 },
  couponText: {
    fontSize: 14, fontFamily: Fonts.secondary.medium, color: '#B6005B',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 22, fontFamily: Fonts.secondary.bold, color: '#191C1E' },
  totalValue: { fontSize: 22, fontFamily: Fonts.secondary.bold, color: '#B6005B' },
  securityNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#BDEFBE', borderRadius: 10, padding: 12, marginTop: 4 },
  securityText: { flex: 1, fontSize: 11, fontFamily: Fonts.secondary.regular, color: '#3C6842', lineHeight: 18 },
  checkoutWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 10 },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: PINK, borderRadius: 50, paddingVertical: 17, gap: 4, shadowColor: PINK, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 8 },
  checkoutText: { fontSize: 16, fontFamily: Fonts.secondary.bold, color: '#FFFFFF', letterSpacing: 0.3, marginBottom: -3 },
  bottomIcons: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  loadMoreWrap: {
  alignItems: 'center', justifyContent: 'center',
  paddingVertical: 16,
},
} );