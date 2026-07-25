// WalletScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fonts from '../constant/Fonts';

const PINK       = '#B6005B';
const PINK_LIGHT = '#FDF0F7';
const SCREEN_BG  = '#F5F5F7';
const CARD_BG    = '#FFFFFF';
const MUTED      = '#888';
const BORDER     = '#F0F0F0';

const REFERRAL_TABS = ['Refer Now', 'My Referrals'];
// const FILTER_TABS   = ['All', 'Pending', 'Completed', 'Invalid'];

const REFERRALS = [
  {
    id: 1,
    name: 'Alex Johnson',
    joined: 'Joined Oct 24',
    status: 'Ordered',
    badge: 'COMPLETED',
    badgeColor: '#E8F5E9',
    badgeText: '#2E7D32',
    amount: '₹20',
    amountColor: PINK,
    icon: 'work',
    iconBg: '#FDF0F7',
    iconColor: PINK,
  },
  {
    id: 2,
    name: 'Sarah Miller',
    joined: 'Joined Oct 26',
    status: 'Created',
    badge: 'PENDING',
    badgeColor: '#FFF8E1',
    badgeText: '#F9A825',
    amount: '₹0',
    amountColor: '#333',
    icon: 'person-add',
    iconBg: '#F3F0FF',
    iconColor: '#7C4DFF',
  },
  {
    id: 3,
    name: 'Robert Chen',
    joined: 'Joined Oct 20',
    status: 'Cancelled',
    badge: 'INVALID',
    badgeColor: '#FAFAFA',
    badgeText: '#999',
    amount: '₹0',
    amountColor: '#333',
    icon: 'cancel',
    iconBg: '#F5F5F5',
    iconColor: '#BDBDBD',
  },
];

