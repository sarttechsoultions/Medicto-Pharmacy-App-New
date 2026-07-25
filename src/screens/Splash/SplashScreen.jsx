import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image
} from 'react-native';
import Fonts from '../../constant/Fonts';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
const SplashScreen = ({  }) => {
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslateY = useRef(new Animated.Value(20)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current; // 0 → 100
   const token = useSelector(
    (state) => state.auth.token
  );

  // console.log('token is-------------- ', token);
  
  const navigation = useNavigation();

  useEffect(() => {
    // Icon pop-in
    Animated.parallel([
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Brand fade up
    Animated.parallel([
      Animated.timing(brandOpacity, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(brandTranslateY, {
        toValue: 0,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Bottom fade in
    Animated.timing(bottomOpacity, {
      toValue: 1,
      duration: 500,
      delay: 500,
      useNativeDriver: false, // must be false since progressWidth uses non-native
    }).start();

    // Progress bar fills over 3s, then navigate
    Animated.timing(progressWidth, {
      toValue: 100,
      duration: 3000,
      useNativeDriver: false,
    }).start(() => {
      if(!token){

        navigation?.navigate('OnBoardingScrren');
      }else{
        navigation?.navigate('Home');
        
      }
    });

    return () => {
      progressWidth.stopAnimation();
    };

  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff5f7" barStyle="dark-content" />

      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              opacity: iconOpacity,
              transform: [{ scale: iconScale }],
            },
          ]}
        >
          <Image source={require('../../assets/Medical_Logo.png')} style={{ height: 110, width: 110 }} />
        </Animated.View>

        <Animated.View
          style={[
            styles.brandBlock,
            {
              opacity: brandOpacity,
              transform: [{ translateY: brandTranslateY }],
            },
          ]}
        >
          <Text style={styles.brandName}>MEDICTO PHARMACY</Text>
          <Text style={styles.brandTagline}>
            Your premium pharmaceutical and{'\n'}medical companion.
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.bottomSection, { opacity: bottomOpacity }]}>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <Text style={styles.initLabel}>INITIALIZING PORTAL</Text>
        <Text style={styles.footerText}>CLINICAL CURATOR © 2026 • TRUSTED EXCELLENCE</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 25,
  },
  iconWrapper: {
    width: 110,
    height: 110,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B6005B',
    shadowOffset: { width: 7, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 20,
  },
  brandBlock: {
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  brandName: {
    fontFamily: Fonts.secondary.bold,
    fontSize: 24,
    letterSpacing: 1,
    color: '#BB035E',
    textAlign: 'center',
    marginBottom : 7
  },
  brandTagline: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: '#6C5964',
    textAlign: 'center',
    lineHeight: 23,
  },
  bottomSection: {
    alignItems: 'center',
    gap: 8,
  },
  // Progress bar
  progressTrack: {
    width: 45,
    height: 2.5,
    backgroundColor: '#EEEEEE',
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom : 20
  },
  progressFill: {
    height: 2.5,
    backgroundColor: '#B6005B',
    borderRadius: 50,
  },
  initLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    letterSpacing: 2.5,
    color: '#6C5964',
    marginBottom: 40,
  },
  footerText: {
    fontSize: 10,
    color: '#A3A3A3',
    letterSpacing: 1,
    marginTop: 2,
    fontFamily: Fonts.medium,
  },
});

export default SplashScreen;