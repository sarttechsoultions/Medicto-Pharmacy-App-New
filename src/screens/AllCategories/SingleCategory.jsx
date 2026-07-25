import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Image, StatusBar, Platform,
  TextInput, Animated, Dimensions, ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fonts from '../../constant/Fonts';
import FilterDrawer from '../../components/FIlterDrawer';
import { api, base_api } from '../../services/service';
import useAddToCart from '../../components/CustomAddToCart';
import CustomModal from '../../components/CustomModal';

const PINK = '#B6005B';
const { width: W } = Dimensions.get('window');

const discountedPrice = (price, discount) => {
  const p = Number(price) || 0;
  const d = Number(discount) || 0;
  return Number((p - (p * d) / 100).toFixed(2));
};

const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  return `${base_api}${image}`;
};

const ProductCard = ({ item, onAddToCart, navigation }) => {
  const inStock = Number(item.quantity) > 0;
  const finalPrice = discountedPrice(item.price, item.discount);
  const rawPrice = Number(item.price) || 0;
  const imageUri = getImageUrl(item.image);
  const hasBadge = item.is_bestseller || item.badge;
  const badgeLabel = item.badge || (item.is_bestseller ? 'BEST SELLER' : null);

  return (
    <TouchableOpacity
      style={[styles.card, !inStock && styles.cardOOS]}
      activeOpacity={0.9}
      disabled={!inStock}
      onPress={() => navigation?.navigate('ProductDetails', { medicineId: item?.id })}
    >
      <View style={styles.cardImageBox}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Icon name="pill" size={36} color="rgba(255,255,255,0.25)" />
          </View>
        )}
        {hasBadge && inStock && (
          <View style={[styles.cardBadge, { backgroundColor: PINK }]}>
            <Text style={styles.cardBadgeText}>{badgeLabel}</Text>
          </View>
        )}
        {!inStock && (
          <View style={styles.oosOverlay}>
            <Text style={styles.oosOverlayText}>Out of Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardBrand} numberOfLines={1}>{(item.manufacturer || 'GENERIC').toUpperCase()}</Text>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.cardPriceRow}>
          <Text style={[styles.cardPrice, !inStock && styles.cardPriceMuted]}>₹{finalPrice.toFixed(2)}</Text>
          {Number(item.discount) > 0 && inStock && (
            <Text style={styles.cardOriginal}>₹{rawPrice.toFixed(2)}</Text>
          )}
        </View>
        {inStock ? (
          <TouchableOpacity
            style={styles.addToCartBtn}
            activeOpacity={0.85}
            onPress={() => onAddToCart(item)}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addToCartBtnDisabled}>
            <Text style={styles.addToCartTextDisabled}>Out of Stock</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const SkeletonGrid = () => (
  <View style={styles.grid}>
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={styles.skeletonCard}>
        <View style={styles.skeletonImg} />
        <View style={styles.skeletonBody}>
          <View style={styles.skeletonLine1} />
          <View style={styles.skeletonLine2} />
          <View style={styles.skeletonLine3} />
          <View style={styles.skeletonBtn} />
        </View>
      </View>
    ))}
  </View>
);

