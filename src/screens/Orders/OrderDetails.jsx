// src/screens/Orders/OrderDetailsScreen.jsx

import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Platform, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fonts from '../../constant/Fonts';

const PINK = '#B6005B';

// ─── Dummy data ───────────────────────────────────────────────────────────────
const TRACKING_STEPS = [
  { id: 't1', label: 'Ordered',          time: 'Oct 24, 2023 • 09:42 AM', done: true,    active: false },
  { id: 't2', label: 'Confirmed',         time: 'Oct 24, 2023 • 10:15 AM', done: true,    active: false },
  { id: 't3', label: 'Out for Delivery',  time: 'Today • 02:30 PM',        done: false,   active: true,  note: '🚚 Courier is 2.4 miles away' },
  { id: 't4', label: 'Delivered',         time: 'Expected by 05:00 PM',    done: false,   active: false },
];

const ORDER_ITEMS = [
  { id: 'oi1', name: 'Amoxicillin 500mg',   desc: 'Prescription Medication • 30 Capsules', qty: 1, price: 24.00, image: null, imageBg: '#2A3A5A' },
  { id: 'oi2', name: 'Vitamin C Complex',   desc: 'Supplement • 60 Tablets',               qty: 2, price: 32.00, image: null, imageBg: '#1A2A1A' },
  { id: 'oi3', name: 'Premium Face Masks',  desc: 'Healthcare Accessories • Box of 50',    qty: 1, price: 15.50, image: null, imageBg: '#3A2A1A' },
];

const SUBTOTAL  = 71.50;
const SHIPPING  = 0;
const DISCOUNT  = 5.00;
const TOTAL     = 66.50;

// ─── Tracking step ────────────────────────────────────────────────────────────
const TrackStep = ({ step, isLast }) => (
  <View style={ts.stepRow}>
    {/* Left: icon + line */}
    <View style={ts.stepLeft}>
      <View style={[
        ts.stepDot,
        step.done   && ts.stepDotDone,
        step.active && ts.stepDotActive,
      ]}>
        {step.done ? (
          <Icon name="check" size={12} color="#FFF" />
        ) : step.active ? (
          <View style={ts.stepDotInner} />
        ) : (
          <Icon name="archive-outline" size={14} color="#CCCCCC" />
        )}
      </View>
      {!isLast && <View style={[ts.stepLine, step.done && ts.stepLineDone]} />}
    </View>

    {/* Right: text */}
    <View style={ts.stepContent}>
      <Text style={[ts.stepLabel, step.active && ts.stepLabelActive, step.done && ts.stepLabelDone]}>
        {step.label}
      </Text>
      <Text style={ts.stepTime}>{step.time}</Text>
      {step.note && (
        <Text style={ts.stepNote}>{step.note}</Text>
      )}
    </View>
  </View>
);

