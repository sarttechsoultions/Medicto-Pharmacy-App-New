// src/screens/Home/DealsOfTheDay.jsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Image, ActivityIndicator, Pressable
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fonts from '../../constant/Fonts';
import { api } from '../../services/service';
import { useNavigation } from '@react-navigation/native';
import CustomModal from '../../components/CustomModal';
import { useSelector } from 'react-redux';
const PINK = '#E91E63';
import { base_api } from '../../services/service';
const IMAGE_BASE = base_api;
import useAddToCart from '../../components/CustomAddToCart'
import SkeletonCards from '../../components/SkeletonCards'
// ─── Helpers ─────────────────────────────────────────────────────────────────
const toNum = ( v ) => parseFloat( v ) || 0;

const discountedPrice = ( price, discount ) => {
  const p = toNum( price );
  const d = toNum( discount );
  return ( p - ( p * d ) / 100 ).toFixed( 2 );
};

// ─── Countdown Timer ─────────────────────────────────────────────────────────
const CountdownTimer = () => {
  const [ seconds, setSeconds ] = useState( 4 * 3600 + 22 * 60 + 15 );
  useEffect( () => {
    const t = setInterval( () => setSeconds( ( s ) => ( s > 0 ? s - 1 : 0 ) ), 1000 );
    return () => clearInterval( t );
  }, [] );
  const h = String( Math.floor( seconds / 3600 ) ).padStart( 2, '0' );
  const m = String( Math.floor( ( seconds % 3600 ) / 60 ) ).padStart( 2, '0' );
  const s = String( seconds % 60 ).padStart( 2, '0' );
  return (
    <View style={styles.timerBadge}>
      <Icon name="clock-outline" size={13} color="#93000A" />
      <Text style={styles.timerText}>{`${h}:${m}:${s}`}</Text>
    </View>
  );
};

const DealCard = ( { deal, onAddToCart, navigation, setModalVisible } ) => {
  const imageUri = deal.image ? `${IMAGE_BASE}${deal.image}` : null;
  const finalPrice = discountedPrice( deal.price, deal.discount );
  const originalPrice = toNum( deal.price ).toFixed( 2 );
  const hasDiscount = toNum( deal.discount ) > 0;
  const token = useSelector( ( state ) => state.auth.token );
  // console.log('--------------- ' , deal?.id);


  return (
    <Pressable onPress={() => navigation.navigate( 'ProductDetails', { medicineId: deal?.id } )} style={styles.dealCard}>
      {/* Image */}
      <View style={styles.dealImageBox}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.dealImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.dealImagePlaceholder}>
            <Icon name="pill" size={40} color="#888" />
          </View>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{deal.discount}% OFF</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <Text style={styles.dealName} numberOfLines={2}>{deal.name}</Text>

      <View style={styles.dealPriceRow}>
        <Text style={styles.dealPrice}>₹{finalPrice}</Text>
        {hasDiscount && (
          <Text style={styles.dealOriginal}>₹{originalPrice}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.addToCartBtn}
        onPress={() => token ? onAddToCart?.( deal ) : setModalVisible( true )}
        activeOpacity={0.8}
      >
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>
    </Pressable>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const DealsOfTheDay = ( { medicines, setModalVisible, loading } ) => {
  const navigation = useNavigation();
  const deal = medicines.filter(
    ( m ) => m.status?.toLowerCase() === 'in stock'
  );


  const { addToCart } = useAddToCart();

  const handleAddToCart = async ( deal ) => {
    addToCart( deal )
  };

 
  if (loading) {
  return (
    <View style={styles.dealsContainer}>
      {/* Keep the header visible while loading */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Deals of the Day</Text>
      </View>

      <SkeletonCards
        horizontal={true}
        count={4}
        cardWidth={160}
        cardHeight={200}
        imageHeight={100}
        cardBorderRadius={14}
        borderRadius={16}
      />
    </View>
  );
}

  return (
    <View style={styles.dealsContainer}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.sectionTitle}>Deals of the Day</Text>
          <CountdownTimer />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate( 'AllMedicinesScreen' , {title : 'Deals of the day' , items : medicines} )}>
          <Text style={styles.seeAll}>VIEW MORE</Text>
        </TouchableOpacity>
      </View>

      {/* Cards row */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 14 }}
      >
        {deal.map( ( deal ) => (
          <DealCard
            key={String( deal.id )}
            deal={deal}
            onAddToCart={handleAddToCart}
            navigation={navigation}
            setModalVisible={setModalVisible}
          />
        ) )}

        <TouchableOpacity
          style={styles.viewAllCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate( 'AllMedicinesScreen' )}
        >
          <View style={styles.viewAllIconCircle}>
            <Icon name="arrow-right" size={26} color="#fff" />
          </View>
          <Text style={styles.viewAllText}>View All</Text>
          <Text style={styles.viewAllSub}>See all deals</Text>
        </TouchableOpacity>
      </ScrollView>

    </View>
  );
};

// ─── Styles (original — untouched) ───────────────────────────────────────────
const styles = StyleSheet.create( {
  dealsContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.medium,
    color: '#1A1A1A',
  },
  seeAll: {
    color: '#B6005B',
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFDAD6',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  timerText: {
    color: '#93000A',
    fontSize: 10,
    fontFamily: Fonts.bold,
  },

  // Loading / empty
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#AAAAAA',
  },
  emptyRow: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#AAAAAA',
  },

  // Product card
  dealCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 0.1,
    borderColor: '#FFF',
  },
  dealImageBox: {
    position: 'relative',
    height: 130,
    backgroundColor: '#2B2B2B',
  },
  dealImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dealImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: PINK,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: Fonts.medium,
  },
  dealName: {
    fontSize: 12,
    color: '#262626',
    margin: 10,
    marginBottom: 4,
    fontFamily: Fonts.bold,
  },
  dealPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  dealPrice: {
    fontSize: 14,
    color: '#1A1C1C',
    fontFamily: Fonts.bold,
  },
  dealOriginal: {
    fontSize: 10,
    color: '#A3A3A3',
    fontFamily: Fonts.regular,
    textDecorationLine: 'line-through',
  },
  addToCartBtn: {
    marginHorizontal: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2BDC5',
    borderRadius: 12,
    paddingVertical: 7,
    alignItems: 'center',
  },
  addToCartText: {
    color: PINK,
    fontFamily: Fonts.bold,
    fontSize: 13,
  },

  // View All card
  viewAllCard: {
    width: 160,
    backgroundColor: '#FFF0F4',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F5C2D0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  viewAllIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 26,
    backgroundColor: PINK,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PINK,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  viewAllText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: PINK,
  },
  viewAllSub: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#A3A3A3',
  },
} );