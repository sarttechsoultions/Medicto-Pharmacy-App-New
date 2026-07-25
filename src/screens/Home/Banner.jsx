import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, Dimensions, Platform,
} from 'react-native';
import Fonts from '../../constant/Fonts';
import SkeletonCards from '../../components/SkeletonCards';
import { useNavigation } from '@react-navigation/native';
import Carousel from 'react-native-reanimated-carousel';

const PINK = '#DF1774';
const { width } = Dimensions.get('window');

import { api, base_api } from '../../services/service';
const CARD_MARGIN = 16;

const AUTO_SCROLL_MS = 4500;

const FALLBACK_COLORS = [
  '#DF1774', '#7B2FBE', '#0077B6', '#2D6A4F',
  '#E76F51', '#457B9D', '#6A0572',
];

const BannerCard = ({ item, index, naviagtion }) => {
  const bgColor = item.bgColor ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];

  return (
    <View style={s.itemWrap}>
      <View style={[s.bannerContainer, { backgroundColor: bgColor }]}>
        <View style={s.bannerLeft}>
          <View style={s.premiumBadge}>
            <Text style={s.premiumBadgeText}>
              {item.title?.toUpperCase() ?? 'PREMIUM CARE'}
            </Text>
          </View>

          <Text style={s.bannerTitle} numberOfLines={4}>
            {item.desc?.length > 38 ? item.desc.slice(0, 38) + '..' : item.desc}
          </Text>

          <TouchableOpacity
            style={s.bookNowBtn}
            onPress={() =>
              naviagtion.navigate('AllMedicinesScreen', {
                title: item?.title.slice(0, 20),
                items: item?.medicines,
              })
            }
            activeOpacity={0.85}
          >
            <Text style={[s.bookNowText, { color: bgColor }]}>Book Now</Text>
          </TouchableOpacity>
        </View>

        <View style={s.bannerRight}>
          <Image
            source={
              item.imageUri
                ? { uri: item.imageUri }
                : require('../../assets/images/banner_helth_img.png')
            }
            style={s.bannerImg}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
};

const Dots = ({ total, current }) => {
  if (total <= 1) return null;
  return (
    <View style={s.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[s.dot, i === current && s.dotActive]} />
      ))}
    </View>
  );
};

export const PremiumCareBanner = ({ banners: rawBanners = [], loading = false }) => {
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef(null);
  const naviagtion = useNavigation();

  const banners = useMemo(
    () =>
      rawBanners
        .filter((b) => b.status?.toLowerCase() === 'active')
        .map((b, i) => ({
          id: String(b.id),
          title: b.title,
          desc: b.description,
          imageUri: b?.img ? `${base_api}${b.img}` : null,
          bgColor: FALLBACK_COLORS[i % FALLBACK_COLORS.length],
          medicines: b?.medicines ? b?.medicines : [],
        })),
    [rawBanners]
  );

  if (loading) {
    return (
      <View style={[s.skeletonWrap, { marginLeft: 4 }]}>
        <SkeletonCards
          horizontal={true}
          count={1}
          cardWidth={320}
          cardHeight={260}
          cardBorderRadius={14}
          borderRadius={16}
          borderWidth={1}
          imageHeight={150}
        />
      </View>
    );
  }

  if (banners.length === 0) return null;

  if (banners.length === 1) {
    return <BannerCard item={banners[0]} index={0} naviagtion={naviagtion} />;
  }

  return (
    <View>
      <Carousel
        ref={carouselRef}
        width={width}
        height={260}
        data={banners}
        loop={true}                       // ← true infinite loop, no jump
        autoPlay={true}
        autoPlayInterval={AUTO_SCROLL_MS}
        scrollAnimationDuration={700}
        pagingEnabled
        onSnapToItem={(index) => setCurrent(index)}
        renderItem={({ item, index }) => (
          <BannerCard item={item} index={index} naviagtion={naviagtion} />
        )}
      />
      <Dots total={banners.length} current={current} />
    </View>
  );
};

const s = StyleSheet.create({
  skeletonWrap: {},

  itemWrap: {
    width,
    paddingHorizontal: CARD_MARGIN,
  },

  bannerContainer: {
    flexDirection: 'row',
    borderRadius: 24,
    // marginVertical: 8,
    overflow: 'hidden',
    alignItems: 'center',
    height: 260,
    backgroundCOlor :'red'
  },

  bannerLeft: {
    flex: 1,
    gap: 10,
    paddingVertical: 5,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  premiumBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: Fonts.bold,
    letterSpacing: 0.8,
    lineHeight: 15,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: Fonts.secondary.bold,
    lineHeight: 28,
  },
  bookNowBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  bookNowText: {
    fontFamily: Fonts.secondary.medium,
    fontSize: 13,
    marginTop: Platform.OS === 'ios' ? 3 : 3,
  },

  bannerRight: {
    height: '100%',
    width: '45%',
  },
  bannerImg: {
    width: '100%',
    height: '100%',
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 4,
  },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: '#DDDDDD',
  },
  dotActive: {
    width: 18,
    backgroundColor: PINK,
    borderRadius: 3,
  },
});