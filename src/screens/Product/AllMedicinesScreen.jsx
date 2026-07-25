import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Platform, Image,
  RefreshControl, FlatList, ActivityIndicator,
} from 'react-native';
import { useRef } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fonts from '../../constant/Fonts';
import { api, BASE_URL, base_api } from '../../services/service';
import useAddToCart from '../../components/CustomAddToCart';
import CustomModal from '../../components/CustomModal';
import SkeletonCards from '../../components/SkeletonCards';
import FilterDrawer from '../../components/FIlterDrawer';
const PINK = '#B6005B';

const RECOMMENDATIONS = [
  { id: 'r1', title: 'Immune\nBoost Pack', subtitle: 'Save 15% on bundle', btnLabel: 'Shop Bundle', btnStyle: 'outline', bg: '#F2D9E7' },
  { id: 'r2', title: 'Expert\nAdvice', subtitle: 'Chat with a pharmacist', btnLabel: 'Connect Now', btnStyle: 'solid', bg: '#F3F3F4' },
];

const discountedPrice = ( price, discount ) => {
  const p = Number( price ) || 0;
  const d = Number( discount ) || 0;
  return Number( ( p - ( p * d ) / 100 ).toFixed( 2 ) );
};

const getImageUrl = ( image ) => {
  // console.log('image -------- ', image);

  if ( !image ) return null;
  if ( image.startsWith( 'http' ) ) return image;
  return `${base_api}${image}`;
};

const ProductCard = ( { item, onAddToCart, navigation } ) => {
   const inStock = Number(item.quantity) > 0;
  const finalPrice = discountedPrice( item.price, item.discount );
  const rawPrice = Number( item.price ) || 0;
  const imageUri = getImageUrl( item.image );
  // console.log('---------- ', imageUri);

  const hasBadge = item.is_bestseller || item.badge;
  const badgeLabel = item.badge || ( item.is_bestseller ? 'BEST SELLER' : null );

  return (
    <TouchableOpacity
      style={[ s.card, !inStock && s.cardOOS ]}
      onPress={() => !inStock ? null : navigation.navigate( 'ProductDetails', { medicineId: item?.id } )}
      activeOpacity={0.92}
    >
      <View style={s.cardImgWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={s.cardImg} resizeMode="cover" />
        ) : (
          <View style={s.cardImgPlaceholder}>
            <Icon name="pill-off" size={40} color="rgba(255,255,255,0.2)" />
          </View>
        )}

        {hasBadge && inStock && (
          <View style={s.cardBadge}>
            <Text style={s.cardBadgeText}>{badgeLabel}</Text>
          </View>
        )}

        {!inStock && (
          <View style={s.oosOverlay}>
            <Text style={s.oosOverlayText}>Out of Stock</Text>
          </View>
        )}

        {Number( item.discount ) > 0 && inStock && (
          <View style={s.discountPill}>
            <Text style={s.discountPillText}>{item.discount}% OFF</Text>
          </View>
        )}
      </View>

      <View style={s.cardBody}>
        <Text style={s.cardBrand} numberOfLines={1}>
          {( item.manufacturer || 'GENERIC' ).toUpperCase()}
        </Text>
        <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>

        <View style={s.cardPriceRow}>
          <Text style={[ s.cardPrice, !inStock && s.cardPriceMuted ]}>
            ₹{finalPrice.toFixed( 2 )}
          </Text>
          {Number( item.discount ) > 0 && inStock && (
            <Text style={s.cardOriginal}>₹{rawPrice.toFixed( 2 )}</Text>
          )}
        </View>

        {inStock ? (
          <TouchableOpacity
            style={s.cartBtn}
            activeOpacity={0.85}
            onPress={() => onAddToCart( item )}
          >
            <Text style={s.cartBtnText}>Add to Cart</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.cartBtnDisabled}>
            <Text style={s.cartBtnDisabledText}>Out of Stock</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const RecommendCard = ( { item } ) => (
  <View style={[ s.recCard, { backgroundColor: item.bg } ]}>
    <Text style={s.recTitle}>{item.title}</Text>
    <Text style={s.recSub}>{item.subtitle}</Text>
    <TouchableOpacity
      style={[ s.recBtn, item.btnStyle === 'solid' ? s.recBtnSolid : s.recBtnOutline ]}
      activeOpacity={0.85}
    >
      <Text style={[ s.recBtnText, item.btnStyle === 'solid' ? s.recBtnTextSolid : s.recBtnTextOutline ]}>
        {item.btnLabel}
      </Text>
    </TouchableOpacity>
  </View>
);

const FilterTabs = ( { tabs, activeTab, onTabPress } ) => (
  <View style={s.stickyTabs}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsRow}>
      {tabs.map( ( tab ) => {
        const active = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={[ s.tab, active && s.tabActive ]}
            onPress={() => onTabPress( tab )}
            activeOpacity={0.8}
          >
            <Text style={[ s.tabText, active && s.tabTextActive ]}>{tab}</Text>
          </TouchableOpacity>
        );
      } )}
    </ScrollView>
  </View>
);

