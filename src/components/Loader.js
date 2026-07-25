
import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Animated,
  StyleSheet,
  Platform,
  Easing,
  ActivityIndicator
} from 'react-native';
import Image from 'react-native'; // will use require below

const { Image: RNImage } = require('react-native');

const PINK = '#B6005B';

export default function GlobalLoader({ visible = false, text = '' }) {
  // ── Animations ───────────────────────────────────────────────────────────────
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const dotAnim1    = useRef(new Animated.Value(0)).current;
  const dotAnim2    = useRef(new Animated.Value(0)).current;
  const dotAnim3    = useRef(new Animated.Value(0)).current;
  const pulseRing   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    // ── Logo breathe: scale 1 → 1.12 → 1, smooth and slow ──────────────────
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.12,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.75,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // ── Pulse ring expanding outward ─────────────────────────────────────────
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseRing, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseRing, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // ── Bouncing dots (staggered) ────────────────────────────────────────────
    const dot = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: -8, duration: 350, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0,  duration: 350, easing: Easing.in(Easing.ease),  useNativeDriver: true }),
          Animated.delay(600),
        ])
      );

    breathe.start();
    pulse.start();
    dot(dotAnim1, 0).start();
    dot(dotAnim2, 160).start();
    dot(dotAnim3, 320).start();

    return () => {
      breathe.stop();
      pulse.stop();
      dotAnim1.stopAnimation();
      dotAnim2.stopAnimation();
      dotAnim3.stopAnimation();
      pulseRing.stopAnimation();
    };
  }, [visible]);

  const pulseScale   = pulseRing.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const pulseOpacity = pulseRing.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.15, 0] });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={s.backdrop}>
        <View style={s.card}>
          <View style={s.logoWrap}>
            <Animated.View
              style={[
                s.pulseRing,
                {
                  // transform: [{ scale: pulseScale }],
                  // opacity: pulseOpacity,
                },
              ]}
            />

           
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              }}
            >
              <View style={s.logoCircle}>
                {/* <RNImage
                  source={require('../assets/images/medicto_logo_text.jpg.png')}
                  style={s.logoImg}
                  resizeMode="contain"
                /> */}
                <ActivityIndicator size={26} color={"#B6005B"} />
          
              </View>
            </Animated.View>
          </View>

          {/* Bouncing dots */}
          {/* <View style={s.dotsRow}>
            {[dotAnim1, dotAnim2, dotAnim3].map((anim, i) => (
              <Animated.View
                key={i}
                style={[s.dot, { transform: [{ translateY: anim }] }]}
              />
            ))}
          </View> */}

          {/* Optional loading text */}
          {!!text && <Text style={s.loadingText}>{text}</Text>}
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 10, 20, 0.63)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTL: {
    width: 280, height: 280,
    top: -60, left: -80,
    backgroundColor: 'rgba(182, 0, 91, 0.12)',
  },
  blobBR: {
    width: 240, height: 240,
    bottom: -50, right: -60,
    backgroundColor: 'rgba(182, 0, 91, 0.08)',
  },

  // White frosted card
  card: {
    width: 200,
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderRadius: 28,
    backgroundColor: 'transparent',
    alignItems: 'center',
    gap: 20,
    // shadow
    // shadowColor: '#000',
    // shadowOpacity: 0.18,
    // shadowRadius: 24,
    // shadowOffset: { width: 0, height: 12 },
    // elevation: 20,
  },

  // Logo area
  logoWrap: {
    width: 110, height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 90, height: 90,
    borderRadius: 45,
    // backgroundColor: 'rgba(182, 0, 91, 0.18)',
  },
  logoCircle: {
    width: 90, height: 90,
    // borderRadius: 45,
    // backgroundColor: '#FFF0F6',
    // alignItems: 'center',
    // justifyContent: 'center',
    // borderWidth: 2,
    // borderColor: 'rgba(182, 0, 91, 0.15)',
    // overflow: 'hidden',
  },
  logoImg: {
    width: 70,
    height: 40,
  },

  // Bouncing dots
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
    height: 20,
  },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: PINK,
  },

  // Text
  loadingText: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
  },
});