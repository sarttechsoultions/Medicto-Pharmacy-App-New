// ReferAndEarnScreen.jsx
import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Clipboard, Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import Fonts from '../constant/Fonts';
import { useSelector } from 'react-redux';
const PINK        = '#B6005B';
const PINK_DARK   = '#B5005B';
const PINK_HERO   = '#C2185B';
const PINK_LIGHT  = '#FDF0F7';
const SCREEN_BG   = '#F5F5F7';
const CARD_BG     = '#FFFFFF';
const MUTED       = '#888';
const BORDER      = '#F0F0F0';



const ACTIVITY = [
  { initials: 'JS', name: 'Jane S.',    sub: 'Joined today',         status: 'Processing', amount: null,      bgColor: '#F3E5F5', textColor: '#7B1FA2' },
  { initials: 'MR', name: 'Mike R.',    sub: 'Ordered Yesterday',    status: null,          amount: '+₹20.00', bgColor: '#FCE4EC', textColor: PINK_DARK },
  { initials: 'AL', name: 'Anita L.',   sub: 'Completed 2 days ago', status: null,          amount: '+₹20.00', bgColor: '#FCE4EC', textColor: PINK_DARK },
];

const HOW_IT_WORKS = [
  { icon: 'play-arrow',             step: '1. Send Invitation',    desc: 'Share your unique code or link with friends via text, email, or social media.' },
  { icon: 'add-shopping-cart',      step: '2. Friend Places Order', desc: 'Your friend gets a ₹10 discount on their first clinical order using your link.' },
  { icon: 'account-balance-wallet', step: '3. Receive ₹20 Credits', desc: "Once their order is delivered, we'll deposit ₹20 directly into your wallet." },
];

