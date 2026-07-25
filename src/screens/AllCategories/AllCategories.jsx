import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, StatusBar,
  FlatList, Platform, ImageBackground, Image, RefreshControl, Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Fonts from '../../constant/Fonts';
import { api, base_api } from '../../services/service';
import GlobalLoader from '../../components/Loader';
import CustomModal from '../../components/CustomModal';

const PINK = '#B6005B';

const normalizeCategory = ( cat ) => ( {
  id: String( cat.id ),
  label: cat.name ?? cat.title ?? cat.category_name ?? 'Category',
  iconUrl: cat.icon ? `${base_api}${cat.icon}` : null,
  color: PINK,
  bg: '#F9E4EE',
  raw: cat,
  is_available : cat?.is_available
              
} );

const FALLBACK_CATEGORIES = [
  { id: '1', label: 'Prescription\nMedicines', iconUrl: null, color: PINK, bg: '#F9E4EE' },
  { id: '2', label: 'Vitamins &\nSupplements', iconUrl: null, color: PINK, bg: '#F9E4EE' },
  { id: '3', label: 'Surgical', iconUrl: null, color: PINK, bg: '#F9E4EE' },
  { id: '4', label: 'Personal Care', iconUrl: null, color: PINK, bg: '#F9E4EE' },
];

const CategoryIcon = ( { item } ) => {
  const [ imgError, setImgError ] = useState( false );
  return (
    <View style={[ styles.categoryIconBox, { backgroundColor: item.bg } ]}>
      {item.iconUrl && !imgError ? (
        <Image
          source={{ uri: item.iconUrl }}
          style={styles.categoryIconImage}
          onError={() => setImgError( true )}
          resizeMode="contain"
        />
      ) : (
        <Icon name="shape-outline" size={30} color={item.color} />
      )}
    </View>
  );
};

const CategoryCard = ( { item, onPress } ) => (
  <TouchableOpacity style={styles.categoryCard} onPress={onPress} activeOpacity={0.8}>
    <CategoryIcon item={item} />
    <Text style={styles.categoryLabel}>{item.label}</Text>
  </TouchableOpacity>
);

const SearchResultRow = ( { item, query, onPress } ) => {
  const [ imgError, setImgError ] = useState( false );
  const idx = item.label.toLowerCase().indexOf( query.toLowerCase() );
  const before = idx >= 0 ? item.label.slice( 0, idx ) : item.label;
  const match = idx >= 0 ? item.label.slice( idx, idx + query.length ) : '';
  const after = idx >= 0 ? item.label.slice( idx + query.length ) : '';

  return (
    <TouchableOpacity style={styles.searchRow} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.searchRowIcon}>
        {item.iconUrl && !imgError ? (
          <Image
            source={{ uri: item.iconUrl }}
            style={{ width: 20, height: 20 }}
            onError={() => setImgError( true )}
            resizeMode="contain"
          />
        ) : (
          <Icon name="shape-outline" size={18} color={PINK} />
        )}
      </View>
      <View style={styles.searchRowText}>
        <Text style={styles.searchRowName}>
          {idx >= 0 ? (
            <>
              <Text style={styles.searchRowNormal}>{before}</Text>
              <Text style={styles.searchRowBold}>{match}</Text>
              <Text style={styles.searchRowNormal}>{after}</Text>
            </>
          ) : (
            <Text style={styles.searchRowNormal}>{item.label}</Text>
          )}
        </Text>
        {item.raw?.description ? (
          <Text style={styles.searchRowCategory} numberOfLines={1}>
            {item.raw.description}
          </Text>
        ) : null}
      </View>
      <MaterialIcons name="north-west" size={16} color="#CCCCCC" />
    </TouchableOpacity>
  );
};

