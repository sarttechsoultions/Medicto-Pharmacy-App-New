// src/screens/FAQ/FAQScreen.jsx

import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView,
    StyleSheet, StatusBar, Platform, LayoutAnimation, UIManager,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fonts from '../../constant/Fonts';

const PINK = '#DF1774';

if ( Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental ) {
    UIManager.setLayoutAnimationEnabledExperimental( true );
}

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQS = [
    {
        id: 'faq1',
        question: 'How do I place an order for medicines?',
        answer: 'Simply search for the medicine you need using the search bar, add it to your cart, and proceed to checkout. You can pay online or choose cash on delivery, depending on availability in your area.',
    },
    {
        id: 'faq2',
        question: 'Do I need a prescription to order medicines?',
        answer: 'Yes, for prescription-only medicines, you will be asked to upload a valid prescription from a registered medical practitioner before your order is confirmed.',
    },
    {
        id: 'faq3',
        question: 'How long does delivery usually take?',
        answer: 'Most orders are delivered within 24 to 48 hours depending on your location. Express delivery options may be available in select cities for an additional fee.',
    },
    {
        id: 'faq4',
        question: 'Can I cancel or modify my order after placing it?',
        answer: 'You can cancel or modify your order as long as it hasn\'t been dispatched yet. Go to "My Orders", select the order, and choose the cancel or edit option.',
    },
    {
        id: 'faq5',
        question: 'What payment methods are accepted?',
        answer: 'We accept credit/debit cards, UPI, net banking, popular wallets, and cash on delivery in supported areas.',
    },
    {
        id: 'faq6',
        question: 'Is it safe to order medicines online?',
        answer: 'Yes, all medicines are sourced directly from licensed manufacturers and distributors, and every prescription is verified by our pharmacist team before dispatch.',
    },
    {
        id: 'faq7',
        question: 'How do I track my order?',
        answer: 'Once your order is dispatched, you\'ll receive a tracking link via SMS and in the app under "My Orders" where you can see real-time status updates.',
    },
    {
        id: 'faq8',
        question: 'What is your return and refund policy?',
        answer: 'Due to safety regulations, medicines once delivered cannot be returned unless they arrive damaged, expired, or incorrect. In such cases, contact support within 48 hours for a replacement or refund.',
    },
    {
        id: 'faq9',
        question: 'Can I book lab tests through the app?',
        answer: 'Yes, you can browse available lab tests, select a convenient time slot, and a phlebotomist will visit your home to collect samples.',
    },
    {
        id: 'faq10',
        question: 'How do I contact customer support?',
        answer: 'You can reach our support team via the Help section in the app, through in-app chat, or by calling our helpline number listed on the Contact Us page.',
    },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
const FAQItem = ( { item, isOpen, onToggle } ) => {
    return (
        <View style={s.card}>
            <TouchableOpacity
                style={s.questionRow}
                onPress={onToggle}
                activeOpacity={0.7}
            >
                <Text style={[ s.question, isOpen && s.questionActive ]}>
                    {item.question}
                </Text>
                <View style={[ s.iconWrap, isOpen && s.iconWrapActive ]}>
                    <MaterialIcons
                        name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                        size={20}
                        color={isOpen ? '#FFF' : PINK}
                    />
                </View>
            </TouchableOpacity>

            {isOpen && (
                <View style={s.answerWrap}>
                    <Text style={s.answer}>{item.answer}</Text>
                </View>
            )}
        </View>
    );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function FAQScreen( { navigation } ) {
    const [ openId, setOpenId ] = useState( null );

    const handleToggle = ( id ) => {
        LayoutAnimation.configureNext( LayoutAnimation.Presets.easeInEaseOut );
        setOpenId( ( prev ) => ( prev === id ? null : id ) );
    };

    return (
        <View style={s.screen}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={s.hIcon}>
                    <MaterialIcons name="arrow-back" size={22} color={PINK} />
                </TouchableOpacity>
                <Text style={s.hTitle}>FAQs</Text>
                <View style={s.hIcon} />
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={s.heroTitle}>Frequently Asked Questions</Text>
                <Text style={s.heroSub}>Find quick answers to common questions about orders, delivery, and more.</Text>

                <View style={{ marginTop: 18 }}>
                    {FAQS.map( ( item ) => (
                        <FAQItem
                            key={item.id}
                            item={item}
                            isOpen={openId === item.id}
                            onToggle={() => handleToggle( item.id )}
                        />
                    ) )}
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create( {
    screen: { flex: 1, backgroundColor: '#F9F9F9' },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingTop: Platform.OS === 'ios' ? 54 : 36,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    hIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
    hTitle: { fontSize: 17, fontFamily: Fonts.bold, color: '#1A1A1A' },

    scrollContent: { paddingHorizontal: 16, paddingTop: 18 },

    heroTitle: { fontSize: 22, fontFamily: Fonts.secondary.bold, color: '#1A1A1A', lineHeight: 28 },
    heroSub: { fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#999999', marginTop: 6, lineHeight: 19 },

    card: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        marginBottom: 12,
        overflow: 'hidden',
    },

    questionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 15,
        gap: 12,
    },
    question: {
        flex: 1,
        fontSize: 14.5,
        fontFamily: Fonts.secondary.medium,
        color: '#1A1A1A',
        lineHeight: 20,
    },
    questionActive: {
        color: PINK,
        fontFamily: Fonts.secondary.bold,
    },

    iconWrap: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: '#FFF0F6',
        alignItems: 'center', justifyContent: 'center',
    },
    iconWrapActive: {
        backgroundColor: PINK,
    },

    answerWrap: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
        marginTop: -1,
    },
    answer: {
        fontSize: 13,
        fontFamily: Fonts.secondary.regular,
        color: '#777777',
        lineHeight: 20,
        paddingTop: 12,
    },
} );