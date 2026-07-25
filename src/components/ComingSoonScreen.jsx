import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import Fonts from '../constant/Fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const ComingSoonScreen = ({ navigation }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Back button */}
      <Animated.View style={[styles.headerRow, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#1A1C1C" />
        </TouchableOpacity>
      </Animated.View>

      {/* Logo */}
      <Animated.View style={[styles.logoWrap, { opacity: fadeAnim }]}>
        <Image
          source={require('../assets/images/medicto_logo_text.jpg.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <View style={{ marginTop : 90 , }}>
        <View style={{borderRadius : 10 , overflow :'hidden' , backgroundColor :'blue'}}>
         <Image source={require('../assets/images/comming_soon.png')} style={{height : 170 , width : 170 ,  }}/>

        </View>
         
      </View>
    </View>
  );
};

const CARD_SIZE = width * 0.72;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 50,
    alignItems: 'center',
  },

  // Header
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Logo
  logoWrap: {
    alignItems: 'center',
    marginBottom: 48,
    marginTop : 50
  },
  logo: {
    height: 50,
    width: 160,
  },

  // Card
  cardWrap: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 28,
    backgroundColor: '#E91E8C',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // Shadow
    shadowColor: '#E91E8C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },

  // Concentric decorative rings (semi-transparent white)
  ring: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  ringOuter: {
    width: CARD_SIZE * 0.92,
    height: CARD_SIZE * 0.92,
  },
  ringMid: {
    width: CARD_SIZE * 0.76,
    height: CARD_SIZE * 0.76,
  },
  ringInner: {
    width: CARD_SIZE * 0.60,
    height: CARD_SIZE * 0.60,
  },

  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: Fonts.secondary?.bold || 'sans-serif-condensed',
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  soonText: {
    fontSize: 52,
    color: '#FFFFFF',
    fontFamily: Fonts.secondary?.extraBold || 'sans-serif-condensed',
    letterSpacing: 4,
    lineHeight: 54,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 6,
  },
  stayTuned: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: Fonts.medium || 'sans-serif',
    letterSpacing: 2.5,
    marginTop: 8,
    textTransform: 'uppercase',
  },

  // Hint text
  hint: {
    marginTop: 40,
    fontSize: 14,
    color: '#9E8E96',
    fontFamily: Fonts.regular || 'sans-serif',
    textAlign: 'center',
  },
});

export default ComingSoonScreen;