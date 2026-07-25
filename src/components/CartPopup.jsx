import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, PanResponder,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { hideCartPopup } from '../redux/slice/cartSlice';

const { width: W, height: H } = Dimensions.get( 'window' );
const PINK = '#B6005B';
const PILL_W = W - 32;
const ICON_SIZE = 56;
const MINI_SIZE = 52;
const AUTO_HIDE = 10000;
const EDGE_MARGIN = 12;

const HIDDEN_ON_ROUTES = [ 'CartScreen' ];

function getActiveRouteName( state ) {
  if ( !state || state.index == null || !state.routes ) return null;
  const route = state.routes[ state.index ];
  if ( route.state ) return getActiveRouteName( route.state );
  return route.name;
}

export default function CartPopup() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const visible = useSelector( ( s ) => s.cart.popupVisible );

  const [ routeName, setRouteName ] = useState( () => {
    try {
      return getActiveRouteName( navigation.getState?.() );
    } catch ( e ) {
      return null;
    }
  } );

  useEffect( () => {
    if ( !navigation?.addListener ) return;
    const unsubscribe = navigation.addListener( 'state', ( e ) => {
      setRouteName( getActiveRouteName( e?.data?.state ?? navigation.getState?.() ) );
    } );
    return unsubscribe;
  }, [ navigation ] );

  const isHiddenRoute = HIDDEN_ON_ROUTES.includes( routeName );
  const wasHiddenRoute = useRef( isHiddenRoute );


  const cartItems = useSelector( ( s ) => s.cart.items ?? [] );
  const totalItems = cartItems.reduce( ( sum, i ) => sum + ( i.qty ?? 1 ), 0 );
  const totalPrice = cartItems.reduce( ( sum, i ) => sum + ( parseFloat( i.price ?? 0 ) * ( i.qty ?? 1 ) ), 0 );

  const [ mode, setMode ] = useState( 'pill' );
  const hasPlayedOnce = useRef( false );

  // ── Pill animation values ─────────────────────────────────────────────────────
  const slideY = useRef( new Animated.Value( 100 ) ).current;
  const widthAnim = useRef( new Animated.Value( ICON_SIZE ) ).current;
  const heightAnim = useRef( new Animated.Value( ICON_SIZE ) ).current;
  const radiusAnim = useRef( new Animated.Value( ICON_SIZE / 2 ) ).current;
  const textOp = useRef( new Animated.Value( 0 ) ).current;
  const badgeScale = useRef( new Animated.Value( 0 ) ).current;
  const progressAnim = useRef( new Animated.Value( 1 ) ).current;
  const miniScale = useRef( new Animated.Value( 0 ) ).current;
  const progRef = useRef( null );
  const autoTimer = useRef( null );

  // ── Draggable position for mini icon (default: bottom-right) ─────────────────
  const defaultX = W - MINI_SIZE - EDGE_MARGIN;
  const defaultY = H - MINI_SIZE - 160; // sits above tab bar area
  const pan = useRef( new Animated.ValueXY( { x: defaultX, y: defaultY } ) ).current;
  const lastPos = useRef( { x: defaultX, y: defaultY } );

  const panResponder = useRef(
    PanResponder.create( {
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: ( _, gesture ) =>
        Math.abs( gesture.dx ) > 4 || Math.abs( gesture.dy ) > 4,
      onPanResponderGrant: () => {
        pan.setOffset( { x: lastPos.current.x, y: lastPos.current.y } );
        pan.setValue( { x: 0, y: 0 } );
      },
      onPanResponderMove: Animated.event(
        [ null, { dx: pan.x, dy: pan.y } ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: ( _, gesture ) => {
        pan.flattenOffset();

        let newX = lastPos.current.x + gesture.dx;
        let newY = lastPos.current.y + gesture.dy;

        // clamp within screen bounds
        newX = Math.max( EDGE_MARGIN, Math.min( W - MINI_SIZE - EDGE_MARGIN, newX ) );
        newY = Math.max( 60, Math.min( H - MINI_SIZE - 90, newY ) );

        // snap to nearest horizontal edge (left or right)
        const snapX = newX + MINI_SIZE / 2 < W / 2
          ? EDGE_MARGIN
          : W - MINI_SIZE - EDGE_MARGIN;

        lastPos.current = { x: snapX, y: newY };

        Animated.spring( pan, {
          toValue: { x: snapX, y: newY },
          useNativeDriver: false,
          tension: 80,
          friction: 10,
        } ).start();
      },
    } )
  ).current;

  const wasTap = useRef( true );

  const collapseToMini = useCallback( () => {
    clearTimeout( autoTimer.current );
    progRef.current?.stop();

    Animated.timing( textOp, { toValue: 0, duration: 150, useNativeDriver: true } ).start();

    setTimeout( () => {
      Animated.parallel( [
        Animated.spring( widthAnim, { toValue: ICON_SIZE, useNativeDriver: false, tension: 55, friction: 11 } ),
        Animated.spring( heightAnim, { toValue: ICON_SIZE, useNativeDriver: false, tension: 55, friction: 11 } ),
        Animated.spring( radiusAnim, { toValue: ICON_SIZE / 2, useNativeDriver: false, tension: 55, friction: 11 } ),
      ] ).start( () => {
        // reset to bottom-right default position when switching to mini
        pan.setValue( { x: defaultX, y: defaultY } );
        lastPos.current = { x: defaultX, y: defaultY };
        setMode( 'mini' );
        miniScale.setValue( 1 );
      } );
    }, 120 );
  }, [] );

  const showMiniInstantly = useCallback( () => {
    clearTimeout( autoTimer.current );
    progRef.current?.stop();

    widthAnim.setValue( ICON_SIZE );
    heightAnim.setValue( ICON_SIZE );
    radiusAnim.setValue( ICON_SIZE / 2 );
    textOp.setValue( 0 );
    pan.setValue( lastPos.current );
    miniScale.setValue( 1 );
    badgeScale.setValue( 1 );
    setMode( 'mini' );
    hasPlayedOnce.current = true;
  }, [] );

  useEffect( () => {
    if ( mode === 'mini' && totalItems === 0 ) {
      Animated.timing( miniScale, { toValue: 0, duration: 200, useNativeDriver: true } ).start( () => {
        dispatch( hideCartPopup() );
        setMode( 'pill' );
        hasPlayedOnce.current = false;
      } );
    }
  }, [ totalItems, mode ] );

  useEffect( () => {
    const wasHidden = wasHiddenRoute.current;
    wasHiddenRoute.current = isHiddenRoute;

    if ( isHiddenRoute ) {
      clearTimeout( autoTimer.current );
      progRef.current?.stop();
      return;
    }

    if ( wasHidden && !isHiddenRoute && visible && totalItems > 0 ) {
      showMiniInstantly();
    }
  }, [ isHiddenRoute, visible, totalItems, showMiniInstantly ] );

  useEffect( () => {
    // console.log( ' CartPopup effect fired — visible:', visible, 'mode:', mode, 'hasPlayedOnce:', hasPlayedOnce.current );

    if (!visible || isHiddenRoute) { {
      if ( mode !== 'mini' ) slideY.setValue( 100 );
      return;
    }
     }

    if ( hasPlayedOnce.current ) {
      setMode( 'mini' );
      badgeScale.setValue( 1.3 );
      Animated.spring( badgeScale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 6 } ).start();
      return;
    }

    hasPlayedOnce.current = true;
    setMode( 'pill' );

    slideY.setValue( 100 );
    widthAnim.setValue( ICON_SIZE );
    heightAnim.setValue( ICON_SIZE );
    radiusAnim.setValue( ICON_SIZE / 2 );
    textOp.setValue( 0 );
    badgeScale.setValue( 0 );
    progressAnim.setValue( 1 );

    Animated.spring( slideY, {
      toValue: 0, useNativeDriver: true,
      tension: 60, friction: 10,
    } ).start();

    setTimeout( () => {
      Animated.parallel( [
        Animated.spring( widthAnim, { toValue: PILL_W, useNativeDriver: false, tension: 50, friction: 10 } ),
        Animated.spring( heightAnim, { toValue: 62, useNativeDriver: false, tension: 50, friction: 10 } ),
        Animated.spring( radiusAnim, { toValue: 18, useNativeDriver: false, tension: 50, friction: 10 } ),
      ] ).start();

      setTimeout( () => {
        Animated.timing( textOp, { toValue: 1, duration: 200, useNativeDriver: true } ).start();
      }, 280 );

      autoTimer.current = setTimeout( collapseToMini, AUTO_HIDE );

      progRef.current = Animated.timing( progressAnim, {
        toValue: 0, duration: AUTO_HIDE, useNativeDriver: false,
      } );
      progRef.current.start();

      Animated.spring( badgeScale, {
        toValue: 1, useNativeDriver: true,
        tension: 100, friction: 6, delay: 100,
      } ).start();
    }, 400 );

    return () => clearTimeout( autoTimer.current );
  },  [visible, isHiddenRoute]);

  if (!visible || isHiddenRoute) {
     return null
    };

  const badgeScaleInterp = badgeScale.interpolate( {
    inputRange: [ 0, 0.6, 1 ], outputRange: [ 0, 1.3, 1 ],
  } );

  if ( mode === 'mini' ) {
    return (
      <Animated.View
        style={[
          styles.miniWrapper,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: miniScale },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if ( wasTap.current ) navigation.navigate( 'CartScreen' );
          }}
          onPressIn={() => { wasTap.current = true; }}
          style={styles.miniButton}
        >
          <Icon name="cart" size={24} color="#FFF" />
          <View style={styles.miniBadge}>
            <Text style={styles.miniBadgeText}>{totalItems}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [ { translateY: slideY } ] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          collapseToMini();
          setTimeout( () => navigation.navigate( 'CartScreen' ), 280 );
        }}
      >
        <Animated.View
          style={[
            styles.pill,
            {
              width: widthAnim,
              height: heightAnim,
              borderRadius: radiusAnim,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.timerBar,
              {
                width: progressAnim.interpolate( {
                  inputRange: [ 0, 1 ],
                  outputRange: [ '0%', '100%' ],
                } ),
              },
            ]}
          />

          <View style={styles.iconSection}>
            <Icon name="cart" size={24} color="#FFF" />
            <Animated.View style={[ styles.badge, { transform: [ { scale: badgeScaleInterp } ] } ]}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </Animated.View>
          </View>

          <Animated.View style={[ styles.expandedContent, { opacity: textOp } ]}>
            <View style={styles.leftText}>
              <Text style={styles.freeDeliveryText} numberOfLines={1}>
                Add ₹{Math.max( 0, 199 - totalPrice ).toFixed( 0 )} more to unlock{' '}
                <Text style={styles.freeHighlight}>FREE DELIVERY</Text>
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min( 100, ( totalPrice / 199 ) * 100 )}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.cartChip}>
              <Text style={styles.cartChipText}>CART</Text>
              <Text style={styles.cartChipCount}>{totalItems} ITEM{totalItems !== 1 ? 'S' : ''}</Text>
              <MaterialIcons name="chevron-right" size={16} color={PINK} />
            </View>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create( {
  wrapper: {
    position: 'absolute',
    bottom: 70,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 999,
  },

  pill: {
    backgroundColor: PINK,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    overflow: 'hidden',
    shadowColor: PINK,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 14,
  },

  timerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 2,
  },

  iconSection: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 4,
    flexShrink: 0,
  },
  badge: {
    position: 'absolute',
    top: -6, right: -8,
    minWidth: 18, height: 18,
    borderRadius: 9,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: PINK,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: PINK,
  },

  expandedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 8,
  },

  leftText: { flex: 1 },
  freeDeliveryText: {
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: 5,
  },
  freeHighlight: {
    fontWeight: '800',
    color: '#FFF',
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },

  cartChip: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 0,
  },
  cartChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: PINK,
    letterSpacing: 0.3,
  },
  cartChipCount: {
    fontSize: 9,
    fontWeight: '600',
    color: PINK,
    opacity: 0.8,
  },

  // ── Persistent draggable mini icon ──────────────────────────────────────────
  miniWrapper: {
    position: 'absolute',
    top: 50,
    left: -8,
    right: 16,
    zIndex: 999,
  },
  miniButton: {
    width: MINI_SIZE,
    height: MINI_SIZE,
    borderRadius: MINI_SIZE / 2,
    backgroundColor: PINK,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PINK,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 12,
    position: 'relative',
  },
  miniBadge: {
    position: 'absolute',
    top: -2, right: -1,
    minWidth: 20, height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: PINK,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: PINK,
  },
} );