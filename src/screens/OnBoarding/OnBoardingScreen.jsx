import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import Fonts from '../../constant/Fonts';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get( 'window' );

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIconsNext from 'react-native-vector-icons/MaterialCommunityIcons';
import CertificateIcon from 'react-native-vector-icons/MaterialIcons';
import Compasicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const slides = [
  {
    id: '0',
    type: 'zero',
    topLabel: 'Health Concierge',
    topSubLabel: 'Guided by expertise. Built for your health',
    image: require( '../../assets/images/onboarding_founder.png' ),
    founderCard: {
      tag: 'FOUNDER & CEO',
      name: 'Mr. Manish Kumar Gupta',
      roles: 'Pharmacist | Health Innovator | Entrepreneur',
      mission:
        'Our mission is to make authentic medicines accessible to everyone through verified pharmacies you can trust.',
    },
  },
  {
    id: '1',
    title: 'Your Health,',
    titleHighlight: 'Our Priority',
    subtitle: 'Order medicines and book lab tests\nfrom the comfort of your home.',
    image: require( '../../assets/images/onboarding_1.png' ),
    imageBg: '#E8B4B8',
    badge: {
      icon: <MaterialCommunityIcons name="truck-outline" color="#FFFFFF" size={24} />,
      label: 'STATUS',
      value: 'Arriving in 15m',
    },
    features: [
      { icon: <CertificateIcon name="verified" color="#B6005B" size={23} />, label: 'Verified Doctors' },
      { icon: <Compasicons name="compass-sharp" color="#B6005B" size={23} />, label: '15min Delivery' },
    ],
    type: 'first',
  },
  {
    id: '2',
    topLabel: 'Health Concierge',
    title: 'Verified\nPharmacies',
    subtitle: 'Get authentic medicines from licensed\npharmacies near you.',
    image: require( '../../assets/images/onboarding_2.png' ),
    imageBg: '#5BBFBF',
    badge: {
      icon: (
        <Image
          source={require( '../../assets/images/badge_icon.png' )}
          style={{ height: 16, width: 13 }}
        />
      ),
      label: 'STATUS',
      value: 'Licensed Partner',
    },
    storeCard: { icon: null, name: 'City Center Meds', rating: '4.9 (2.1k reviews)' },
    type: 'middle',
  },
  // ── Slide 3 ────────────────────────────────────────────────────────────────
  {
    id: '3',
    topLabel: 'Health Concierge',
    title: 'Fast &\nSecure\nDelivery',
    subtitle: 'Experience lightning-fast\ndelivery at your doorstep.',
    image: require( '../../assets/images/onboarding_3.png' ),
    imageBg: '#FFFFFF',
    badge: {
      icon: <MaterialIcons name="delivery-dining" color="#FFFFFF" size={24} />,
      label: 'STATUS',
      value: 'Arriving in 12 mins',
    },
    type: 'last',
  },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

const Logo = () => (
  <View style={styles.logoRow}>
    <Image
      source={require( '../../assets/images/medicto_logo_text.jpg.png' )}
      style={{ height: 25, width: 80 }}
    />
  </View>
);

const Dots = ( { total, current } ) => (
  <View style={styles.dotsRow}>
    {Array.from( { length: total } ).map( ( _, i ) => (
      <View
        key={i}
        style={[ styles.dot, i === current ? styles.dotActive : styles.dotInactive ]}
      />
    ) )}
  </View>
);

// ─── SlideZero (new intro / founder slide) ────────────────────────────────────

const SlideZero = ( { slide, onNext, onSkip, current, total } ) => (
  <View style={[ styles.slideContainer, { backgroundColor: '#FFFFFF' } ]}>
    <StatusBar backgroundColor="#fff" barStyle="dark-content" />

    {/* Header */}
    <View style={styles.header}>
      <Logo />
      <TouchableOpacity onPress={onSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>

    <Text style={styles.topLabel}>{slide.topLabel}</Text>
    <Text style={[ styles.zeroSubLabel, { color: '#6C5964', marginTop: -10, marginBottom: 12 } ]}>{slide.topSubLabel}</Text>


    <View style={styles.zeroImageCard}>
      {slide.image ? (
        <Image source={slide.image} style={styles.zeroImage} />
      ) : (
        <View style={styles.zeroImagePlaceholder}>
          <Text style={{ fontSize: 64 }}>👨‍⚕️</Text>
        </View>
      )}
    </View>

    <View style={styles.founderCard}>
      <Text style={styles.founderTag}>{slide.founderCard.tag}</Text>
      <Text style={styles.founderName}>{slide.founderCard.name}</Text>
      <Text style={[ styles.founderRoles, { color: '#6C5964', fontSize: 12 } ]}>{slide.founderCard.roles}</Text>
      <Text style={[ styles.founderMission, { color: '#6C5964' } ]}>{slide.founderCard.mission}</Text>
    </View>

    <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
      <Dots total={total} current={current} />
    </View>

    <TouchableOpacity style={[ styles.nextBtn, { marginTop: -15 } ]} onPress={onNext}>
      <Text style={[ styles.nextBtnText, { fontSize: 16, fontFamily: Fonts.secondary.medium } ]}>
        Next
      </Text>
    </TouchableOpacity>

    {/* <Text style={styles.stepLabel}>Step 1 of {total}</Text> */}
  </View>
);


const SlideFirst = ( { slide, onNext, onSkip, current, total } ) => (
  <View style={styles.slideContainer}>
    <StatusBar backgroundColor="#fff" barStyle="dark-content" />

    <View style={styles.header}>
      <Logo />
      <TouchableOpacity onPress={onSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.titleBlock}>
      <Text style={styles.titleBold}>
        {slide.title}{' '}
        <Text style={styles.titlePink}>{slide.titleHighlight}</Text>
      </Text>
      <Text style={styles.subtitle}>{slide.subtitle}</Text>
    </View>

    <View style={styles.featuresRow}>
      {slide.features.map( ( f, i ) => (
        <View key={i} style={styles.featureItem}>
          {f?.icon && f?.icon}
          <Text style={styles.featureLabel}>{f.label}</Text>
        </View>
      ) )}
    </View>

    <View style={{ height: '50%', paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 20, elevation: 5, paddingVertical: 15 }}>
      <View style={styles.imageCard}>
        {slide.image ? (
          <Image source={slide.image} style={[ styles.imageFill, { width: '80%' } ]} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>💊</Text>
          </View>
        )}
        <View style={[ styles.badge, { paddingVertical: 10, paddingHorizontal: 16 } ]}>
          <View style={[ styles.badgeIconWrap, { backgroundColor: '#B6005B' } ]}>
            {slide?.badge?.icon && slide?.badge?.icon}
          </View>
          <View>
            <Text style={styles.badgeLabel}>{slide?.badge?.label}</Text>
            <Text style={styles.badgeValue}>{slide?.badge?.value}</Text>
          </View>
        </View>
      </View>
    </View>
    <View style={{ height: 5 }} />
    <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
    <Dots total={total} current={current} />
   </View>
    <TouchableOpacity style={[ styles.nextBtn, { marginTop: -10 } ]} onPress={onNext}>
      <Text style={styles.nextBtnText}>Next </Text>
      <MaterialCommunityIconsNext
        name="arrow-right"
        style={{ marginTop: 2 }}
        size={23}
        color={'#FFFFFF'}
      />
    </TouchableOpacity>

  </View>
);

// ─── Slide 2 ──────────────────────────────────────────────────────────────────

const SlideMiddle = ( { slide, onNext, onSkip, current, total } ) => (
  <View style={[ styles.slideContainer, { backgroundColor: '#F5F5F5' } ]}>
    <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />

    <View style={styles.header}>
      <Logo />
      <TouchableOpacity onPress={onSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>

    <Text style={styles.topLabel}>{slide.topLabel}</Text>

    <View style={[ styles.imageCardMiddle, { backgroundColor: slide.imageBg } ]}>
      <View style={styles.storeChip}>
        <View style={styles.storeIconWrap}>
          <Image source={require( '../../assets/images/hospital_Icon.png' )} style={{ height: 16, width: 16 }} />
        </View>
        <View>
          <Text style={styles.storeName}>{slide.storeCard.name}</Text>
          <Text style={styles.storeRating}>⭐ {slide.storeCard.rating}</Text>
        </View>
      </View>

      {slide.image ? (
        <Image source={slide.image} style={styles.imageFillMiddle} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholderMiddle}>
          <Text style={styles.placeholderEmoji}>👩‍⚕️</Text>
        </View>
      )}

      <View style={styles.badge}>
        <View style={[ styles.badgeIconWrap, { backgroundColor: 'rgba(61, 226, 75, 0.17)' } ]}>
          <Text style={styles.badgeIcon}>{slide?.badge?.icon}</Text>
        </View>
        <View>
          <Text style={styles.badgeLabel}>{slide?.badge?.label}</Text>
          <Text style={styles.badgeValue}>{slide?.badge?.value}</Text>
        </View>
      </View>
    </View>

    <View style={styles.titleBlockCenter}>
      <Text style={styles.titleBoldCenter}>{slide.title}</Text>
      <Text style={styles.subtitleCenter}>{slide.subtitle}</Text>
    </View>
   
   <View style={{height : 45}}/>
    <View style={{ justifyContent: 'center', alignItems: 'center' , marginTop : 10 }}>
      <Dots total={total} current={current} />
    </View>

    <TouchableOpacity style={[ styles.nextBtn, { marginTop: 0 } ]} onPress={onNext}>
      <Text style={[ styles.nextBtnText, { fontSize: 16, fontFamily: Fonts.secondary.medium } ]}>Next</Text>
    </TouchableOpacity>

    {/* <Text style={styles.stepLabel}>Step {current + 1} of {total}</Text> */}
  </View>
);

// ─── Slide 3 ──────────────────────────────────────────────────────────────────

const SlideLast = ( { slide, onGetStarted, current, total } ) => (
  <View style={[ styles.slideContainer, { backgroundColor: '#F5F5F5' } ]}>
    <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />

    <View style={[ styles.header, { justifyContent: 'center' } ]}>
      <Logo />
    </View>

    <Text style={styles.topLabel}>{slide?.topLabel}</Text>

    <View style={[ styles.imageCardMiddle, { backgroundColor: slide.imageBg, borderWidth: 1, borderColor: '#EEE' } ]}>
      {slide.image && (
        <Image source={slide.image} style={[ styles.imageFillMiddle, { height: '100%', width: '80%' } ]} resizeMode="cover" />
      )}
      <View style={[ styles.badge, { backgroundColor: '#ffffffee', bottom: 30, right: 45, paddingVertical: 14, paddingHorizontal: 20 } ]}>
        <View style={[ styles.badgeIconWrap, { backgroundColor: '#E91E8C' } ]}>
          <Text style={styles.badgeIcon}>{slide.badge.icon}</Text>
        </View>
        <View>
          <Text style={styles.badgeLabel}>{slide.badge.label}</Text>
          <Text style={[ styles.badgeValue, { color: '#E91E8C', fontSize: 13 } ]}>{slide.badge.value}</Text>
        </View>
      </View>
    </View>

    <View style={styles.titleBlockCenter}>
      <Text style={styles.titleBoldCenter}>{slide.title}</Text>
      <Text style={[ styles.subtitleCenter, { fontSize: 18, color: '#6C5964' } ]}>{slide.subtitle}</Text>
    </View>

    <View style={{ alignItems: 'center', marginTop: 5 }}>
      <Dots total={total} current={current} />
    </View>

    <TouchableOpacity style={[ styles.nextBtn, { marginTop: 16, marginBottom: 10 } ]} onPress={onGetStarted}>
      <Text style={styles.nextBtnText}>Get Started</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────

const OnboardingScreen = ( { navigation } ) => {
  const [ currentIndex, setCurrentIndex ] = useState( 0 );
  const flatListRef = useRef( null );

  const goToNext = () => {
    if ( currentIndex < slides.length - 1 ) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex( { index: next, animated: true } );
      setCurrentIndex( next );
    }
  };

  const handleSkip = () => navigation?.navigate( 'Login', { isOnboarding: true } );
  const handleGetStarted = () => navigation?.navigate( 'Login', { isOnboarding: true } );


  useFocusEffect(
  React.useCallback(() => {
    const onBackPress = () => {
      BackHandler.exitApp();
      return true;
    };

    // ✅ new way — use the subscription returned by addEventListener
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    // ✅ cleanup using subscription.remove() instead of removeEventListener
    return () => subscription.remove();
  }, [])
);

  const renderSlide = ( { item, index } ) => {
    if ( item.type === 'zero' ) {
      return (
        <SlideZero
          slide={item}
          onNext={goToNext}
          onSkip={handleSkip}
          current={index}
          total={slides.length}
        />
      );
    }
    if ( item.type === 'first' ) {
      return (
        <SlideFirst
          slide={item}
          onNext={goToNext}
          onSkip={handleSkip}
          current={index}
          total={slides.length}
        />
      );
    }
    if ( item.type === 'middle' ) {
      return (
        <SlideMiddle
          slide={item}
          onNext={goToNext}
          onSkip={handleSkip}
          current={index}
          total={slides.length}
        />
      );
    }
    return (
      <SlideLast
        slide={item}
        onGetStarted={handleGetStarted}
        current={index}
        total={slides.length}
      />
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={slides}
      renderItem={renderSlide}
      keyExtractor={( item ) => item.id}
      horizontal
      pagingEnabled
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={( e ) => {
        const idx = Math.round( e.nativeEvent.contentOffset.x / width );
        setCurrentIndex( idx );
      }}
    />
  );
};

const styles = StyleSheet.create( {
  slideContainer: {
    width,
    minHeight: height,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 30,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skipText: {
    fontSize: 14,
    color: '#6C5964',
    fontFamily: Fonts.semiBold,
  },

  // ── SlideZero styles ────────────────────────────────────────────────────────
  zeroSubLabel: {
    fontSize: 14,
    color: '#6C5964',
    textAlign: 'center',
    marginTop: -14,
    marginBottom: 20,
    fontFamily: Fonts.regular,
  },
  zeroImageCard: {
    width: '100%',
    height: 310,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    // backgroundColor: '#f0f0f0',
  },
  zeroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    resizeMode: 'stretch',
    transform: [ { translateY: 3 } ],
  },
  zeroImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCE4EC',
  },
  founderCard: {
    backgroundColor: '#FFF0F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  founderTag: {
    fontSize: 10,
    color: '#6C5964',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: Fonts.bold,
    marginBottom: 2,
  },
  founderName: {
    fontSize: 15,
    color: '#B6005B',
    fontFamily: Fonts.secondary.bold,
    marginBottom: 2,
  },
  founderRoles: {
    fontSize: 13,
    color: '#1A1C1C',
    fontFamily: Fonts.medium,
    marginBottom: 6,
  },
  founderMission: {
    fontSize: 13,
    color: '#6C5964',
    lineHeight: 20,
    fontFamily: Fonts.regular,
  },

  // ── Shared ──────────────────────────────────────────────────────────────────
  topLabel: {
    fontSize: 20,
    color: '#B6005B',
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: Fonts.secondary.bold,
  },
  titleBlock: {
    marginBottom: 20,
  },
  titleBold: {
    fontSize: 24,
    color: '#1A1C1C',
    lineHeight: 34,
    marginBottom: 10,
    fontFamily: Fonts.secondary.bold,
    textAlign: 'center',
  },
  titlePink: {
    color: '#B6005B',
  },
  subtitle: {
    fontSize: 17,
    color: '#6C5964',
    lineHeight: 22,
    fontFamily: Fonts.medium,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
    alignItems: 'center',
  },
  dot: {
    borderRadius: 4,
    height: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#B6005B',
  },
  dotInactive: {
    width: 5,
    height: 4,
    borderRadius: 50,
    backgroundColor: '#DDD',
  },
  nextBtn: {
    backgroundColor: '#B6005B',
    borderRadius: 18,
    paddingVertical: 14,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#FFF',
    fontSize: 18,
    letterSpacing: 0.3,
    fontFamily: Fonts.bold,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
    borderTopWidth: 1,
    paddingTop: 25,
    borderTopColor: '#e8e8e8',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureLabel: {
    fontSize: 13,
    color: '#6C5964',
    fontFamily: Fonts.semiBold,
  },
  imageCard: {
    borderRadius: 24,
    height: '100%',
    overflow: 'visible',
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'relative',
  },
  imageFill: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 72,
  },
  badge: {
    position: 'absolute',
    bottom: 30,
    right: 3,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffd5',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  badgeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FCE4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 18,
  },
  badgeLabel: {
    fontSize: 10,
    color: '#6C5964',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: Fonts.bold,
  },
  badgeValue: {
    fontSize: 12,
    fontFamily: Fonts.secondary.semiBold,
    color: '#1A1C1C',
  },
  imageCardMiddle: {
    borderRadius: 24,
    height: 280,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 32,
  },
  imageFillMiddle: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  imagePlaceholderMiddle: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeChip: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 7,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  storeIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#b6005b17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 11,
    color: '#1A1C1C',
    fontFamily: Fonts.bold,
  },
  storeRating: {
    fontSize: 10,
    color: '#6C5964',
    fontFamily: Fonts.medium,
  },
  titleBlockCenter: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleBoldCenter: {
    fontSize: 30,
    color: '#1A1C1C',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 10,
    fontFamily: Fonts.secondary.extraBold,
  },
  subtitleCenter: {
    fontSize: 14,
    color: '#6C5964',
    textAlign: 'center',
    lineHeight: 21,
    fontFamily: Fonts.regular,
  },
  stepLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6C5964',
    marginTop: -8,
    fontFamily: Fonts.medium,
  },
} );

export default OnboardingScreen;