// ─── Order item row ───────────────────────────────────────────────────────────
const OrderItemRow = ({ item, isLast }) => (
  <View style={[ds.itemRow, !isLast && ds.itemRowBorder]}>
    <View style={[ds.itemThumb, { backgroundColor: item.imageBg }]}>
      {item.image
        ? <Image source={item.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        : <Icon name="pill" size={22} color="rgba(255,255,255,0.25)" />
      }
    </View>
    <View style={ds.itemInfo}>
      <Text style={ds.itemName}>{item.name}</Text>
      <Text style={ds.itemDesc}>{item.desc}</Text>
      <Text style={ds.itemQty}>Qty: {item.qty}</Text>
    </View>
    <Text style={ds.itemPrice}>₹{item.price.toFixed(2)}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function OrderDetailsScreen({ route }) {
  const navigation = useNavigation();
  const orderId    = route?.params?.orderId || 'CV-88219';

  return (
    <View style={ds.screen}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={ds.header}>
        <View style={{flexDirection :'row' , alignItems :'center'}}>
        
        <TouchableOpacity onPress={() => navigation.goBack()} style={ds.hIcon}>
          <MaterialIcons name="arrow-back" size={22} color={PINK} />
        </TouchableOpacity>
        <Text style={ds.headerTitle}>Order #{orderId}</Text>
        </View>

        <View style={ds.hRight}>
          <TouchableOpacity style={ds.hIcon}>
            <MaterialIcons name="search" size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <TouchableOpacity style={ds.hIcon}>
            <Icon name="account-circle" size={28} color="#555" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={ds.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Delivery Status ── */}
        <View style={ds.card}>
          <View style={ds.cardHeader}>
            <Text style={ds.cardTitle}>Delivery Status</Text>
            <View style={ds.inTransitBadge}>
              <Text style={ds.inTransitText}>In Transit</Text>
            </View>
          </View>

          {/* Tracking steps */}
          <View style={ds.stepsWrap}>
            {TRACKING_STEPS.map((step, idx) => (
              <TrackStep
                key={step.id}
                step={step}
                isLast={idx === TRACKING_STEPS.length - 1}
              />
            ))}
          </View>
        </View>

        {/* ── Order Items ── */}
        <View style={ds.card}>
          <Text style={ds.cardTitle}>Order Items ({ORDER_ITEMS.length})</Text>
          <View style={ds.itemsList}>
            {ORDER_ITEMS.map((item, idx) => (
              <OrderItemRow
                key={item.id}
                item={item}
                isLast={idx === ORDER_ITEMS.length - 1}
              />
            ))}
          </View>
        </View>

        {/* ── Delivery Address ── */}
        <View style={ds.card}>
          <View style={ds.sectionLabelRow}>
            <Icon name="map-marker-outline" size={18} color={PINK} />
            <Text style={ds.cardTitle}>Delivery Address</Text>
          </View>
          <Text style={ds.addressName}>Jonathan Miller</Text>
          <Text style={ds.addressLine}>742 Evergreen Terrace</Text>
          <Text style={ds.addressLine}>Springfield, OR 97403</Text>
          <Text style={ds.addressLine}>United States</Text>
          <View style={ds.phoneRow}>
            <Icon name="phone-outline" size={14} color="#888" />
            <Text style={ds.addressPhone}>+1 (555) 012-3456</Text>
          </View>
        </View>

        {/* ── Payment Information ── */}
        <View style={ds.card}>
          <View style={ds.sectionLabelRow}>
            <Icon name="credit-card-outline" size={18} color={PINK} />
            <Text style={ds.cardTitle}>Payment Information</Text>
          </View>

          <View style={ds.payRow}>
            <Text style={ds.payLabel}>Subtotal</Text>
            <Text style={ds.payValue}>₹{SUBTOTAL.toFixed(2)}</Text>
          </View>
          <View style={ds.payRow}>
            <Text style={ds.payLabel}>Shipping</Text>
            <Text style={[ds.payValue, ds.freeText]}>Free</Text>
          </View>
          <View style={ds.payRow}>
            <Text style={ds.payLabel}>Discount</Text>
            <Text style={ds.payValue}>₹{DISCOUNT.toFixed(2)}</Text>
          </View>

          <View style={ds.payDivider} />

          <View style={ds.payRow}>
            <Text style={ds.totalLabel}>Total</Text>
            <Text style={ds.totalValue}>₹{TOTAL.toFixed(2)}</Text>
          </View>

          {/* Card info */}
          <View style={ds.cardInfoRow}>
            <View style={ds.visaBox}>
              <Text style={ds.visaText}>VISA</Text>
            </View>
            <Text style={ds.cardEnding}>Visa ending in 4242</Text>
            <Text style={ds.cardExpiry}>Exp/Ru 12/28</Text>
            <Icon name="check-circle" size={16} color="#059669" style={{ marginLeft: 'auto' }} />
          </View>
        </View>

        {/* ── Download Invoice ── */}
        <TouchableOpacity style={ds.invoiceBtn} activeOpacity={0.88}>
          <Icon name="download-outline" size={18} color="#FFF" />
          <Text style={ds.invoiceBtnText}>Download Invoice</Text>
        </TouchableOpacity>

        {/* Need Help */}
        <TouchableOpacity style={ds.helpRow}>
          <Icon name="help-circle-outline" size={16} color="#AAAAAA" />
          <Text style={ds.helpText}>Need Help?</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ─── Tracking step styles ─────────────────────────────────────────────────────
const ts = StyleSheet.create({
  stepRow: { flexDirection: 'row', gap: 14 },
  stepLeft: { alignItems: 'center', width: 28 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F0F0F0',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#E0E0E0',
  },
  stepDotDone:   { backgroundColor: PINK, borderColor: PINK },
  stepDotActive: { backgroundColor: '#FFFFFF', borderColor: PINK, borderWidth: 2.5 },
  stepDotInner:  { width: 10, height: 10, borderRadius: 5, backgroundColor: PINK },
  stepLine:      { width: 2, flex: 1, backgroundColor: '#E0E0E0', marginVertical: 4, minHeight: 24 },
  stepLineDone:  { backgroundColor: PINK },
  stepContent:   { flex: 1, paddingBottom: 20 },
  stepLabel:     { fontSize: 14, fontFamily: Fonts.secondary.semiBold, color: '#AAAAAA' },
  stepLabelDone: { color: '#1A1A1A' },
  stepLabelActive:{ color: '#1A1A1A' },
  stepTime:      { fontSize: 12, fontFamily: Fonts.secondary.regular, color: '#AAAAAA', marginTop: 2 },
  stepNote:      { fontSize: 12, fontFamily: Fonts.secondary.semiBold, color: PINK, marginTop: 4 },
});

// ─── Detail screen styles ─────────────────────────────────────────────────────
const ds = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F9' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', paddingHorizontal: 8,
    paddingTop: Platform.OS === 'ios' ? 54 : 36, paddingBottom: 12,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
    justifyContent :'space-between'
  },
  hIcon:       { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { textAlign: 'center', fontSize: 15, fontFamily: Fonts.secondary.semiBold, color: PINK , marginTop : 4 },
  hRight:      { flexDirection: 'row', alignItems: 'center' },

  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  cardTitle:  { fontSize: 16, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A' },

  inTransitBadge: {
    backgroundColor: '#FFF0F6', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  inTransitText: { fontSize: 12, fontFamily: Fonts.secondary.semiBold, color: PINK },

  stepsWrap: { gap: 0 },

  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },

  // Items
  itemsList: {},
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  itemRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  itemThumb: { width: 56, height: 56, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  itemInfo:  { flex: 1 },
  itemName:  { fontSize: 13, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A' },
  itemDesc:  { fontSize: 11, fontFamily: Fonts.secondary.regular, color: '#AAAAAA', marginTop: 2 },
  itemQty:   { fontSize: 12, fontFamily: Fonts.secondary.regular, color: '#777777', marginTop: 4 },
  itemPrice: { fontSize: 14, fontFamily: Fonts.secondary.semiBold, color: PINK },

  // Address
  addressName:  { fontSize: 14, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A', marginBottom: 4 },
  addressLine:  { fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#555555', lineHeight: 20 },
  phoneRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  addressPhone: { fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#555555' },

  // Payment
  payRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  payLabel:  { fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#555555' },
  payValue:  { fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#1A1A1A' },
  freeText:  { color: '#059669', fontFamily: Fonts.secondary.semiBold },
  payDivider:{ height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
  totalLabel:{ fontSize: 16, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A' },
  totalValue:{ fontSize: 20, fontFamily: Fonts.secondary.semiBold, color: PINK },

  cardInfoRow:{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, backgroundColor: '#F8F8F8', borderRadius: 10, padding: 12 },
  visaBox:    { backgroundColor: '#1A1F71', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 },
  visaText:   { fontSize: 9, fontFamily: Fonts.secondary.semiBold, color: '#FFFFFF', letterSpacing: 0.5 },
  cardEnding: { fontSize: 13, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A' },
  cardExpiry: { fontSize: 11, fontFamily: Fonts.secondary.regular, color: '#AAAAAA' },

  // Invoice btn
  invoiceBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: PINK, borderRadius: 14,
    paddingVertical: 16, marginBottom: 14,
    shadowColor: PINK, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  invoiceBtnText: { fontSize: 15, fontFamily: Fonts.secondary.semiBold, color: '#FFFFFF' },

  // Help
  helpRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 },
  helpText: { fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#AAAAAA' },
});