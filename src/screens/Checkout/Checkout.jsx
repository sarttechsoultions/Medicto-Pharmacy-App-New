import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Platform, Image, ActivityIndicator
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fonts from '../../constant/Fonts.js';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { api, base_api, BASE_URL } from '../../services/service';
import GlobalLoader from '../../components/Loader';

import Toast from 'react-native-toast-message';
import { Alert } from 'react-native';
const PINK = '#DB2777';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../redux/slice/cartSlice.js';

const PAYMENT_METHODS = [
  {
    id: 'online',
    label: 'Pay Online',
    sublabel: 'Coming Soon',
    icon: 'credit-card-outline'
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    sublabel: 'Pay when you receive your order',
    icon: 'cash-register'
  },
];

const TYPE_ICON = {
  home: 'home',
  work: 'briefcase-outline',
  office: 'briefcase-outline',
  other: 'map-marker-outline',
};

const normalizeAddress = ( addr ) => {
  const label = addr.address_label ?? addr.type ?? addr.label ?? 'Home';
  const lines = [
    addr.street_address,
    addr.landmark,
    [ addr.city, addr.state, addr.pin_code ].filter( Boolean ).join( ', ' ),
  ].filter( Boolean );

  return {
    id: String( addr.id ),
    type: label,
    icon: TYPE_ICON[ label.toLowerCase() ] ?? 'home',
    phone: addr.phone_number ?? '',
    address: lines.join( ',\n' ),
    raw: addr,
  };
};

const AddressCard = ( { item, selected, onSelect } ) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={[ s.addressCard, selected && s.addressCardSelected ]}
      onPress={() => onSelect( item.id )}
      activeOpacity={0.85}
    >
      <View style={s.addressTop}>
        <View style={s.addressTypeRow}>
          <Icon name={item.icon} size={16} color={selected ? PINK : '#555'} style={{ marginRight: 6 }} />
          <Text style={[ s.addressType, selected && s.addressTypeSelected ]}>{item.type}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate( 'EditAddress', { address: item.raw ?? item, mode: 'edit' } )}>
          <Text style={s.editBtn}>Edit</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.addressText}>{item.address}</Text>
    </TouchableOpacity>
  );
};

const OrderItemRow = ( { item } ) => (
  <View style={s.orderItemRow}>
    <View style={[ s.orderItemImg, { backgroundColor: '#1A2A3A' } ]}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <Icon name="pill" size={22} color="rgba(255,255,255,0.3)" />
      )}
    </View>
    <View style={s.orderItemInfo}>
      <Text style={s.orderItemName} numberOfLines={1}>{item.name}</Text>
      <Text style={s.orderItemDesc}>{item.desc} • Qty: {item.qty}</Text>
    </View>
    <Text style={s.orderItemPrice}>₹{( item.price * item.qty ).toFixed( 2 )}</Text>
  </View>
);