export default function ReferAndEarnScreen({ navigation }) {
  const user = useSelector( ( state ) => state.auth.user );

  // console.log('user ---------- ', user);
  
  
  const handleCopy = () => {
    Clipboard.setString(REFERRAL_CODE);
    Toast.show({ type: 'success', text1: 'Copied!', text2: 'Referral code copied to clipboard.' });
  };
  const REFERRAL_CODE = user?.referral_code || null;


  const handleShare = () => {
    Toast.show({ type: 'info', text1: 'Share', text2: 'Share feature coming soon!' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: SCREEN_BG }}>
      <StatusBar backgroundColor={SCREEN_BG} barStyle="dark-content" />

      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={PINK} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Refer & Earn</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero Banner ── */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Limited Time Offer</Text>
          </View>
          <Text style={styles.heroTitle}>Refer a Friend,{'\n'}Earn ₹ 20</Text>
          <Text style={styles.heroSubtitle}>
            Help your friends access premium healthcare and get rewarded for every first order they place.
          </Text>
          <TouchableOpacity style={styles.heroBtn} activeOpacity={0.85}>
            <Text style={styles.heroBtnText}>Invite Friends Now</Text>
          </TouchableOpacity>
        </View>

        {/* ── Total Rewards Card ── */}
        {/* <View style={styles.card}>
          <Text style={styles.rewardsLabel}>Total Rewards</Text>
          <Text style={styles.rewardsSubLabel}>BALANCE EARNED</Text>
          <Text style={styles.rewardsAmount}>₹140.00</Text>

          <View style={styles.rewardsRow}>
            <View style={styles.rewardsStat}>
              <Text style={styles.rewardsStatLabel}>TOTAL REFERRALS</Text>
              <Text style={styles.rewardsStatValue}>12</Text>
            </View>
            <View style={[styles.rewardsStat, styles.rewardsStatRight]}>
              <Text style={styles.rewardsStatLabel}>PENDING</Text>
              <Text style={[styles.rewardsStatValue, { color: PINK }]}>₹40.00</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.viewHistoryRow}>
            <Text style={styles.viewHistoryText}>View Reward History</Text>
            <MaterialIcons name="chevron-right" size={18} color={PINK} />
          </TouchableOpacity>
        </View> */}

        {/* ── Referral Code Card ── */}
        <View style={styles.referralCodeCard}>
          <Text style={styles.referralCodeLabel}>YOUR REFERRAL CODE</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{REFERRAL_CODE}</Text>
          </View>
          <View style={styles.codeActions}>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.85}>
              <Text style={styles.copyBtnText}>Copy Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
              <MaterialIcons name="share" size={16} color="#fff" />
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Referral Journey ── */}
        <Text style={styles.sectionTitle}>Referral Journey</Text>
        <View style={styles.card}>
          <View style={styles.journeyRow}>
            <View style={styles.journeyStep}>
              <View style={[styles.journeyDot, styles.journeyDotDone]}>
                <MaterialIcons name="person-add" size={18} color="#fff" />
              </View>
              <Text style={styles.journeyStepLabel}>Friend Joins</Text>
            </View>
            <View style={styles.journeyLineDone} />
            <View style={styles.journeyStep}>
              <View style={[styles.journeyDot, styles.journeyDotDone]}>
                <MaterialIcons name="shopping-cart" size={18} color="#fff" />
              </View>
              <Text style={styles.journeyStepLabel}>Friend Orders</Text>
            </View>
            <View style={styles.journeyLinePending} />
            <View style={styles.journeyStep}>
              <View style={[styles.journeyDot, styles.journeyDotPending]}>
                <MaterialIcons name="card-giftcard" size={18} color="#bbb" />
              </View>
              <Text style={styles.journeyStepLabel}>You Earn Reward</Text>
            </View>
          </View>

          <View style={styles.journeyNote}>
            <MaterialIcons name="info-outline" size={16} color={PINK} style={{ marginTop: 1 }} />
            <Text style={styles.journeyNoteText}>
              Rewards are credited 24h after your friend's first delivery.
            </Text>
          </View>
        </View>

        {/* ── Activity ── */}
        <View style={styles.card}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {ACTIVITY.map((item, i) => (
            <View key={i} style={[
              styles.activityRow,
              i < ACTIVITY.length - 1 && styles.activityBorder,
            ]}>
              <View style={[styles.activityAvatar, { backgroundColor: item.bgColor }]}>
                <Text style={[styles.activityInitials, { color: item.textColor }]}>
                  {item.initials}
                </Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{item.name}</Text>
                <Text style={styles.activitySub}>{item.sub}</Text>
              </View>
              {item.status
                ? <Text style={styles.activityStatus}>{item.status}</Text>
                : <Text style={styles.activityAmount}>{item.amount}</Text>
              }
            </View>
          ))}
        </View>

        {/* ── How It Works ── */}
        <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>How It Works</Text>
        <View style={styles.card}>
          {HOW_IT_WORKS.map((item, i) => (
            <View key={i} style={[
              styles.howRow,
              i < HOW_IT_WORKS.length - 1 && styles.howBorder,
            ]}>
              <View style={styles.howIconWrap}>
                <MaterialIcons name={item.icon} size={24} color={PINK} />
              </View>
              <Text style={styles.howStep}>{item.step}</Text>
              <Text style={styles.howDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>

        {/* ── FAQ ── */}
        <View style={styles.faqCard}>
          <MaterialIcons name="help-outline" size={22} color={MUTED} style={{ marginRight: 10, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.faqQuestion}>Have questions about the Referral Program?</Text>
            <TouchableOpacity style={styles.faqLinkRow}>
              <Text style={styles.faqLink}>Read our Referral FAQs</Text>
              <MaterialIcons name="open-in-new" size={14} color={PINK} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 14, paddingBottom: 16 },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10,
    backgroundColor: SCREEN_BG, marginTop: 30,
  },
  backBtn:  { marginRight: 8 },
  topTitle: { flex: 1, fontSize: 20, fontFamily: Fonts.bold, color: PINK },

  // Hero
  heroBanner: {
    backgroundColor: PINK_HERO, borderRadius: 18,
    padding: 20, marginBottom: 14,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 14,
  },
  heroBadgeText: { color: '#fff', fontSize: 12, fontFamily: Fonts.semiBold },
  heroTitle:     { fontSize: 26, fontFamily: Fonts.bold, color: '#fff', lineHeight: 34, marginBottom: 10 },
  heroSubtitle:  { fontSize: 13, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.85)', lineHeight: 20, marginBottom: 20 },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff', borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 22,
    // Fix for custom font text shifting up on Android
    ...Platform.select({ android: { paddingTop: 14, paddingBottom: 10 } }),
  },
  heroBtnText: {
    fontSize: 14, fontFamily: Fonts.bold, color: PINK_HERO,
    includeFontPadding: false, textAlignVertical: 'center',marginBottom : 2
  },

  // Card
  card: {
    backgroundColor: CARD_BG, borderRadius: 16, padding: 16,
    marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
  },

  // Total Rewards
  rewardsLabel:     { fontSize: 13, fontFamily: Fonts.regular, color: MUTED, marginBottom: 8 },
  rewardsSubLabel:  { fontSize: 11, fontFamily: Fonts.bold, color: MUTED, letterSpacing: 0.8 },
  rewardsAmount:    { fontSize: 34, fontFamily: Fonts.bold, color: '#1A1A1A', marginBottom: 16 },
  rewardsRow:       { flexDirection: 'row', marginBottom: 14 },
  rewardsStat:      { flex: 1 },
  rewardsStatRight: {
    borderLeftWidth: 1, borderLeftColor: BORDER, paddingLeft: 16,
    backgroundColor: '#FDF5F8', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12,
  },
  rewardsStatLabel: { fontSize: 10, fontFamily: Fonts.bold, color: MUTED, letterSpacing: 0.6, marginBottom: 4 },
  rewardsStatValue: { fontSize: 20, fontFamily: Fonts.bold, color: '#1A1A1A' },
  viewHistoryRow:   { flexDirection: 'row', alignItems: 'center' },
  viewHistoryText:  { fontSize: 13, fontFamily: Fonts.semiBold, color: PINK },

  // Referral Code Card
  referralCodeCard: {
    backgroundColor: '#C2185B', borderRadius: 18,
    padding: 20, marginBottom: 14, alignItems: 'center',
  },
  referralCodeLabel: { fontSize: 11, fontFamily: Fonts.bold, color: 'rgba(255,255,255,0.75)', letterSpacing: 1.2, marginBottom: 14 },
  codeBox: {
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)',
    borderStyle: 'dashed', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 40, marginBottom: 18,
  },
  codeText: { fontSize: 22, fontFamily: Fonts.bold, color: '#fff', letterSpacing: 3 },
  codeActions: { flexDirection: 'row', gap: 12 },
  copyBtn: {
    backgroundColor: '#fff', borderRadius: 10,
    paddingVertical: 11, paddingHorizontal: 22,
    ...Platform.select({ android: { paddingTop: 13, paddingBottom: 9 } }),
  },
  copyBtnText: {
    fontSize: 14, fontFamily: Fonts.bold, color: PINK_HERO,
    includeFontPadding: false, textAlignVertical: 'center',marginBottom : 2
  },
  shareBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10,
    paddingVertical: 11, paddingHorizontal: 22,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    ...Platform.select({ android: { paddingTop: 13, paddingBottom: 9 } }),
  },
  shareBtnText: {
    fontSize: 14, fontFamily: Fonts.bold, color: '#fff',
    includeFontPadding: false, textAlignVertical: 'center',marginBottom : 2
  },

  // Section title
  sectionTitle: { fontSize: 16, fontFamily: Fonts.bold, color: '#1A1A1A', marginBottom: 12 },

  // Journey
  journeyRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  journeyStep:        { alignItems: 'center', flex: 1 },
  journeyDot:         { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  journeyDotDone:     { backgroundColor: PINK_HERO },
  journeyDotPending:  { backgroundColor: '#EBEBEB' },
  journeyStepLabel:   { fontSize: 11, fontFamily: Fonts.medium, color: '#555', textAlign: 'center' },
  journeyLineDone:    { height: 3, flex: 0.4, backgroundColor: PINK_HERO, marginBottom: 18 },
  journeyLinePending: { height: 3, flex: 0.4, backgroundColor: '#E0E0E0', marginBottom: 18 },
  journeyNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: PINK_LIGHT, borderRadius: 10, padding: 12,
  },
  journeyNoteText: { flex: 1, fontSize: 13, fontFamily: Fonts.semiBold, color: PINK, lineHeight: 18 },

  // Activity
  activityHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  activityTitle:    { fontSize: 15, fontFamily: Fonts.bold, color: '#1A1A1A' },
  viewAll:          { fontSize: 13, fontFamily: Fonts.semiBold, color: PINK },
  activityRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  activityBorder:   { borderBottomWidth: 1, borderBottomColor: BORDER },
  activityAvatar:   { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  activityInitials: { fontSize: 14, fontFamily: Fonts.bold },
  activityInfo:     { flex: 1 },
  activityName:     { fontSize: 14, fontFamily: Fonts.semiBold, color: '#1A1A1A' },
  activitySub:      { fontSize: 12, fontFamily: Fonts.regular, color: MUTED, marginTop: 2 },
  activityStatus:   { fontSize: 13, fontFamily: Fonts.medium, color: MUTED },
  activityAmount:   { fontSize: 15, fontFamily: Fonts.bold, color: PINK },

  // How It Works
  howRow:     { paddingVertical: 20, alignItems: 'center' },
  howBorder:  { borderBottomWidth: 1, borderBottomColor: BORDER },
  howIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: PINK_LIGHT, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  howStep: { fontSize: 15, fontFamily: Fonts.bold, color: '#1A1A1A', marginBottom: 6, textAlign: 'center' },
  howDesc: { fontSize: 13, fontFamily: Fonts.regular, color: MUTED, textAlign: 'center', lineHeight: 19 },

  // FAQ
  faqCard: {
    backgroundColor: CARD_BG, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start',
    shadowColor: '#000', shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
  },
  faqQuestion: { fontSize: 13, fontFamily: Fonts.semiBold, color: '#333', lineHeight: 20, marginBottom: 6 },
  faqLinkRow:  { flexDirection: 'row', alignItems: 'center' },
  faqLink:     { fontSize: 13, fontFamily: Fonts.bold, color: PINK },
});