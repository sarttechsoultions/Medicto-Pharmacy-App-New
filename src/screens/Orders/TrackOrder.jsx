// TrackOrderScreen.jsx
import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fonts from '../../constant/Fonts';
import { base_api } from '../../services/service';

const PINK = '#B6005B';
const PINK_LIGHT = '#F9EDF2';
const PINK_BADGE_BG = '#F7D6E3';
const PINK_BADGE_TEXT = '#993556';
const MUTED = '#888';
const BORDER = '#EFEFEF';
const CARD_BG = '#FFFFFF';
const SCREEN_BG = '#F5F5F7';

// Step definitions based on order status flow
const STEP_DEFS = [
  { key: 'ordered',          label: 'Ordered',          dateKey: 'ordered_at',          icon: 'shopping-bag' },
  { key: 'confirmed',        label: 'Confirmed',        dateKey: 'confirmed_at',        icon: 'check-circle' },
  { key: 'processing',       label: 'Processing',       dateKey: 'processing_at',       icon: 'inventory' },
  { key: 'out_for_delivery', label: 'Out for Delivery', dateKey: 'out_for_delivery_at', icon: 'local-shipping' },
  { key: 'delivered',        label: 'Delivered',        dateKey: 'delivered_at',        icon: 'home' },
];

const STATUS_ORDER = ['Ordered', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered'];

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return null;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hr12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} • ${hr12}:${mins} ${ampm}`;
}

function buildSteps(order) {
  if (!order) return [];

  // Handle cancelled orders separately
  if (order.status === 'Cancelled') {
    return [
      { label: 'Ordered',   time: formatDate(order.ordered_at) || '—',   done: true, active: false, icon: 'shopping-bag' },
      { label: 'Cancelled', time: formatDate(order.cancelled_at) || '—', done: true, active: true,  icon: 'cancel', isCancelled: true },
    ];
  }

  const currentIndex = STATUS_ORDER.indexOf(order.status);

  return STEP_DEFS.map((def, i) => {
    const done = i < currentIndex || (i === currentIndex && def.key === 'delivered');
    const active = i === currentIndex && def.key !== 'delivered';
    const dateVal = order[def.dateKey];

    let time;
    if (dateVal) {
      time = formatDate(dateVal);
    } else if (active) {
      time = 'In progress';
    } else if (i > currentIndex) {
      time = 'Pending';
    } else {
      time = '—';
    }

    let note;
    if (def.key === 'out_for_delivery' && active) {
      note = 'Your order is on its way';
    }

    return { label: def.label, time, done, active, icon: def.icon, note };
  });
}

// Step icon based on state
function StepDot({ done, active, icon, isCancelled }) {
  if (isCancelled) {
    return (
      <View style={[styles.dot, { backgroundColor: '#D9534F' }]}>
        <MaterialIcons name="close" size={12} color="#fff" />
      </View>
    );
  }
  if (done) {
    return (
      <View style={[styles.dot, styles.dotDone]}>
        <MaterialIcons name="check" size={12} color="#fff" />
      </View>
    );
  }
  if (active) {
    return (
      <View style={[styles.dot, styles.dotActive]}>
        <View style={styles.dotInner} />
      </View>
    );
  }
  return (
    <View style={[styles.dot, styles.dotPending]}>
      <MaterialIcons name={icon || 'local-shipping'} size={11} color="#bbb" />
    </View>
  );
}

export default function TrackOrderScreen({ navigation, route }) {
  // Order object comes directly from params (response.data[0] from the
  // previous screen's API call) — no extra fetching needed here.
  const { order } = route?.params || {};

  if (!order) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar backgroundColor={SCREEN_BG} barStyle="dark-content" />
        <MaterialIcons name="error-outline" size={48} color={MUTED} />
        <Text style={styles.errorText}>Order details not available</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => navigation?.goBack()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const steps = buildSteps(order);
  const items = order.items || [];

  const subtotal = parseFloat(order.subtotal || 0);
  const shippingCharge = parseFloat(order.shipping_charge || 0);
  const discount = parseFloat(order.discount || 0);
  const total = parseFloat(order.total_amount || 0);

  return (
    <View style={{ flex: 1, backgroundColor: SCREEN_BG }}>
      <StatusBar backgroundColor={SCREEN_BG} barStyle="dark-content" />

      {/* ── Top Header ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={PINK} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Order #{order.order_id}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Delivery Status Card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Delivery Status</Text>
            <View style={[
              styles.badge,
              order.status === 'Cancelled' && { backgroundColor: '#FBE3E1' },
            ]}>
              <Text style={[
                styles.badgeText,
                order.status === 'Cancelled' && { color: '#D9534F' },
              ]}>
                {order.status}
              </Text>
            </View>
          </View>

          {steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              {/* Left: dot + line */}
              <View style={styles.stepTrack}>
                <StepDot
                  done={step.done}
                  active={step.active}
                  icon={step.icon}
                  isCancelled={step.isCancelled}
                />
                {i < steps.length - 1 && (
                  <View style={[styles.line, step.done && styles.lineDone]} />
                )}
              </View>

              {/* Right: text */}
              <View style={styles.stepContent}>
                <Text style={[styles.stepLabel, !step.done && !step.active && styles.muted]}>
                  {step.label}
                </Text>
                <Text style={styles.stepTime}>{step.time}</Text>
                {step.note && (
                  <View style={styles.noteRow}>
                    <MaterialIcons name="local-shipping" size={13} color={PINK} />
                    <Text style={styles.stepNote}> {step.note}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* ── Order Items Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Items ({items.length})</Text>

          {items.map((item, i) => (
            <View key={item.id} style={[
              styles.itemRow,
              i < items.length - 1 && styles.itemBorder,
            ]}>
              {/* Medicine image / fallback icon */}
              <View style={styles.itemThumb}>
                {item.medicine_image ? (
                  <Image
                    source={{ uri: `${base_api}${item.medicine_image}` }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <MaterialIcons name="medication" size={28} color={PINK} />
                )}
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.medicine_name}</Text>
                <View style={styles.itemFooter}>
                  <View style={styles.qtyPill}>
                    <Text style={styles.qtyText}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₹{parseFloat(item.subtotal).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ── Delivery Address Card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="location-on" size={18} color={PINK} />
            <Text style={[styles.cardTitle, { marginLeft: 6, marginBottom: 0 }]}>Delivery Address</Text>
          </View>
          <View style={{ height: 12 }} />

          {order.delivery_address_label && (
            <View style={styles.labelPill}>
              <Text style={styles.labelPillText}>{order.delivery_address_label}</Text>
            </View>
          )}

          <Text style={styles.addrLine}>{order.delivery_street_address}</Text>
          {order.delivery_landmark && (
            <Text style={styles.addrLine}>{order.delivery_landmark}</Text>
          )}
          <Text style={styles.addrLine}>
            {order.delivery_city}, {order.delivery_state} - {order.delivery_pin_code}
          </Text>

          <View style={styles.phoneRow}>
            <MaterialIcons name="phone" size={14} color={MUTED} />
            <Text style={[styles.addrLine, { marginLeft: 4 }]}>{order.delivery_phone_number}</Text>
          </View>
        </View>

        {/* ── Payment Card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="credit-card" size={18} color={PINK} />
            <Text style={[styles.cardTitle, { marginLeft: 6, marginBottom: 0 }]}>Payment Information</Text>
          </View>
          <View style={{ height: 14 }} />

          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Subtotal</Text>
            <Text style={styles.payValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Shipping</Text>
            <Text style={[styles.payValue, shippingCharge === 0 && { color: PINK }]}>
              {shippingCharge === 0 ? 'Free' : `₹${shippingCharge.toFixed(2)}`}
            </Text>
          </View>
          {discount > 0 && (
            <View style={styles.payRow}>
              <Text style={styles.payLabel}>Discount</Text>
              <Text style={styles.payValue}>-₹{discount.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
          </View>

          {/* Payment status box */}
          <View style={styles.visaBox}>
            <View style={[
              styles.statusBadge,
              order.payment_status === 'Paid' ? styles.statusPaid : styles.statusPending,
            ]}>
              <Text style={[
                styles.statusBadgeText,
                order.payment_status === 'Paid' ? { color: '#1A7A3D' } : { color: '#A66A00' },
              ]}>
                {order.payment_status}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.visaCard}>Payment Status</Text>
              <Text style={styles.visaExp}>
                {order.payment_status === 'Paid' ? 'Payment completed' : 'Payment not yet received'}
              </Text>
            </View>
            <MaterialIcons
              name={order.payment_status === 'Paid' ? 'verified' : 'schedule'}
              size={22}
              color={order.payment_status === 'Paid' ? PINK : MUTED}
            />
          </View>
        </View>

        {/* ── Need Help ── */}
        <TouchableOpacity style={styles.helpRow}>
          <MaterialIcons name="help-outline" size={18} color={MUTED} />
          <Text style={styles.helpText}> Need Help?</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SCREEN_BG },
  centerContent: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  scroll: { paddingHorizontal: 14, paddingBottom: 16 },

  errorText: {
    fontFamily: Fonts.secondary.medium,
    fontSize: 14, color: MUTED, marginTop: 12, textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16, backgroundColor: PINK,
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10,
  },
  retryText: { fontFamily: Fonts.secondary.semiBold, fontSize: 14, color: '#fff' },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingTop: 24, paddingBottom: 10,
    backgroundColor: SCREEN_BG,
    marginTop: 20,
  },
  backBtn: { padding: 2, marginRight: 6 },
  topTitle: { flex: 1, fontFamily: Fonts.secondary.semiBold, fontSize: 17, color: PINK },

  // Card
  card: {
    backgroundColor: CARD_BG, borderRadius: 16,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  cardTitle: { fontFamily: Fonts.secondary.semiBold, fontSize: 15, color: '#1A1A1A', marginBottom: 12 },

  // Badge
  badge: {
    backgroundColor: PINK_BADGE_BG,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5,
  },
  badgeText: { fontFamily: Fonts.secondary.semiBold, color: PINK_BADGE_TEXT, fontSize: 12 , marginTop : 2 },

  // Steps
  stepRow: { flexDirection: 'row', gap: 12 },
  stepTrack: { alignItems: 'center', width: 22 },
  dot: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  dotDone:    { backgroundColor: PINK },
  dotActive:  { backgroundColor: '#fff', borderWidth: 2.5, borderColor: PINK },
  dotPending: { backgroundColor: '#EBEBEB' },
  dotInner:   { width: 8, height: 8, borderRadius: 4, backgroundColor: PINK },
  line:       { width: 2, flex: 1, backgroundColor: '#E0E0E0', marginVertical: 3, minHeight: 18 },
  lineDone:   { backgroundColor: PINK },
  stepContent: { flex: 1, paddingBottom: 16 },
  stepLabel:   { fontFamily: Fonts.secondary.semiBold, fontSize: 14, color: '#1A1A1A' },
  stepTime:    { fontFamily: Fonts.secondary.regular, fontSize: 12, color: MUTED, marginTop: 2 },
  noteRow:     { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  stepNote:    { fontFamily: Fonts.secondary.medium, fontSize: 12, color: PINK },
  muted:       { color: '#ADADAD' },

  // Items
  itemRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  itemThumb:  {
    width: 64, height: 64, borderRadius: 12,
    backgroundColor: PINK_LIGHT, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImage:  { width: 64, height: 64 },
  itemInfo:   { flex: 1 },
  itemName:   { fontFamily: Fonts.secondary.semiBold, fontSize: 14, color: '#1A1A1A' },
  itemDesc:   { fontFamily: Fonts.secondary.regular, fontSize: 12, color: MUTED, marginTop: 2 },
  itemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  qtyPill:    {
    borderWidth: 1, borderColor: BORDER,
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3,
  },
  qtyText:    { fontFamily: Fonts.secondary.regular, fontSize: 12, color: '#555' },
  itemPrice:  { fontFamily: Fonts.secondary.bold, fontSize: 15, color: PINK },

  // Address
  labelPill: {
    alignSelf: 'flex-start', backgroundColor: PINK_LIGHT,
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 8,
  },
  labelPillText: { fontFamily: Fonts.secondary.semiBold, fontSize: 11, color: PINK },
  addrName:  { fontFamily: Fonts.secondary.semiBold, fontSize: 14, color: '#1A1A1A', marginBottom: 4 },
  addrLine:  { fontFamily: Fonts.secondary.regular, fontSize: 13, color: MUTED, lineHeight: 20 },
  phoneRow:  { flexDirection: 'row', alignItems: 'center', marginTop: 4 },

  // Payment
  payRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  payLabel:  { fontFamily: Fonts.secondary.regular, fontSize: 13, color: MUTED },
  payValue:  { fontFamily: Fonts.secondary.medium, fontSize: 13, color: '#1A1A1A' },
  totalRow:  {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: BORDER,
    paddingTop: 12, marginTop: 4, marginBottom: 12,
  },
  totalLabel: { fontFamily: Fonts.secondary.bold, fontSize: 15, color: '#1A1A1A' },
  totalValue: { fontFamily: Fonts.secondary.bold, fontSize: 18, color: PINK },

  visaBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F8F8', borderRadius: 12,
    padding: 12,
  },
  statusBadge: {
    borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5,
  },
  statusPaid:    { backgroundColor: '#E1F4E8' },
  statusPending: { backgroundColor: '#FCEFD9' },
  statusBadgeText: { fontFamily: Fonts.secondary.bold, fontSize: 11, letterSpacing: 0.5 , marginTop : 2 },
  visaCard: { fontFamily: Fonts.secondary.semiBold, fontSize: 13, color: '#1A1A1A' },
  visaExp:  { fontFamily: Fonts.secondary.regular, fontSize: 11, color: MUTED, marginTop: 1 },

  // Help
  helpRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  helpText: { fontFamily: Fonts.secondary.regular, fontSize: 13, color: MUTED },
});