const PaymentCard = ({ item, selected, onSelect }) => {
  const disabled = item.id === 'online';

  return (
    <TouchableOpacity
      style={[
        s.paymentCard,
        selected && s.paymentCardSelected,
        disabled && { opacity: 0.5 }
      ]}
      onPress={() => !disabled && onSelect(item.id)}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <View style={[s.paymentIconBox, selected && s.paymentIconBoxSelected]}>
        <Icon name={item.icon} size={20} color={selected ? PINK : '#888'} />
      </View>

      <View style={s.paymentInfo}>
        <Text style={[s.paymentLabel, selected && s.paymentLabelSelected]}>
          {item.label}
        </Text>

        <Text style={s.paymentSublabel}>
          {disabled ? 'Coming Soon' : item.sublabel}
        </Text>
      </View>

      {!disabled && (
        <View style={[s.radio, selected && s.radioSelected]}>
          {selected && <View style={s.radioDot} />}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const cartItems = route.params?.cartItems ?? [];
  const totalAmount = route.params?.totalAmount ?? 0;
  const token = useSelector( ( state ) => state.auth.token );

  const [ addresses, setAddresses ] = useState( [] );
  const [ addressLoading, setAddressLoading ] = useState( true );
  const [ selectedAddress, setSelectedAddress ] = useState( null );
  const [ orderExpanded, setOrderExpanded ] = useState( true );
  const [ selectedPayment, setSelectedPayment ] = useState('cod');
  const [ orderLoading, setOrderLoading ] = useState( false );

const fetchAddresses = useCallback(async () => {
  if (!token) return;
  setAddressLoading(true);
  try {
    const res = await api.get('/addresses');
    const payload = res.data?.address ?? res.data?.data ?? res.data;
    const rawArr = Array.isArray(payload) ? payload : (payload?.id ? [payload] : []);

    if (rawArr.length > 0) {
      const list = rawArr.map(normalizeAddress);
      setAddresses(list);
      setSelectedAddress((prev) => {
        if (prev) {
          const stillExists = list.find((a) => a.id === prev);
          if (stillExists) return prev;
        }
        const def = list.find((a) => a.raw?.is_default) ?? list[0];
        return def?.id ?? null;
      });
    } else {
      setAddresses([]);
      setSelectedAddress(null);
    }
  } catch (err) {
    console.log('fetchAddresses error:', err.message);
    setAddresses([]);
    setSelectedAddress(null);
  } finally {
    setAddressLoading(false);
  }
}, [token]);

  useFocusEffect(
    useCallback( () => {
      fetchAddresses();
    }, [ fetchAddresses ] )
  );

  const subtotal = cartItems.reduce( ( s, i ) => s + ( i.price ?? 0 ) * ( i.qty ?? 1 ), 0 );
  const deliveryFee = 0;
  const finalTotal = totalAmount || subtotal;

  const handlePayNow = async () => {
    if ( selectedPayment === 'online' ) {
      Alert.alert( 'Coming Soon', 'Online payment feature is coming soon!' );
      return;
    }

    if ( !selectedAddress ) {
      Alert.alert( 'Address Required', 'Please select a delivery address.' );
      return;
    }

    if ( cartItems.length === 0 ) {
      Alert.alert( 'Empty Cart', 'No items to place order.' );
      return;
    }
    const requests = cartItems.map( ( item ) => {
      const formData = new FormData();
      formData.append( 'address_id', selectedAddress );
      formData.append( 'medicine_id', String( item.id ) );
      formData.append( 'quantity', String( item.qty ?? 1 ) );
      return formData;
    } );

    setOrderLoading( true );
    try {
      const results = await Promise.all(
        requests.map( ( formData ) =>
          fetch( `${BASE_URL}/orders-created`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              ...( token && { Authorization: `Bearer ${token}` } ),
            },
            body: formData,
          } ).then( ( res ) => res.json() )
        )
      );

      // console.log( 'ORDER RESULTS =>', results );

      const allSuccess = results.every( ( r ) => r.success || r.status === 200 );


      if ( results[ 0 ]?.status === true ) {
        await Promise.all(
          cartItems.map( ( item ) => api.post( `/cart-remove/${item.cartId}` ) )
        );
        dispatch( clearCart() );

        Toast.show( {
          type: 'success',
          text1: 'Order Placed Successfully!',
        } );

        setTimeout( () => {
          navigation.navigate( 'OrderConfirmed', { orderDetail: results[ 0 ] } );
        }, 300 );
    } else {
      Alert.alert( 'Failed', results[ 0 ]?.message || 'Something went wrong.' );
    }
  } catch ( err ) {
    console.log( 'ORDER ERROR =>', err?.message );
    Alert.alert( 'Error', 'Something went wrong. Please try again.' );
  } finally {
    setOrderLoading( false );
  }
};


if ( addressLoading ) {
  return <GlobalLoader visible={addressLoading} />;
}

return (
  <View style={s.screen}>
    <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

    {/* Header */}
    <View style={s.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.hIcon}>
          <MaterialIcons name="arrow-back" size={22} color={PINK} />
        </TouchableOpacity>
        <Text style={s.hTitle}>Checkout</Text>
      </View>
      {/* <View style={s.hRight}>
          <TouchableOpacity style={s.hIcon}>
            <MaterialIcons name="search" size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <View style={s.avatar}>
            <Icon name="account-circle" size={34} color="#CCCCCC" />
          </View>
        </View> */}
    </View>

    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Delivery Address ── */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Delivery Address</Text>
          <Text style={s.savedBadgeText}>{addresses.length} ADDRESSES SAVED</Text>
        </View>

        <View style={s.addressList}>
          {addresses.map( ( addr ) => (
            <AddressCard
              key={addr.id}
              item={addr}
              selected={selectedAddress === addr.id}
              onSelect={setSelectedAddress}
            />
          ) )}
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate( 'EditAddress', { address: null, mode: 'add' } )}
          style={s.addAddressBtn}
          activeOpacity={0.8}
        >
          <Icon name="plus-circle-outline" size={20} color="#888" />
          <Text style={s.addAddressText}>Add New Address</Text>
        </TouchableOpacity>
      </View>

      {/* ── Order Summary ── */}
      <View style={[ s.section, { backgroundColor: '#F2F4F7', paddingHorizontal: 15, paddingVertical: 16, borderRadius: 24 } ]}>
        <TouchableOpacity
          style={s.orderSummaryHeader}
          onPress={() => setOrderExpanded( !orderExpanded )}
          activeOpacity={0.8}
        >
          <View style={s.orderSummaryHeaderLeft}>
            <View style={s.orderSummaryIconBox}>
              <Icon name="shopping-outline" size={18} color={PINK} />
            </View>
            <View>
              <Text style={[ s.sectionTitle, { fontSize: 16 } ]}>Order Summary</Text>
              <Text style={s.orderSummaryMeta}>
                {cartItems.length} Items • Estimated delivery Tomorrow
              </Text>
            </View>
          </View>
          <MaterialIcons
            name={orderExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={22}
            color="#888"
          />
        </TouchableOpacity>

        {orderExpanded && (
          <View style={s.orderItemsCard}>
            {cartItems.length > 0 ? (
              cartItems.map( ( item, idx ) => (
                <View key={item.cartId ?? item.id ?? idx}>
                  <OrderItemRow item={item} />
                  {idx < cartItems.length - 1 && <View style={s.rowDivider} />}
                </View>
              ) )
            ) : (
              <Text style={{ fontFamily: Fonts.secondary.regular, color: '#888', textAlign: 'center', paddingVertical: 12 }}>
                No items
              </Text>
            )}

            <View style={s.summaryDivider} />

            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Items Subtotal</Text>
              <Text style={s.summaryValue}>₹{subtotal.toFixed( 2 )}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Delivery Fee</Text>
              <Text style={s.freeText}>FREE</Text>
            </View>

            <View style={[s.summaryDivider , {marginTop : 4}]} />
             <View style={[s.totalRow]}>
              <Text style={[s.totalLabel , {fontSize : 14 , color :'#333'}]}>Wallet</Text>
              <Text style={[s.totalValue ,  {fontSize : 14}]}>₹17.58</Text>
            </View>
            <View style={[s.summaryDivider , {marginTop : 4}]} />
            

            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total Amount</Text>
              <Text style={s.totalValue}>₹{finalTotal.toFixed( 2 )}</Text>
            </View>
          </View>
        )}
      </View>

      {/* ── Payment Method ── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Payment Method</Text>
        <View style={s.paymentList}>
          {PAYMENT_METHODS.map( ( method ) => (
            <PaymentCard
              key={method.id}
              item={method}
              selected={selectedPayment === method.id}
              onSelect={setSelectedPayment}
            />
          ) )}
        </View>
      </View>

      <View style={{ height: 110 }} />
    </ScrollView>

    {/* Sticky footer */}
    <View style={s.footer}>
      <View style={s.footerLeft}>
        <Text style={s.payableLabel}>PAYABLE</Text>
        <Text style={s.payableAmount}>₹{finalTotal.toFixed( 2 )}</Text>
      </View>
      <TouchableOpacity style={s.payBtn} onPress={handlePayNow} disabled={orderLoading} activeOpacity={orderLoading ? .4 : 0.88}>
        {orderLoading ? (
          <ActivityIndicator size={20} color="#fff" />
        ) : (
          <Text style={s.payBtnText}>
            {/* {selectedPayment !== 'online' ? 'Pay Now' : 'Place Order'} */}
             Place Order
          </Text>
        )}
        <MaterialIcons name="arrow-forward" size={18} color="#FFF" style={{ marginBottom: -2 }} />
      </TouchableOpacity>
    </View>
  </View>
);
}

const s = StyleSheet.create( {
  screen: { flex: 1, backgroundColor: '#F7F7F9' },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    paddingHorizontal: 8, paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 12, elevation: 0.6, shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, justifyContent: 'space-between',
  },
  hIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { marginTop: 6, textAlign: 'center', fontSize: 17, fontFamily: Fonts.secondary.bold, color: PINK },
  hRight: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontFamily: Fonts.secondary.semiBold, color: '#191C1E' },
  savedBadgeText: { fontSize: 10, fontFamily: Fonts.secondary.medium, color: '#DB2777', letterSpacing: 0.5 },
  addressList: { gap: 12, marginBottom: 12 },
  addressCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: '#EEEEEE' },
  addressCardSelected: { borderColor: PINK, backgroundColor: '#FFFFFF' },
  addressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addressTypeRow: { flexDirection: 'row', alignItems: 'center' },
  addressType: { fontSize: 14, fontFamily: Fonts.secondary.semiBold, color: '#555' },
  addressTypeSelected: { color: PINK },
  editBtn: { fontSize: 13, fontFamily: Fonts.secondary.bold, color: PINK },
  addressText: { fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#40493D', lineHeight: 20 },
  addAddressBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1.5, borderColor: '#DDDDDD', borderStyle: 'dashed',
    borderRadius: 14, paddingVertical: 16, backgroundColor: '#FFFFFF',
  },
  addAddressText: { fontSize: 14, fontFamily: Fonts.secondary.medium, color: '#888888' },
  orderSummaryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, paddingBottom: 12, marginBottom: 2 },
  orderSummaryHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  orderSummaryIconBox: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#FFF0F6', alignItems: 'center', justifyContent: 'center' },
  orderSummaryMeta: { fontSize: 11, fontFamily: Fonts.secondary.regular, color: '#888888', marginTop: -2 },
  orderItemsCard: { borderRadius: 14, padding: 3, marginTop: 6, gap: 8 },
  orderItemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', gap: 12, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12 },
  orderItemImg: { width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  orderItemInfo: { flex: 1 },
  orderItemName: { fontSize: 14, fontFamily: Fonts.secondary.bold, color: '#1A1A1A' },
  orderItemDesc: { fontSize: 12, fontFamily: Fonts.secondary.regular, color: '#AAAAAA', marginTop: 2 },
  orderItemPrice: { fontSize: 15, fontFamily: Fonts.secondary.bold, color: PINK },
  rowDivider: { height: 1, backgroundColor: '#ededed' },
  summaryDivider: { height: 1, backgroundColor: '#dcdcdc', marginTop: 12, marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 },
  summaryLabel: { fontSize: 14, fontFamily: Fonts.secondary.regular, color: '#555555' },
  summaryValue: { fontSize: 14, fontFamily: Fonts.secondary.medium, color: '#1A1A1A' },
  freeText: { fontSize: 14, fontFamily: Fonts.secondary.bold, color: '#4CAF50' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A' },
  totalValue: { fontSize: 20, fontFamily: Fonts.secondary.semiBold, color: PINK },
  paymentList: { gap: 12, marginTop: 14 },
  paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: '#EEEEEE', gap: 12 },
  paymentCardSelected: { borderColor: PINK, backgroundColor: '#FFFAFC' },
  paymentIconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  paymentIconBoxSelected: { backgroundColor: '#FFF0F6' },
  paymentInfo: { flex: 1 },
  paymentLabel: { fontSize: 14, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A' },
  paymentLabelSelected: { color: PINK },
  paymentSublabel: { fontSize: 12, fontFamily: Fonts.secondary.regular, color: '#40493D', marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#CCCCCC', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: PINK },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: PINK },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 10 : 10,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  footerLeft: { gap: 2 },
  payableLabel: { fontSize: 10, fontFamily: Fonts.secondary.bold, color: '#AAAAAA', letterSpacing: 1 },
  payableAmount: { fontSize: 22, fontFamily: Fonts.secondary.bold, color: '#1A1A1A' },
  payBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: PINK,
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, gap: 6,
    shadowColor: PINK, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  payBtnText: { fontSize: 16, fontFamily: Fonts.secondary.bold, color: '#FFFFFF', marginBottom: -3 },
} );