// ─── Skeleton Grid ────────────────────────────────────────────────────────────
const SkeletonGrid = () => (
  <View style={s.grid}>
    {[ 1, 2, 3, 4, 5, 6 ].map( ( i ) => (
      <View key={i} style={s.skeletonCard}>
        <View style={s.skeletonImg} />
        <View style={s.skeletonBody}>
          <View style={s.skeletonLine1} />
          <View style={s.skeletonLine2} />
          <View style={s.skeletonLine3} />
          <View style={s.skeletonBtn} />
        </View>
      </View>
    ) )}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AllMedicinesScreen( { navigation, route, } ) {
  const title = route?.params?.title || 'All Medicines';
  const premiumLabel = route?.params?.premiumLabel || null;
  const items = route?.params?.items || [];
  const heroTitle = route?.params?.heroTitle || null;
  const isFav = route?.params?.isFav || false;

  const [ medicines, setMedicines ] = useState( [] );
  const [ loading, setLoading ] = useState( true );
  const [ refreshing, setRefreshing ] = useState( false );
  const [ loadingMore, setLoadingMore ] = useState( false );
  const [ error, setError ] = useState( null );
  const [ activeTab, setActiveTab ] = useState( 'All Items' );
  const [ filterTabs, setFilterTabs ] = useState( [ 'All Items' ] );
  const tabsInitialized = useRef( false ); // ← add this ref
  const [ modalVisible, setModalVisible ] = useState( false );
  const [ filterVisible, setFilterVisible ] = useState( false );
  const [ activeFilters, setActiveFilters ] = useState( { categories: [], price: null } );
  const [ isUserAuth, setIsUserAuth ] = useState( false )
  const [ categories, setCategories ] = useState( [] );


  const [ currentPage, setCurrentPage ] = useState( 1 );
  const [ lastPage, setLastPage ] = useState( 1 );
  const usingStaticItems = items?.length > 0;

  const { addToCart } = useAddToCart();


  // console.log('new fav medicines -------- ', medicines);
  
  const isLoadingMoreRef = useRef( false );

  const buildFilterTabs = ( list ) => {
    if ( tabsInitialized.current ) return; 
    const types = [ 'All Items', ...new Set( list.map( ( m ) => m.unit_type ).filter( Boolean ) ) ];
    setFilterTabs( types );
    tabsInitialized.current = true;
  };


  useEffect( () => {
    const fetchCategories = async () => {
      try {
        const res = await api.post( '/categories' );
        const list = res?.data?.data || [];
        setCategories( list );
      } catch ( err ) {
        console.error( 'Failed to fetch categories', err );
      }
    };
    fetchCategories();
  }, [] );


 const fetchMedicines = async ( isRefresh = false, unitType = 'All Items', categoryIds = [] ) => {
  try {
    isRefresh ? setRefreshing( true ) : setLoading( true );
    setError( null );

    if ( usingStaticItems ) {
      setMedicines( items );
      buildFilterTabs( items );
      setLoading( false );
      setRefreshing( false );
      return;
    }

    const unitParam = `unit_type=${unitType !== 'All Items' ? encodeURIComponent( unitType ) : ''}`;
    const url = isFav ? `/favourite-medicines?${unitParam}` : `/medicines?${unitParam}`;

    const body = { page: 1, per_page: 10 };
    if ( categoryIds.length > 0 ) body.category_id = categoryIds[ 0 ];

    const res = isFav
      ? await api.get( url, { params: body } )   
      : await api.post( url, body );

    const isOk = res.data?.success === true || res.data?.status === true;
    
    if ( isOk ) {
      const payload = res.data.data;
      const list = payload?.data ?? [];

      setMedicines( list );
      buildFilterTabs( list );
      setCurrentPage( payload?.current_page ?? 1 );
      setLastPage( payload?.last_page ?? 1 );
    } else {
      if ( res?.status === 401 ) {
        setIsUserAuth( true );
        setError( 'No Favourite Medicines' );
      } else {
        setError( 'Failed to load medicines.' );
      }
    }
  } catch ( err ) {
    setError( 'Something went wrong. Please try again.' );
  } finally {
    setLoading( false );
    setRefreshing( false );
  }
};


  const loadMoreMedicines = async () => {
    if ( loadingMore ) return;

    setLoadingMore( true );
    try {
      const nextPage = currentPage + 1;
      const unitParam = `unit_type=${activeTab !== 'All Items' ? encodeURIComponent( activeTab ) : ''}`;

      const body = { page: nextPage, per_page: 10 };
      if ( activeFilters.categories?.length > 0 ) body.category_id = activeFilters.categories[ 0 ];

      const res = await api.post( `/medicines?${unitParam}`, body );

      if ( res.data?.success === true ) {
        const payload = res.data.data;
        const newList = payload?.data ?? [];
        setMedicines( ( prev ) => {
          const merged = [ ...prev, ...newList ];
          buildFilterTabs( merged );
          return merged;
        } );
        setCurrentPage( payload?.current_page ?? nextPage );
        setLastPage( payload?.last_page ?? lastPage );
      }
    } catch ( err ) {
      // silently fail
    } finally {
      setLoadingMore( false );
    }
  };

  useEffect( () => { fetchMedicines( false, activeTab ); }, [ route?.params?.items ] );

  const onRefresh = useCallback( () => {
    setCurrentPage( 1 );
    setLastPage( 1 );
    tabsInitialized.current = false;
    fetchMedicines( true, activeTab );
  }, [ activeTab ] );



  const handleScroll = useCallback( ( e ) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;


    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;

    if ( isCloseToBottom && !isLoadingMoreRef.current && !loading && !refreshing && currentPage < lastPage && !usingStaticItems && !isFav ) {
      isLoadingMoreRef.current = true;
      loadMoreMedicines().finally( () => {
        isLoadingMoreRef.current = false;
      } );
    }
  }, [ currentPage, lastPage, loading, refreshing, usingStaticItems, isFav ] );

  const handleTabPress = ( tab ) => {
    setActiveTab( tab );
    setCurrentPage( 1 );
    setLastPage( 1 );
    setMedicines( [] );
    fetchMedicines( false, tab, activeFilters.categories );
  };


  const activeFilterCount =
    ( activeFilters.categories?.length || 0 ) + ( activeFilters.price ? 1 : 0 );


  const filtered = medicines
    .filter( ( m ) => {
      if ( !activeFilters.categories?.length ) return true;
      return activeFilters.categories.includes( Number( m.category_id ) );
    } )
    .filter( ( m ) => {
      if ( !activeFilters.price ) return true;

      const price = discountedPrice( m.price, m.discount );

      if ( activeFilters.price === 'Under ₹100' ) {
        return price < 100;
      }

      if ( activeFilters.price === '₹100 - ₹200' ) {
        return price >= 100 && price <= 200;
      }

      if ( activeFilters.price === '₹200 - ₹500' ) {
        return price > 200 && price <= 500;
      }

      if ( activeFilters.price === '₹500 - ₹1000' ) {
        return price > 500 && price <= 1000;
      }

      if ( activeFilters.price === '₹1000 - ₹1500' ) {
        return price > 1000 && price <= 1500;
      }

      if ( activeFilters.price === 'Above ₹1500' ) {
        return price > 1500;
      }

      return true;
    } );

  const handleAddToCart = ( medicine ) => addToCart( medicine, setModalVisible );

  const handleApplyFilters = ( filters ) => {
    setActiveFilters( filters );
    setFilterVisible( false );
    setCurrentPage( 1 );
    setLastPage( 1 );
    setMedicines( [] );
    fetchMedicines( false, activeTab, filters.categories );
  };

  return (
    <View style={s.screen}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />


      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.hIcon}>
          <MaterialIcons name="arrow-back" size={22} color={PINK} />
        </TouchableOpacity>
        <Text style={s.hTitle} numberOfLines={1}>{title}</Text>

        <TouchableOpacity
          style={s.filterBtn}
          onPress={() => setFilterVisible( true )}
          activeOpacity={0.8}
        >
          <MaterialIcons name="tune" size={18} color={PINK} />
          <Text style={[ s.filterBtnText, activeFilterCount > 0 && { color: PINK } ]}>
            Filter
          </Text>
          {activeFilterCount > 0 && (
            <View style={s.filterBadge}>
              <Text style={s.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Sticky Tabs ── */}
      {!isUserAuth && (
        <FilterTabs tabs={filterTabs} activeTab={activeTab} onTabPress={handleTabPress} /> )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}  
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[ PINK ]}
            tintColor={PINK}
          />
        }
      >
        {/* Hero block */}
        {( premiumLabel || heroTitle ) && (
          <View style={s.heroBlock}>
            {premiumLabel && <Text style={s.premiumLabel}>{premiumLabel}</Text>}
            {heroTitle && <Text style={s.heroTitle}>{heroTitle}</Text>}
          </View>
        )}

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.activeFiltersScroll} contentContainerStyle={s.activeFiltersRow}>
            {activeFilters?.categories?.map( ( catId ) => {
              const cat = categories.find( ( c ) => c.id === catId );
              return (
                <View key={catId} style={s.activeChip}>
                  <Text style={s.activeChipText}>{cat?.name || catId}</Text>
                  <TouchableOpacity onPress={() => {
                    const updated = { ...activeFilters, categories: activeFilters.categories.filter( c => c !== catId ) };
                    setActiveFilters( updated );
                    fetchMedicines( false, activeTab, updated.categories ); // ← re-fetch on chip remove
                  }}>
                    <MaterialIcons name="close" size={20} color={PINK} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              );
            } )}
            {activeFilters.price && (
              <View style={s.activeChip}>
                <Text style={s.activeChipText}>{activeFilters.price}</Text>
                <TouchableOpacity onPress={() => setActiveFilters( f => ( { ...f, price: null } ) )}>
                  <MaterialIcons name="close" size={20} color={PINK} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        {/* Error */}
        {error && (
          <View style={s.centered}>
            <Icon name="alert-circle-outline" size={48} color="#CCCCCC" />
            <Text style={s.stateText}>{error}</Text>
            {isUserAuth ? ( <TouchableOpacity style={s.retryBtn} onPress={() => navigation.navigate( "Login" )}>
              <Text style={s.retryText}>Login</Text>
            </TouchableOpacity> ) :
              ( <TouchableOpacity style={s.retryBtn} onPress={() => fetchMedicines()}>
                <Text style={s.retryText}>Try Again</Text>
              </TouchableOpacity> )
            }

          </View>
        )}

        {/* Loading skeleton (first load) */}
        {loading && !error && <SkeletonGrid />}

        {!loading && !error && filtered.length === 0 && (
          <View style={s.centered}>
            <Text style={s.stateText}>No {isFav && 'Favourite'} medicines found.</Text>
          </View>
        )}


        {!loading && !error && filtered.length > 0 && (
          <View style={s.grid}>
            {filtered.map( ( item ) => (
              <ProductCard
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
                navigation={navigation}
              />
            ) )}
          </View>
        )}

        {/* ── Loading more indicator ── */}
        {loadingMore && (
          <View style={s.loadMoreWrap}>
            <ActivityIndicator size="small" color={PINK} />
            {/* <Text style={s.loadMoreText}>Loading more...</Text> */}
          </View>
        )}

        {/* End of list note */}
        {!loading && !loadingMore && !usingStaticItems && !isFav && currentPage >= lastPage && medicines.length > 0 && (
          <Text style={s.endOfListText}>All mediciens loaded</Text>
        )}

        {/* Recommended */}
        {/* {!loading && !error && (
          <View style={s.section}>
            <Text style={s.secTitle}>Recommended For You</Text>
            <View style={s.recRow}>
              {RECOMMENDATIONS.map( ( item ) => (
                <RecommendCard key={item.id} item={item} />
              ) )}
            </View>
          </View>
        )} */}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Filter Drawer */}
      <FilterDrawer
        visible={filterVisible}
        onClose={() => setFilterVisible( false )}
        onApply={handleApplyFilters}
        resultsCount={filtered.length}
        categoryOptions={categories} // ← dynamic categories
      />

      <CustomModal
        visible={modalVisible}
        title="Login Required"
        message="You need to login to add items to your cart."
        loginLabel="Login"
        cancelLabel="Cancel"
        onLogin={() => { setModalVisible( false ); navigation?.navigate( 'Login' ); }}
        onCancel={() => setModalVisible( false )}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_WIDTH = '48%';

const s = StyleSheet.create( {
  screen: { flex: 1, backgroundColor: '#F7F7F9' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'ios' ? 54 : 43,
    paddingBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    gap: 8,
  },
  hIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, fontSize: 17, fontFamily: Fonts.secondary.bold, color: PINK, marginTop: 4.5 },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderColor: PINK,
    borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  filterBtnActive: { backgroundColor: PINK },
  filterBtnText: { fontSize: 13, fontFamily: Fonts.secondary.semiBold, color: PINK, marginBottom: -3 },
  filterBadge: {
    backgroundColor: PINK, borderRadius: 8,
    minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3, marginLeft: 2,
  },
  filterBadgeText: { fontSize: 9, marginBottom: -2, fontFamily: Fonts.secondary.bold, color: '#fff' },

  stickyTabs: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    elevation: 1,
  },
  tabsRow: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  tab: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#c7c7c7' },
  tabActive: { backgroundColor: PINK, borderColor: PINK },
  tabText: { fontSize: 13, fontFamily: Fonts.secondary.medium, color: '#5A4046', marginTop: 2 },
  tabTextActive: { fontSize: 13, fontFamily: Fonts.secondary.medium, color: '#FFFFFF' },

  scrollContent: { paddingBottom: 20 },

  heroBlock: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 16,
    paddingTop: 18, paddingBottom: 14, gap: 4, marginBottom: 4,
  },
  premiumLabel: { fontSize: 11, fontFamily: Fonts.secondary.bold, color: PINK, letterSpacing: 1.2 },
  heroTitle: { fontSize: 26, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A' },

  activeFiltersScroll: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  activeFiltersRow: { paddingHorizontal: 14, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  activeChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF0F6', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: '#F4C0D4',
  },
  activeChipText: { fontSize: 12, fontFamily: Fonts.secondary.medium, color: PINK, marginTop: 2 },

  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12, height: 400 },
  stateText: { fontSize: 14, fontFamily: Fonts.secondary.regular, color: '#AAAAAA', textAlign: 'center' },
  retryBtn: { backgroundColor: PINK, borderRadius: 50, paddingHorizontal: 28, paddingVertical: 10 },
  retryText: { fontSize: 14, fontFamily: Fonts.secondary.bold, color: '#FFF' },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, paddingTop: 14, gap: 12,
    justifyContent: 'space-between',
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardOOS: { opacity: 0.75 },

  cardImgWrap: {
    width: '100%', height: 120,
    backgroundColor: '#1A1A2E',
    position: 'relative',
    borderBottomWidth: 1, borderColor: '#cdcdcd',
  },
  cardImg: { width: '100%', height: '100%' },
  cardImgPlaceholder: {
    width: '100%', height: '100%',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1A1A2E',
  },

  cardBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: PINK,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
  },
  cardBadgeText: { fontSize: 9, fontFamily: Fonts.secondary.bold, color: '#fff', letterSpacing: 0.5 },

  discountPill: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3,
  },
  discountPillText: { fontSize: 9, fontFamily: Fonts.secondary.bold, color: '#fff' },

  oosOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 5, alignItems: 'center',
  },
  oosOverlayText: { fontSize: 10, fontFamily: Fonts.secondary.bold, color: '#fff' },

  cardBody: { padding: 12, gap: 3 },

  cardBrand: {
    fontSize: 10, fontFamily: Fonts.secondary.bold,
    color: '#888', letterSpacing: 0.8,
  },
  cardName: {
    fontSize: 14, fontFamily: Fonts.secondary.semiBold,
    color: '#1A1A1A', lineHeight: 19,
  },
  cardPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  cardPrice: { fontSize: 18, fontFamily: Fonts.secondary.bold, color: PINK },
  cardPriceMuted: { color: '#AAAAAA' },
  cardOriginal: {
    fontSize: 12, fontFamily: Fonts.secondary.regular,
    color: '#AAAAAA', textDecorationLine: 'line-through',
  },

  cartBtn: {
    backgroundColor: PINK, borderRadius: 10,
    paddingVertical: 11, alignItems: 'center',
    shadowColor: PINK, shadowOpacity: 0.3,
    shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4,
    ...Platform.select( { android: { paddingTop: 13, paddingBottom: 9 } } ),
  },
  cartBtnText: {
    fontSize: 13, fontFamily: Fonts.secondary.bold, color: '#fff',
    includeFontPadding: false, textAlignVertical: 'center',
    marginBottom: 2
  },
  cartBtnDisabled: {
    backgroundColor: '#F0F0F0', borderRadius: 10,
    paddingVertical: 11, alignItems: 'center', marginTop: 10,
  },
  cartBtnDisabledText: { fontSize: 13, fontFamily: Fonts.secondary.medium, color: '#AAAAAA' },

  skeletonCard: { width: CARD_WIDTH, borderRadius: 18, backgroundColor: '#fff', overflow: 'hidden', elevation: 2 },
  skeletonImg: { width: '100%', height: 160, backgroundColor: '#E8E8E8' },
  skeletonBody: { padding: 12, gap: 8 },
  skeletonLine1: { height: 9, width: '50%', backgroundColor: '#EEEEEE', borderRadius: 4 },
  skeletonLine2: { height: 14, width: '90%', backgroundColor: '#EEEEEE', borderRadius: 4 },
  skeletonLine3: { height: 14, width: '70%', backgroundColor: '#EEEEEE', borderRadius: 4 },
  skeletonBtn: { height: 38, backgroundColor: '#EEEEEE', borderRadius: 10, marginTop: 4 },

  // ── Load more / end of list ──
  loadMoreWrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 20,
  },
  loadMoreText: { fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#AAAAAA' },
  endOfListText: {
    textAlign: 'center', fontSize: 13, fontFamily: Fonts.secondary.regular,
    color: '#CCCCCC', paddingVertical: 20,
  },

  section: { paddingHorizontal: 16, paddingTop: 24 },
  secTitle: { fontSize: 20, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A', marginBottom: 14 },
  recRow: { flexDirection: 'row', gap: 12 },
  recCard: { flex: 1, borderRadius: 24, padding: 16, minHeight: 180, justifyContent: 'space-between', borderWidth: 1, borderColor: '#F0E0E8' },
  recTitle: { fontSize: 16, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A', lineHeight: 22, marginBottom: 4 },
  recSub: { fontSize: 12, fontFamily: Fonts.secondary.regular, color: '#777', lineHeight: 17, flex: 1 },
  recBtn: { borderRadius: 20, paddingVertical: 9, paddingHorizontal: 14, alignItems: 'center', marginTop: 12 },
  recBtnOutline: { borderWidth: 1.5, borderColor: '#DDDDDD', backgroundColor: '#FFFFFF' },
  recBtnSolid: { backgroundColor: PINK, shadowColor: PINK, shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  recBtnText: { fontSize: 13, fontFamily: Fonts.secondary.bold, marginTop: 2 },
  recBtnTextOutline: { color: '#1A1A1A' },
  recBtnTextSolid: { color: '#FFFFFF' },
} );