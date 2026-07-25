import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Fonts from '../../constant/Fonts';
import { useNavigation } from '@react-navigation/native';
const PINK = '#E91E63';


export const CuratedBestsellers = ({ onExploreAll }) => {
   
   const navigation = useNavigation();

   const onViewBundle =()=>{
     navigation.navigate('AllMedicinesScreen')
   }

  return (
    <View style={styles.bestsellersContainer}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Curated Bestsellers</Text>
        <TouchableOpacity onPress={onViewBundle}>
          <Text style={styles.seeAll}>EXPLORE ALL</Text>
        </TouchableOpacity>
      </View>

      {/* Banner card */}
      <TouchableOpacity activeOpacity={0.9} style={styles.bestsellerCard} onPress={onViewBundle}>
        {/* Full image */}
        <Image
          source={require('../../assets/images/bestSeller_img.png')}
          style={styles.bestsellerImage}
          resizeMode="cover"
        />

        {/* Gradient-like dark overlay */}
        <View style={styles.bestsellerOverlay} />

        {/* Text content — absolutely placed over image */}
        <View style={styles.bestsellerContent}>
          <Text style={styles.topChoiceLabel}>TOP CHOICE</Text>
          <Text style={styles.bestsellerTitle}>Holistic Wellness{'\n'}Bundle</Text>
          <TouchableOpacity style={styles.viewBundleBtn} onPress={onViewBundle} activeOpacity={0.85}>
            <Text style={styles.viewBundleText}>View Bundle</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bestsellersContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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

  // Card is position: relative so children can be absolute
  bestsellerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 260,    
    borderWidth : .1
    // taller to match design
  },

  // Image fills the entire card
  bestsellerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },

  // Semi-transparent dark layer over image
  bestsellerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },

 
  bestsellerContent: {
    position: 'absolute',
    bottom: 26,
    left: 25,
    right: 18,
  },
  topChoiceLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: Fonts.bold,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  bestsellerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: Fonts.bold,
    lineHeight: 30,
    marginBottom: 16,
  },
  viewBundleBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  viewBundleText: {
    color: '#000000',
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
});