export default function WalletScreen({ navigation }) {
  const [activeMainTab, setActiveMainTab] = useState('Refer Now');
  // const [activeFilter,  setActiveFilter]  = useState('All');
  const earned = 100;

  // const filtered = activeFilter === 'All'
  //   ? REFERRALS
  //   : REFERRALS.filter(r => r.badge === activeFilter.toUpperCase());

  return (
    <View style={{ flex: 1, backgroundColor: SCREEN_BG }}>
      <StatusBar backgroundColor={SCREEN_BG} barStyle="dark-content" />

      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={PINK} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Wallet</Text>
      </View>

      {/* ── Main Tabs (Refer Now / My Referrals) ── */}
      <View style={styles.mainTabsWrap}>
        {REFERRAL_TABS.map(tab => {
          const active = activeMainTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={styles.mainTab}
              onPress={() => setActiveMainTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.mainTabText, active && styles.mainTabTextActive]}>
                {tab}
              </Text>
              {active && <View style={styles.mainTabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── TAB 1: Refer Now ── */}
      {activeMainTab === 'Refer Now' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Earnings Overview */}
          <View style={styles.card}>
            <Text style={styles.overviewLabel}>EARNINGS OVERVIEW</Text>
            <Text style={styles.earningsAmount}>₹{earned.toFixed(2)}</Text>
            <Text style={styles.earningsSubtitle}>
              Total rewards earned from your medical{'\n'}community network.
            </Text>
          </View>

          {/* Refer & Earn */}
          <View style={[styles.card, styles.referCard]}>
            <View style={styles.giftIconWrap}>
              <MaterialIcons name="card-giftcard" size={32} color={PINK} />
            </View>
            <Text style={styles.referTitle}>Refer & Earn</Text>
            <Text style={styles.referSubtitle}>
              Get ₹20 for every friend who completes their{'\n'}first order.
            </Text>
            <TouchableOpacity style={styles.inviteBtn} activeOpacity={0.85}>
              <Text style={styles.inviteBtnText}>Invite Friends</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}

    
      {/* {activeMainTab === 'My Referrals' && (
        <View style={{ flex: 0 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterTabsScroll}
            contentContainerStyle={styles.filterTabsContent}
          >
            {FILTER_TABS.map(tab => {
              const active = activeFilter === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterTab, active && styles.filterTabActive]}
                  onPress={() => setActiveFilter(tab)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="people-outline" size={48} color="#DDD" />
                <Text style={styles.emptyText}>No referrals found.</Text>
              </View>
            ) : (
              <View style={styles.listCard}>
                {filtered.map((item, i) => (
                  <View
                    key={item.id}
                    style={[styles.referralRow, i < filtered.length - 1 && styles.referralBorder]}
                  >
                    <View style={[styles.refIconWrap, { backgroundColor: item.iconBg }]}>
                      <MaterialIcons name={item.icon} size={22} color={item.iconColor} />
                    </View>

                    <View style={styles.refInfo}>
                      <View style={styles.refTopRow}>
                        <Text style={styles.refName}>{item.name}</Text>
                        <View style={[styles.refBadge, { backgroundColor: item.badgeColor }]}>
                          <Text style={[styles.refBadgeText, { color: item.badgeText }]}>
                            {item.badge}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.refBottomRow}>
                        <Text style={styles.refMeta}>{item.joined} • Status: {item.status}</Text>
                        <Text style={[styles.refAmount, { color: item.amountColor }]}>
                          {item.amount}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      )} */}

      {/* ── TAB 2: My Referrals ── */}
{activeMainTab === 'My Referrals' && (
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
    {REFERRALS.length === 0 ? (
      <View style={styles.emptyState}>
        <MaterialIcons name="people-outline" size={48} color="#DDD" />
        <Text style={styles.emptyText}>No referrals found.</Text>
      </View>
    ) : (
      <View style={styles.listCard}>
        {REFERRALS.map((item, i) => (
          <View
            key={item.id}
            style={[styles.referralRow, i < REFERRALS.length - 1 && styles.referralBorder]}
          >
            <View style={[styles.refIconWrap, { backgroundColor: item.iconBg }]}>
              <MaterialIcons name={item.icon} size={22} color={item.iconColor} />
            </View>

            <View style={styles.refInfo}>
              <Text style={styles.refName}>{item.name}</Text>
              <Text style={styles.refMeta}>{item.joined}</Text>
            </View>

            <Text style={[styles.refAmount, { color: item.amountColor }]}>
              {item.amount}
            </Text>
          </View>
        ))}
      </View>
    )}
    <View style={{ height: 32 }} />
  </ScrollView>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 32 },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingTop: 40, paddingBottom: 10,
    backgroundColor: SCREEN_BG,
  },
  backBtn:  { marginRight: 8 },
  topTitle: { flex: 1, fontSize: 18, fontFamily: Fonts.secondary.bold, color: PINK  , marginLeft : 6 , marginTop : 3},

  // ── Main Tabs ──
  mainTabsWrap: {
    flexDirection: 'row',
    // backgroundColor: CARD_BG,
    borderBottomWidth: 1, 
    borderBottomColor: BORDER,
    marginBottom: 4,
  },
  mainTab: {
    flex: 1, alignItems: 'center',
    paddingVertical: 13, position: 'relative',
  },
  mainTabText: {
    fontSize: 14, fontFamily: Fonts.semiBold, color: MUTED,
  },
  mainTabTextActive: { color: PINK, fontFamily: Fonts.secondary.bold },
  mainTabIndicator: {
    position: 'absolute', bottom: 0, left: '20%', right: '20%',
    height: 2.5, backgroundColor: PINK, borderRadius: 2,
  },

  // Card
  card: {
    backgroundColor: CARD_BG, borderRadius: 16, padding: 18,
    marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
  },

  // Earnings
  overviewLabel:    { fontSize: 11, fontFamily: Fonts.secondary.bold, color: MUTED, letterSpacing: 1, marginBottom: 8 },
  earningsAmount:   { fontSize: 36, fontFamily: Fonts.secondary.bold, color: '#1A1A1A', marginBottom: 6 },
  earningsSubtitle: { fontSize: 13, fontFamily: Fonts.regular, color: MUTED, lineHeight: 20 },

  // Refer & Earn
  referCard:    { alignItems: 'center', paddingVertical: 24 },
  giftIconWrap: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: PINK_LIGHT, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  referTitle:    { fontSize: 20, fontFamily: Fonts.secondary.bold, color: '#1A1A1A', marginBottom: 8 },
  referSubtitle: { fontSize: 13, fontFamily: Fonts.regular, color: MUTED, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  inviteBtn: {
    backgroundColor: PINK, borderRadius: 30,
    paddingVertical: 14, paddingHorizontal: 48,
    shadowColor: PINK, shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 6,
    ...Platform.select({ android: { paddingTop: 16, paddingBottom: 12 } }),
  },
  inviteBtnText: {
    color: '#fff', fontSize: 15, fontFamily: Fonts.secondary.semiBold,
    includeFontPadding: false, textAlignVertical: 'center',
    marginTop : -3
  },

  
  filterTabsScroll:   {  borderBottomWidth: 1, borderBottomColor: BORDER },
  filterTabsContent:  { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  filterTab: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 30, backgroundColor: '#F5F5F5',
    borderWidth: 1, borderColor: '#cbcbcb',
    height : 40
  },
  filterTabActive:     { backgroundColor: PINK, borderColor: PINK },
  filterTabText:       { fontSize: 13, fontFamily: Fonts.semiBold, color: '#555' , marginTop : 1 },
  filterTabTextActive: { color: '#fff' },


  listCard: {
    backgroundColor: CARD_BG, borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000', shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
  },
  referralRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  referralBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  refIconWrap:    { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  refInfo:        { flex: 1 },
  refTopRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  refName:        { fontSize: 14, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A' },
  refBadge:       { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  refBadgeText:   { fontSize: 10, fontFamily: Fonts.secondary.bold, letterSpacing: 0.4 },
  refBottomRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  refMeta:        { fontSize: 12, fontFamily: Fonts.secondary.regular, color: MUTED },
  refAmount:      { fontSize: 15, fontFamily: Fonts.secondary.bold },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText:  { fontSize: 14, fontFamily: Fonts.regular, color: '#AAAAAA' },
});