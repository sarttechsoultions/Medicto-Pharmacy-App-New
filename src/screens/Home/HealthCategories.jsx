import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator,
} from 'react-native';
import Fonts from '../../constant/Fonts';
import { useNavigation } from '@react-navigation/native';
import { api, BASE_URL, base_api } from '../../services/service';
import SkeletonCards from '../../components/SkeletonCards';
const getIconUrl = ( path ) =>
  path ? `${BASE_URL ?? ''}/${path.replace( /\\/g, '/' )}` : null;

export const HealthCategories = ( { loading, categories } ) => {
  const navigation = useNavigation();


  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Health Categories</Text>
        <TouchableOpacity onPress={() => navigation.navigate( 'AllCategoriesScreens' )}>
          <Text style={styles.seeAll}>SEE ALL</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <SkeletonCards
          grid={true}
          count={6}
          gridColumns={3}
          gridItemWidth={100}  
          gridIconSize={54}
          gridIconRadius={16}
          gridLabelWidth={60}
          gridLabelHeight={12}
          borderRadius={16}
          speed={1200}
        />
      ) : (
        <View style={styles.categoryGrid}>
          {categories.slice( 0, 6 ).map( ( cat ) => {
            const iconUrl = `${base_api}${cat?.icon}`;
            // console.log('----------------- ', iconUrl);
            
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItem}
                activeOpacity={0.8}
                onPress={() => cat?.is_available ?
                  navigation.navigate( 'SingleCategoryScreen',
                    { id: cat?.id, categoryName: cat.name } )
                  :
                  navigation.navigate( 'ComingSoonScrren',
                    { categoryId: cat.id, categoryName: cat.name } )}
              >
                <View style={styles.categoryIconBox}>
                  {iconUrl ? (
                    <Image
                      source={{ uri: iconUrl }}
                      style={styles.categoryIcon}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.fallbackLetter}>
                      {cat.name?.charAt( 0 ) ?? '?'}
                    </Text>
                  )}
                </View>
                <Text style={styles.categoryLabel} numberOfLines={2}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          } )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create( {
  container: {
    marginHorizontal: 6,
    marginBottom: 16,
    padding: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1A1C1C',
    fontFamily: Fonts.medium,
  },
  seeAll: {
    color: '#B6005B',
    fontSize: 12,
    fontFamily: Fonts.bold,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 16,
    paddingHorizontal: 8,
    elevation: 1,
    boxShadow: '#000'
  },
  categoryIconBox: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 2
  },
  categoryIcon: {
    width: '100%',
    height: '100%',
  },
  fallbackLetter: {
    fontSize: 24,
    color: '#B6005B',
    fontFamily: Fonts.bold,
  },
  categoryLabel: {
    fontSize: 11.5,
    color: '#404040',
    textAlign: 'center',
    fontFamily: Fonts.semiBold,
  },
} );