export default function AllCategoriesScreen( { navigation } ) {
  const [ categories, setCategories ] = useState( [] );
  const [ loading, setLoading ] = useState( true );
  const [ refreshing, setRefreshing ] = useState( false );
  const [ query, setQuery ] = useState( '' );
  const [ focused, setFocused ] = useState( false );
  const [ modalVisible, setModalVisible ] = useState( false );

  const fetchCategories = useCallback( async ( isPullRefresh = false ) => {
    isPullRefresh ? setRefreshing( true ) : setLoading( true );
    try {
      const res = await api.post( '/categories' );
      const raw = res.data?.data ?? res.data?.categories ?? res.data;
      console.log( 'reow ------------- ', res );

      const arr = Array.isArray( raw ) ? raw : [];
      if ( res.status === 200 && arr.length > 0 ) {
        setCategories( arr.map( normalizeCategory ) );
      } else {
        setCategories( [] );
      }
    } catch {
      setCategories( [] );
    } finally {
      setLoading( false );
      setRefreshing( false );
    }
  }, [] );

  useEffect( () => { fetchCategories(); }, [ fetchCategories ] );

  const searchResults = useMemo( () => {
    if ( !query.trim() ) return [];
    const q = query.toLowerCase();
    return categories.filter( ( c ) =>
      c.label.toLowerCase().includes( q ) ||
      ( c.raw?.description ?? '' ).toLowerCase().includes( q )
    );
  }, [ query, categories ] );

  const showResults = focused && query.trim().length > 0;

  const handleItemPress = (item) => {
  Keyboard.dismiss();
  setQuery('');
  setFocused(false);

  if (item?.is_available) {
    navigation.navigate('SingleCategoryScreen', {
      id: item?.id,
      categoryName: item?.label,
    });
  } else {
    navigation.navigate('ComingSoonScrren', {
      categoryId: item?.id,
      categoryName: item?.label,
    });
  }
};

  if ( loading ) return <GlobalLoader visible={loading} />;

  return (
    // ← outermost View has NO overflow:hidden so dropdown can float freely
    <View style={styles.screen}>
      <StatusBar backgroundColor="#F9F9F9" barStyle="dark-content" />
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.hIcon}>
            <MaterialIcons name="arrow-back" size={22} color={PINK} />
          </TouchableOpacity>
          <Text style={styles.hTitle}>All Categories</Text>
        </View>

      </View>

      {/* ── Search Bar + Dropdown — lives OUTSIDE ScrollView ── */}
      <View style={styles.searchContainer}>
        <View style={[ styles.searchBar, focused && styles.searchBarFocused ]}>
          <MaterialIcons name="search" size={20} color="#705D69" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines, health products..."
            placeholderTextColor="#8E6F76"
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused( true )}
            onBlur={() => setTimeout( () => setFocused( false ), 200 )}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery( '' ); setFocused( false ); }}>
              <MaterialIcons name="close" size={18} color="#AAAAAA" />
            </TouchableOpacity>
          )}
        </View>



      </View>
      {showResults && (
        <View style={styles.searchDropdown}>
          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={( item ) => item.id}
              renderItem={( { item } ) => (
                <SearchResultRow
                  item={item}
                  query={query}
                  onPress={() => handleItemPress( item )}
                />
              )}
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={true}
              bounces={true}
              style={styles.dropdownList}
            />
          ) : (
            <View style={styles.noResults}>
              <Icon name="magnify-close" size={28} color="#DDDDDD" />
              <Text style={styles.noResultsText}>No results for "{query}"</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Main content ScrollView ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchCategories( true )}
            colors={[ PINK ]}
            tintColor={PINK}
          />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse by Need</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{categories.length} CATEGORIES</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {categories.map( ( cat ) => (
            <CategoryCard
              key={cat.id}
              item={cat}
              onPress={() => cat?.is_available ?
                navigation.navigate( 'SingleCategoryScreen',
                  { id: cat?.id, categoryName: cat.name } )
                :
                navigation.navigate( 'ComingSoonScrren',
                  { categoryId: cat.id, categoryName: cat.name } )}
              setModalVisible={setModalVisible}
            />
          ) )}
        </View>

        <ImageBackground
          source={require( '../../assets/images/bestSeller_img.png' )}
          style={styles.banner}
          imageStyle={styles.bannerImage}
        >
          <LinearGradient
            colors={[ 'transparent', 'transparent', 'transparent' ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bannerOverlay}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Need a prescription?</Text>
              <Text style={styles.bannerSub}>
                Book a quick 5-minute consultation{'\n'}with our on-call specialists.
              </Text>
              <TouchableOpacity style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>Talk to Doctor</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={{ height: 32 }} />
      </ScrollView>
      <CustomModal
        visible={modalVisible}
        title="Login Required"
        message="You need to login to access this feature."
        loginLabel="Login"
        cancelLabel="Cancel"
        onLogin={() => { navigation.navigate( 'Login' ); setModalVisible( false ); }}
        onCancel={() => setModalVisible( false )}
      />

    </View>
  );
}