// ── Screen ────────────────────────────────────────────────────────────────────
export default function SingleCategoryScreen({ navigation, route }) {
  const categoryId = route?.params?.id ?? route?.params?.category?.id;
  const fallbackName = route?.params?.categoryName ?? route?.params?.category?.name ?? 'Category';
  const fallbackDesc = route?.params?.categoryDesc ?? route?.params?.category?.description ?? '';

  const [categoryName, setCategoryName] = useState(fallbackName);
  const [categoryDesc, setCategoryDesc] = useState(fallbackDesc);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ categories: [], price: null });
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic categories for FilterDrawer
  const [categories, setCategories] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { addToCart } = useAddToCart();

  const searchWidthAnim = useRef(new Animated.Value(0)).current;
  const searchOpacAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);
  const isLoadingMoreRef = useRef(false);

  // ── Fetch dynamic categories for FilterDrawer ─────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.post('/categories');
        setCategories(res?.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  // ── Fetch products ────────────────────────────────────────────────────────
  const fetchCategory = async (isRefresh = false, categoryIds = []) => {
    if (!categoryId) {
      setError('No category selected.');
      setLoading(false);
      return;
    }
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const body = { page: 1, per_page: 10 };

      // If user selected a category from filter drawer use that, else use screen's categoryId
      if (categoryIds.length > 0) {
        body.category_id = categoryIds[0];
      } else {
        body.category_id = categoryId;
      }

      const res = await api.post('/medicines', body);

      if (res.data?.success) {
        const payload = res.data?.data;
        const list = payload?.data ?? [];
        setProducts(list);
        setCurrentPage(payload?.current_page ?? 1);
        setLastPage(payload?.last_page ?? 1);
      } else {
        setError(res.data?.message || 'Failed to load category.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ── Load next page (infinite scroll) ─────────────────────────────────────
 const loadMoreProducts = async () => {
  if (loadingMore) return;

  setLoadingMore(true);
  try {
    const nextPage = currentPage + 1;
    const body = { page: nextPage, per_page: 10 };

    if (activeFilters.categories?.length > 0) {
      body.category_id = activeFilters.categories[0];
    } else {
      body.category_id = categoryId;
    }

    const res = await api.post('/medicines', body);

    if (res.data?.success) {
      const payload = res.data?.data;
      const newList = payload?.data ?? [];
      setProducts((prev) => [...prev, ...newList]);
      setCurrentPage(payload?.current_page ?? nextPage);
      setLastPage(payload?.last_page ?? lastPage);
    }
  } catch (err) {
    // silently fail
  } finally {
    setLoadingMore(false);
  }
};


  const onRefresh = useCallback(() => {
    setCurrentPage(1);
    setLastPage(1);
    fetchCategory(true, activeFilters.categories); // carry active filters on refresh
  }, [activeFilters.categories]);

  useEffect(() => { fetchCategory(); }, [categoryId]);

  const handleScroll = useCallback((e) => {
  const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
  const isCloseToBottom =
    layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;

  if (
    isCloseToBottom &&
    !isLoadingMoreRef.current &&
    !loading &&
    !refreshing &&
    currentPage < lastPage
  ) {
    isLoadingMoreRef.current = true;
    loadMoreProducts().finally(() => {
      isLoadingMoreRef.current = false;
    });
  }
}, [currentPage, lastPage, loading, refreshing]);

  const handleAddToCart = (item) => addToCart(item, setModalVisible);

  // ── Search animations ─────────────────────────────────────────────────────
  const openSearch = () => {
    setSearchActive(true);
    Animated.parallel([
      Animated.spring(searchWidthAnim, { toValue: 1, useNativeDriver: false, tension: 60, friction: 10 }),
      Animated.timing(searchOpacAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start(() => inputRef.current?.focus());
  };

  const closeSearch = () => {
    setSearchQuery('');
    Animated.parallel([
      Animated.spring(searchWidthAnim, { toValue: 0, useNativeDriver: false, tension: 60, friction: 10 }),
      Animated.timing(searchOpacAnim, { toValue: 0, duration: 150, useNativeDriver: false }),
    ]).start(() => setSearchActive(false));
  };

  // ── Filter apply ──────────────────────────────────────────────────────────
  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setFilterVisible(false);
    setCurrentPage(1);
    setLastPage(1);
    setProducts([]);
    fetchCategory(false, filters.categories);
  };

  const activeFilterCount = (activeFilters.categories?.length || 0) + (activeFilters.price ? 1 : 0);

  const filteredProducts = products
    .filter((p) =>
      searchQuery.trim()
        ? (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.manufacturer || '').toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .filter((p) => {
      if (!activeFilters.categories?.length) return true;
      return activeFilters.categories.includes(Number(p.category_id)); // match by id
    })
    .filter((m) => {
    if (!activeFilters.price) return true;

    const price = discountedPrice(m.price, m.discount);

    if (activeFilters.price === 'Under ₹100') {
      return price < 100;
    }

    if (activeFilters.price === '₹100 - ₹200') {
      return price >= 100 && price <= 200;
    }

    if (activeFilters.price === '₹200 - ₹500') {
      return price > 200 && price <= 500;
    }

    if (activeFilters.price === '₹500 - ₹1000') {
      return price > 500 && price <= 1000;
    }

    if (activeFilters.price === '₹1000 - ₹1500') {
      return price > 1000 && price <= 1500;
    }

    if (activeFilters.price === 'Above ₹1500') {
      return price > 1500;
    }

    return true;
  });

  const SEARCH_MAX = W - 38 - 16 - 16;
  const animatedWidth = searchWidthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SEARCH_MAX],
  });

  return (
    <View style={styles.screen}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        {!searchActive && (
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.headerIcon}>
              <MaterialIcons name="arrow-back" size={22} color={PINK} />
            </TouchableOpacity>
            <Text style={styles.headerBrand} numberOfLines={1}>{categoryName}</Text>
          </View>
        )}

        <View style={styles.headerRight}>
          <Animated.View style={[styles.searchBarWrap, { width: animatedWidth, opacity: searchOpacAnim }]}>
            <MaterialIcons name="search" size={18} color="#AAAAAA" style={{ marginLeft: 10, marginTop: 2 }} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder={`Search in ${categoryName}...`}
              placeholderTextColor="#BBBBBB"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <MaterialIcons name="cancel" size={16} color="#AAAAAA" />
              </TouchableOpacity>
            )}
          </Animated.View>

          {!searchActive ? (
            <TouchableOpacity style={styles.headerIcon} onPress={openSearch}>
              <MaterialIcons name="search" size={22} color={PINK} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.headerIcon} onPress={closeSearch}>
              <MaterialIcons name="close" size={22} color={PINK} />
            </TouchableOpacity>
          )}

        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PINK]}
            tintColor={PINK}
          />
        }
      >
        {!searchActive && (
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.pageTitle}>{categoryName}</Text>
              {categoryDesc ? <Text style={styles.pageSubtitle}>{categoryDesc}</Text> : null}
            </View>

            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => setFilterVisible(true)}
              activeOpacity={0.8}
            >
              <Icon name="tune-variant" size={16} color="#1A1A1A" />
              <Text style={styles.filterBtnText}>Filters</Text>
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.activeFiltersScroll}
            contentContainerStyle={styles.activeFiltersRow}
          >
            {activeFilters.categories?.map((catId) => {
              const cat = categories.find((c) => c.id === catId);
              return (
                <View key={catId} style={styles.activeChip}>
                  <Text style={styles.activeChipText}>{cat?.name || catId}</Text>
                  <TouchableOpacity onPress={() => {
                    const updated = {
                      ...activeFilters,
                      categories: activeFilters.categories.filter((c) => c !== catId),
                    };
                    setActiveFilters(updated);
                    fetchCategory(false, updated.categories);
                  }}>
                    <MaterialIcons name="close" size={18} color={PINK} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              );
            })}
            {activeFilters.price && (
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>{activeFilters.price}</Text>
                <TouchableOpacity onPress={() => setActiveFilters((f) => ({ ...f, price: null }))}>
                  <MaterialIcons name="close" size={18} color={PINK} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        {searchActive && searchQuery.trim().length > 0 && (
          <Text style={styles.searchResultsLabel}>
            {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for "{searchQuery}"
          </Text>
        )}

        {/* Error */}
        {error && !loading && (
          <View style={styles.emptyWrap}>
            <Icon name="alert-circle-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => fetchCategory()}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading */}
        {loading && !error && <SkeletonGrid />}

        {/* Empty */}
        {!loading && !error && filteredProducts.length === 0 && (
          <View style={styles.emptyWrap}>
            <Icon name="magnify-close" size={48} color="#DDDDDD" />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <View style={styles.grid}>
            {filteredProducts.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
                navigation={navigation}
              />
            ))}
          </View>
        )}

        {loadingMore && (
          <View style={styles.loadMoreWrap}>
            <ActivityIndicator size="small" color={PINK} />
          </View>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>

      <FilterDrawer
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleApplyFilters}
        resultsCount={filteredProducts.length}
        categoryOptions={categories} 
      />

      <CustomModal
        visible={modalVisible}
        title="Login Required"
        message="You need to login to add items to your cart."
        loginLabel="Login"
        cancelLabel="Cancel"
        onLogin={() => { setModalVisible(false); navigation?.navigate('Login'); }}
        onCancel={() => setModalVisible(false)}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f4f4' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 14,
    elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  headerIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerBrand: { textAlign: 'center', fontSize: 17, fontFamily: Fonts.bold, color: PINK, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },

  searchBarWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 10, height: 45, overflow: 'hidden',
    borderWidth: 1, borderColor: '#cdcdcd', marginLeft: 12,
  },
  searchInput: {
    flex: 1, fontSize: 13, fontFamily: Fonts.secondary?.regular ?? Fonts.regular,
    color: '#1A1A1A', paddingHorizontal: 8, paddingVertical: 0, marginTop: 4,
  },
  clearBtn: { paddingHorizontal: 8, height: '100%', alignItems: 'center', justifyContent: 'center' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 },
  titleBlock: { flex: 1 },
  pageTitle: { fontSize: 22, fontFamily: Fonts.secondary?.bold ?? Fonts.bold, color: '#1A1A1A', marginBottom: 6 },
  pageSubtitle: { fontSize: 13, fontFamily: Fonts.secondary?.regular ?? Fonts.regular, color: '#777777', lineHeight: 19 },

  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#dcdcdc', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    alignSelf: 'flex-start', marginTop: 4, position: 'relative',
  },
  filterBtnText: { fontSize: 13, fontFamily: Fonts.secondary?.medium ?? Fonts.medium, color: '#1A1A1A', marginBottom: -2 },
  filterBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: PINK, alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { fontSize: 9, fontFamily: Fonts.bold, color: '#FFF' },

  activeFiltersScroll: { marginBottom: 14, backgroundColor: '#fff', borderRadius: 10 },
  activeFiltersRow: { paddingHorizontal: 4, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  activeChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF0F6', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: '#F4C0D4',
  },
  activeChipText: { fontSize: 12, fontFamily: Fonts.secondary?.medium ?? Fonts.medium, color: PINK, marginTop: 2 },

  searchResultsLabel: { fontSize: 13, fontFamily: Fonts.secondary?.medium ?? Fonts.medium, color: '#777777', marginBottom: 16 },

  emptyWrap: { flex: 1, alignItems: 'center', paddingVertical: 60, gap: 12, width: '100%' },
  emptyText: { fontSize: 14, color: '#AAAAAA', fontFamily: Fonts.secondary?.regular ?? Fonts.regular, textAlign: 'center' },
  retryBtn: { backgroundColor: PINK, borderRadius: 50, paddingHorizontal: 28, paddingVertical: 10, marginTop: 4 },
  retryText: { fontSize: 14, fontFamily: Fonts.secondary?.bold ?? Fonts.bold, color: '#FFF' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', marginBottom: 100 },

  card: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', marginBottom: 4 },
  cardImageBox: { height: 140, backgroundColor: '#2B2B2B', position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  cardImagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3A3A3A' },
  cardBadge: { position: 'absolute', top: 10, left: 10, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  cardBadgeText: { fontSize: 9, fontFamily: Fonts.secondary?.bold ?? Fonts.bold, color: '#FFFFFF', letterSpacing: 0.5 },
  cardInfo: { padding: 12, gap: 4 },
  cardBrand: { fontSize: 10, fontFamily: Fonts.secondary?.bold ?? Fonts.bold, color: '#AAAAAA', letterSpacing: 0.6 },
  cardName: { fontSize: 13, fontFamily: Fonts.secondary?.semiBold ?? Fonts.semiBold, color: '#1A1A1A', lineHeight: 18, marginBottom: 4 },
  cardPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  cardPrice: { fontSize: 16, fontFamily: Fonts.secondary?.bold ?? Fonts.bold, color: PINK },
  cardOriginal: { fontSize: 12, fontFamily: Fonts.secondary?.regular ?? Fonts.regular, color: '#AAAAAA', textDecorationLine: 'line-through' },
  addToCartBtn: {
    backgroundColor: PINK, borderRadius: 10, paddingVertical: 10, alignItems: 'center',
    shadowColor: PINK, shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  addToCartText: { fontSize: 13, marginTop: 3, fontFamily: Fonts.secondary?.bold ?? Fonts.bold, color: '#FFFFFF' },

  skeletonCard: { width: '48%', borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden', elevation: 2, marginBottom: 12 },
  skeletonImg: { width: '100%', height: 140, backgroundColor: '#E8E8E8' },
  skeletonBody: { padding: 12, gap: 8 },
  skeletonLine1: { height: 9, width: '50%', backgroundColor: '#EEEEEE', borderRadius: 4 },
  skeletonLine2: { height: 14, width: '90%', backgroundColor: '#EEEEEE', borderRadius: 4 },
  skeletonLine3: { height: 14, width: '70%', backgroundColor: '#EEEEEE', borderRadius: 4 },
  skeletonBtn: { height: 38, backgroundColor: '#EEEEEE', borderRadius: 10, marginTop: 4 },
  loadMoreWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  cardOOS: { opacity: 0.75 },
  oosOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 5, alignItems: 'center',
  },
  oosOverlayText: { fontSize: 10, fontFamily: Fonts.secondary?.bold ?? Fonts.bold, color: '#fff' },
  cardPriceMuted: { color: '#AAAAAA' },
  addToCartBtnDisabled: {
    backgroundColor: '#F0F0F0', borderRadius: 10, paddingVertical: 10, alignItems: 'center',
  },
  addToCartTextDisabled: { fontSize: 13, marginTop: 3, fontFamily: Fonts.secondary?.bold ?? Fonts.bold, color: '#AAAAAA' },
});