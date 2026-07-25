import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../../constant/Fonts';
import { useNavigation } from '@react-navigation/native'; 
const PINK = '#E91E63';
 
const COLLECTIONS = [
  {
    id: '1',
    title: 'Immunity Boosters',
    subtitle: 'Science-backed supplements\nfor daily strength.',
    bg: '#F2D9E7',
    image: require('../../assets/images/hard_work_img.png'),
    imagePlaceholderIcon: 'shield-plus-outline',
    iconColor: '#E91E63',
    titleColor :'#705D69',
    subtitleColor :'#705D69B2',
    iconBg: '#1A1A1A',   // dark square bg like in screenshot
  },
  {
    id: '2',
    title: 'Baby Care\nEssentials',
    subtitle: 'Dermatologically tested gentle\nproducts.',
    bg: '#FDF2F8',
    image: require('../../assets/images/baby_care.png'),
    imagePlaceholderIcon: 'baby-face-outline',
    iconColor: '#1E88E5',
    titleColor :'#831843',
    subtitleColor :'#9D174D99',
    iconBg: 'transparent',
  },
];
 
const BRANDS = ['HEALTH+', 'GLOW_LAB'];
 
export const CollectionsAndBrands = ({ onChat }) => {

   const navigation = useNavigation();

  return (
   <View style={styles.collectionsContainer}>
 
      {COLLECTIONS.map((col) => (
        <TouchableOpacity
          key={col.id}
          activeOpacity={0.88}
          style={[styles.collectionCard, { backgroundColor: col.bg }]}
        >
          <View style={styles.collectionTextBox}>
            <Text style={[styles.collectionTitle , {color : col.titleColor}]}>{col.title}</Text>
            <Text style={[styles.collectionSubtitle  , {color : col.subtitleColor}]}>{col.subtitle}</Text>
            <TouchableOpacity onPress={()=> navigation.navigate('AllMedicinesScreen')} style={styles.shopCollectionRow}>
              <Text style={styles.shopCollectionText}>SHOP COLLECTION</Text>
              <Text style={styles.shopCollectionText}>  →</Text>
            </TouchableOpacity>
          </View>
 
          {/* Right: image / icon */}
          <View style={styles.collectionImageBox}>
            {col.image ? (
              <Image source={col.image} style={styles.collectionImage} resizeMode="contain" />
            ) : (
              <View style={[
                styles.collectionIconWrap,
                { backgroundColor: col.iconBg },
                col.iconBg === 'transparent' && { backgroundColor: 'transparent' },
              ]}>
                <Icon name={col.imagePlaceholderIcon} size={46} color={col.iconColor} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
 
      {/* ── Popular Brands ── */}
      <Text style={styles.brandsTitle}>Popular Brands</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.brandsRow}
      >
        {BRANDS.map((b) => (
          <TouchableOpacity key={b} style={styles.brandChip}>
            <Text style={styles.brandChipText}>{b}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
 
    </View>
  );
};
 

const styles = StyleSheet.create({
 
 
  collectionsContainer: {
    marginHorizontal: 16,
    marginBottom: 70, 
    gap: 14,
  },
 
  
  collectionCard: {
    flexDirection: 'row',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 130,
  },
  collectionTextBox: {
    flex: 1,
    paddingRight: 10,
    gap: 5,
  },
  collectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.secondary.bold,
    lineHeight: 24,
  },
  collectionSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.secondary.regular,
    color: '#555555',
    lineHeight: 18,
  },
  shopCollectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  shopCollectionText: {
    color: PINK,
    fontSize: 11,
    fontFamily: Fonts.bold,
    letterSpacing: 0.6,
  },
 
  collectionImageBox: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius : 13,
    overflow :'hidden'
  },
  collectionImage: {
    width: 90,
    height: 90,
     borderRadius : 13,
  },
  collectionIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
 

  brandsTitle: {
    fontSize: 20,
    fontFamily: Fonts.secondary.medium,
    color: '#1A1A1A',
    marginTop: 8,
  },
  brandsRow: {
    gap: 10,
    paddingBottom: 4,
  },
  brandChip: {
    borderWidth: 1,
    borderColor: '#FAFAFA',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation : 1,
    shadowColor : '#0000000D'
  },
  brandChipText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#D4D4D4',
    letterSpacing: 0.4,
  },
 
 
});
 