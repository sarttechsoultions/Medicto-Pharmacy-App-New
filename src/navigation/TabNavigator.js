import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../constant/Fonts';
import HomeScreen from '../screens/Home/HomeScreen';
import CartScreen from '../screens/Profile/ProfileScreen';
import AllCategoriesScreen from '../screens/AllCategories/AllCategories.jsx';
import AllMedicinesScreen from '../screens/Product/AllMedicinesScreen.jsx';
import OrdersScreen from '../screens/Orders/OrderHistory.jsx';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import SearchScreen from '../screens/Search/SearchScreen.jsx'
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { api, BASE_URL, base_api } from '../services/service.js';
import { selectCartItemCount } from '../redux/slice/cartSlice.js';

const Tab = createBottomTabNavigator();


const TopHeader = ( { cartCount = 0, notifCount = 0 } ) => {

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useSelector( ( state ) => state.auth.token );
  const [ defaultAddress, setDefaultAddress ] = useState( null );

  // console.log('toke is ---------- ', token);


  const [ user, setUser ] = useState( [] )
  const [ loading, setLoading ] = useState( true )
  const [ showAddressPopup, setShowAddressPopup ] = useState( false );


  const fetchAddresses = useCallback( async () => {
    setLoading( true )
    try {
      const res = await api.get( '/addresses' );
      const payload = res.data?.address ?? res.data?.data ?? res.data;
      const rawArr = Array.isArray( payload ) ? payload : ( payload?.id ? [ payload ] : [] );

      if ( res.status === 200 && rawArr.length > 0 ) {
        // const list = rawArr.map(normalizeAddress);
        //  console.log('respo ---------------- ', res);


        // Take first address
        const firstAddress = res?.data?.data[ 0 ];
        // console.log('------------- ', firstAddress);


        setDefaultAddress( firstAddress );

      } else {
        setDefaultAddress( null );
      }
    } catch ( error ) {
      console.log( error );


      setDefaultAddress( null );
    } finally {
      // setAddressLoading(false);
      setLoading( false )
    }
  }, [] );

  const getProfile = async () => {
    if ( !token ) {
      setUser( null );
      setLoading( false );
      return;
    }
    try {
      const res = await api.get( '/profile' );
      if ( res.status === 200 ) {
        setUser( res?.data?.data );
      }
    } catch {
      setUser( null );
    } finally {
      setLoading( false );
    }
  };

  useFocusEffect(
    useCallback( () => {
      if ( !token ) {
        setUser( null );
        return;
      }
      getProfile();
      fetchAddresses()
    }, [ token ] )
  );
  useEffect( () => {
    getProfile();
  }, [ token ] );



  return <> <View style={headerStyles.container}>
    <View style={headerStyles.left}>
      <TouchableOpacity onPress={() => navigation.navigate( "UserInfo" )}>
        <Image
          source={
            token && user?.profile_img
              ? { uri: `${base_api}/${user?.profile_img}` }
              : require( '../assets/images/dummy_user_.png' )
          }
          style={headerStyles.avatar}
        />
      </TouchableOpacity>
      <View style={headerStyles.addressBlock}>
        <Text style={headerStyles.deliverLabel}>Welcome</Text>
        <TouchableOpacity
          style={headerStyles.addressRow}
          onPress={() => setShowAddressPopup( prev => !prev )}
        >
          <Text style={headerStyles.addressText} numberOfLines={1}>
            {token && defaultAddress?.address_label
              ? `${defaultAddress?.street_address}, ${defaultAddress?.city}`
              : 'Guest'}
          </Text>

          <MaterialIcons
            name={showAddressPopup ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={18}
            color="#1A1C1C"
          />
        </TouchableOpacity>
      </View>
    </View>

    <View style={headerStyles.right}>
      <TouchableOpacity onPress={()=>navigation.navigate('AllMedicinesScreen' , {isFav : true , title : 'My Favourite'})} style={headerStyles.iconBtn}>
        {/* <Ionicons name="favrioute" size={22} color="#737373" /> */}
        <MaterialIcons
          name={'favorite'}
          size={25}
          color={'#b6005bd1'}
        />

        {/* {notifCount > 0 && (
          <View style={headerStyles.badge}>
            <Text style={headerStyles.badgeText}>{notifCount}</Text>
          </View>
        )} */}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate( 'CartScreen' )} style={headerStyles.iconBtn}>
        <Ionicons name="cart-outline" size={24} color="#DB2777" />
        {token && cartCount > 0 && (
          <View style={headerStyles.badge}>
            <Text style={headerStyles.badgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>


  </View>
    {showAddressPopup && defaultAddress && (
      <View style={headerStyles.addressPopup}>
        <Text style={headerStyles.popupLabel}>
          Delivery Address
        </Text>

        <Text style={headerStyles.popupAddress} numberOfLines={1}>
          {`${defaultAddress?.street_address || ''}, ${defaultAddress?.landmark || ''}, ${defaultAddress?.city || ''}, ${defaultAddress?.state || ''}, ${defaultAddress?.pin_code || ''}`}
        </Text>
      </View>
    )}
  </>
};

const LEFT_INDICES = [ 0, 1 ];
const CENTER_INDEX = 2;
const RIGHT_INDICES = [ 3, 4 ];
const FLOAT_SIZE = 60;

const iconFor = ( routeName, focused ) => {
  switch ( routeName ) {
    case 'Home': return <MaterialIcons name="home" size={20} color={focused ? '#E91E8C' : '#888'} />;
    case 'Product': return <MaterialIcons name="medication" size={20} color={focused ? '#E91E8C' : '#888'} />;
    case 'Orders': return <MaterialIcons name="receipt-long" size={20} color={focused ? '#E91E8C' : '#888'} />;
    case 'Profile': return <MaterialIcons name="person-outline" size={20} color={focused ? '#E91E8C' : '#888'} />;
    default: return null;
  }
};

const CustomTabBar = ( { state, navigation } ) => {

  const renderSideTab = ( index ) => {
    const route = state.routes[ index ];
    const focused = state.index === index;
    return (
      <TouchableOpacity
        key={route.key}
        onPress={() => {
          const event = navigation.emit( { type: 'tabPress', target: route.key, canPreventDefault: true } );
          if ( !focused && !event.defaultPrevented ) navigation.navigate( route.name );
        }}
        activeOpacity={0.8}
        style={tabStyles.tab}
      >
        <View style={[ tabStyles.iconWrap, focused && tabStyles.iconWrapActive ]}>
          {iconFor( route.name, focused )}
          <Text style={[ tabStyles.label, focused && tabStyles.labelActive ]}>
            {route.name.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const searchRoute = state.routes[ CENTER_INDEX ];
  const searchFocused = state.index === CENTER_INDEX;

  return (
    <View style={tabStyles.wrapper}>

      {/* ── Bar row ── */}
      <View style={tabStyles.container}>

        {/* Left: Home + Cart */}
        <View style={tabStyles.sideGroup}>
          {LEFT_INDICES.map( renderSideTab )}
        </View>

        {/* Gap under floating button */}
        <View style={tabStyles.centerPlaceholder} />

        {/* Right: Orders + Profile */}
        <View style={tabStyles.sideGroup}>
          {RIGHT_INDICES.map( renderSideTab )}
        </View>

      </View>

      {/* ── Floating Search button ── */}
      <TouchableOpacity
        onPress={() => {
          const event = navigation.emit( { type: 'tabPress', target: searchRoute.key, canPreventDefault: true } );
          if ( !searchFocused && !event.defaultPrevented ) navigation.navigate( searchRoute.name );
        }}
        activeOpacity={0.85}
        style={[ tabStyles.floatBtn, searchFocused && tabStyles.floatBtnActive ]}
      >
        <MaterialIcons name="search" size={28} color={searchFocused ? '#E91E8C' : '#A3A3A3'} />
        <Text style={[ tabStyles.floatLabel, { color: searchFocused ? '#E91E8C' : '#888' } ]}>
          SEARCH
        </Text>
      </TouchableOpacity>

    </View>
  );
};

// ─── Tab Navigator ────────────────────────────────────────────────────────────
export default function TabNavigator() {
  const cartCount = useSelector( selectCartItemCount );

  return (
    <Tab.Navigator
      tabBar={( props ) => <CustomTabBar {...props} />}
      screenOptions={{
        header: () => <TopHeader cartCount={cartCount} notifCount={1} />,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Product" component={AllMedicinesScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

// ─── Header Styles ────────────────────────────────────────────────────────────
const headerStyles = StyleSheet.create( {
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative', // add this
    zIndex: 100,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF30',
  },
  addressBlock: { flexShrink: 1 },
  deliverLabel: {
    fontSize: 10,
    color: '#1A1C1C',
    fontFamily: Fonts.bold,
    letterSpacing: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addressText: {
    fontSize: 14,
    color: '#1A1C1C',
    fontFamily: Fonts.bold,
    maxWidth: 160,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E91E8C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontFamily: Fonts.bold,
  },
  addressPopup: {
    position: 'absolute',
    top: '100%',
    left: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    zIndex: 9999,
  },

  popupLabel: {
    fontSize: 11,
    color: '#DB2777',
    fontFamily: Fonts.secondary.bold,
    marginBottom: 6,
  },

  popupAddress: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
    fontFamily: Fonts.secondary.medium,
  },
} );

// ─── Tab Bar Styles ───────────────────────────────────────────────────────────
const tabStyles = StyleSheet.create( {
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'visible',
    // paddingBottom is set dynamically via insets.bottom
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    alignItems: 'center',
  },
  sideGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  centerPlaceholder: {
    width: FLOAT_SIZE + 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrap: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#FCE4EC',
    borderRadius: 10,
  },
  label: {
    fontSize: 8,
    fontFamily: Fonts.secondary.medium,
    color: '#888',
    // letterSpacing: 0.5,
  },
  labelActive: {
    color: '#E91E8C',
    fontFamily: Fonts.secondary.medium,
  },
  floatBtn: {
    position: 'absolute',
    top: -( FLOAT_SIZE / 2 ) + 10,
    alignSelf: 'center',
    left: '49%',
    marginLeft: -( FLOAT_SIZE / 2 ),
    width: FLOAT_SIZE + 6,
    height: FLOAT_SIZE,
    borderRadius: FLOAT_SIZE,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    gap: 1,
  },
  floatBtnActive: {
    backgroundColor: '#FFF',
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  floatLabel: {
    fontSize: 9,
    fontFamily: Fonts.secondary.medium,
    letterSpacing: 0.5,
  },
} );