const styles = StyleSheet.create( {
  screen: { flex: 1, backgroundColor: '#F9F9F9', position: 'relative' },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    paddingHorizontal: 8, paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, justifyContent: 'space-between',
  },
  hIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { textAlign: 'center', fontSize: 17, fontFamily: Fonts.secondary.semiBold, color: PINK, marginBottom: -5 },

  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    marginTop: 20,
    zIndex: 999,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
    // ← high zIndex so dropdown floats above ScrollView
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 12, paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 12,
    borderWidth: 1, borderColor: '#e9e9e9', elevation: 2, shadowColor: '#000',
  },
  searchBarFocused: { borderColor: '#F5C2D0' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: Fonts.secondary.regular, color: '#1A1A1A', padding: 0, marginTop: 4 },

  searchDropdown: {
    position: 'absolute',
    top: 162,
    left: 15,
    right: "5%",
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0E0E8',
    elevation: 20,           // ← high elevation so it's above everything on Android
    zIndex: 9999,
    shadowColor: PINK,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    maxHeight: 250,
    width: 330
    // ← height on the container, NOT the FlatList
  },
  dropdownList: {
    borderRadius: 14,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#FBF0F5', gap: 12,
  },
  searchRowIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FFF0F6', alignItems: 'center', justifyContent: 'center' },
  searchRowText: { flex: 1 },
  searchRowName: { fontSize: 13, marginBottom: 2 },
  searchRowNormal: { fontFamily: Fonts.regular, color: '#1A1A1A' },
  searchRowBold: { fontFamily: Fonts.bold, color: PINK },
  searchRowCategory: { fontSize: 11, fontFamily: Fonts.regular, color: '#AAAAAA' },
  noResults: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 8 },
  noResultsText: { fontFamily: Fonts.regular, fontSize: 13, color: '#BBBBBB' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: Fonts.bold, color: '#1A1A1A' },
  countBadge: { backgroundColor: '#FFF0F6', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  countBadgeText: { fontSize: 10, fontFamily: Fonts.bold, color: PINK, letterSpacing: 0.5 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', marginBottom: 24 },
  categoryCard: {
    width: '48%', backgroundColor: '#FFFFFF', borderRadius: 24,
    paddingVertical: 20, paddingHorizontal: 14, alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  categoryIconBox: { width: 62, height: 62, borderRadius: 13, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  categoryIconImage: { width: '100%', height: '100%' },
  categoryLabel: { fontSize: 13, fontFamily: Fonts.secondary.medium, color: '#1A1A1A', textAlign: 'center', lineHeight: 18 },

  banner: {
    borderRadius: 20, backgroundColor: PINK, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 22, paddingHorizontal: 20, minHeight: 130, marginBottom: 80,
  },
  bannerImage: { borderRadius: 20 },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center' },
  bannerContent: { flex: 1, gap: 6 },
  bannerTitle: { fontSize: 20, fontFamily: Fonts.secondary.bold, color: '#FFFFFF', lineHeight: 26 },
  bannerSub: { fontSize: 12, fontFamily: Fonts.secondary.regular, color: 'rgba(255,255,255,0.80)', lineHeight: 18, marginBottom: 4 },
  bannerBtn: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 6, alignSelf: 'flex-start', marginTop: 4 },
  bannerBtnText: { fontSize: 13, marginTop: 4, fontFamily: Fonts.secondary.bold, color: PINK },
} );