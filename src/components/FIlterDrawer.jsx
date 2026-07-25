import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Modal, Animated, Dimensions, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fonts from '../constant/Fonts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get( 'window' );
const PINK = '#B6005B';

const DEFAULT_FILTER_SECTIONS = [
  { key: 'category', label: 'Category' },
  { key: 'brand', label: 'Brand' },
  { key: 'priceRange', label: 'Price\nRange' },
  { key: 'discount', label: 'Discount' },
  { key: 'prescription', label: 'Prescription\nRequired' },
];

const DEFAULT_CATEGORY_OPTIONS = [
  'Cardiology', 'Dermatology', 'Endocrinology',
  'General Wellness', 'Immunity Boosters', 'Neurology', 'Pediatrics',
];

const PRICE_CHIPS = [
  'Under ₹100',
  '₹100 - ₹200',
  '₹200 - ₹500',
  '₹500 - ₹1000',
  '₹1000 - ₹1500',
  'Above ₹1500',
];

export default function FilterDrawer( {
  visible,
  onClose,
  onApply,
  resultsCount = 124,
  filterSections = DEFAULT_FILTER_SECTIONS,
  categoryOptions = [],
  priceChips = PRICE_CHIPS,
} ) {
  const [ activeSection, setActiveSection ] = useState( 'category' );
  const [ selectedCategories, setSelectedCategories ] = useState( [] );
  const [ selectedPrice, setSelectedPrice ] = useState( null );
  const [ categorySearch, setCategorySearch ] = useState( '' );

  const slideAnim = useRef( new Animated.Value( SCREEN_HEIGHT ) ).current;
  const bgAnim = useRef( new Animated.Value( 0 ) ).current;

  const insets = useSafeAreaInsets()

  useEffect( () => {
    if ( visible ) {
      Animated.parallel( [
        Animated.spring( slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 4 } ),
        Animated.timing( bgAnim, { toValue: 1, duration: 250, useNativeDriver: true } ),
      ] ).start();
    } else {
      Animated.parallel( [
        Animated.timing( slideAnim, { toValue: SCREEN_HEIGHT, duration: 220, useNativeDriver: true } ),
        Animated.timing( bgAnim, { toValue: 0, duration: 200, useNativeDriver: true } ),
      ] ).start();
    }
  }, [ visible ] );

  const toggleCategory = ( id ) =>
    setSelectedCategories( ( prev ) =>
      prev.includes( id ) ? prev.filter( ( c ) => c !== id ) : [ ...prev, id ]
    );

  const handleClearAll = () => {
    const empty = { categories: [], price: null };
    setSelectedCategories( [] );
    setSelectedPrice( null );
    setCategorySearch( '' );
    onApply?.( empty );
    onClose?.();
  };

  const handleApply = () => {
    onApply?.( { categories: selectedCategories, price: selectedPrice } ); // sends ids
    onClose?.();
  };

  const filteredCategories = categoryOptions.filter( ( c ) =>
    c.name.toLowerCase().includes( categorySearch.toLowerCase() )
  );

  // ── Right panel ───────────────────────────────────────────────────────────
  const renderRightPanel = () => {
    switch ( activeSection ) {
      case 'category':
        return (
          <View style={styles.rightPanel}>
            <View style={styles.catSearchBar}>
              <MaterialIcons name="search" size={16} color="#AAAAAA" />
              <TextInput
                style={styles.catSearchInput}
                placeholder="Search categories..."
                placeholderTextColor="#BBBBBB"
                value={categorySearch}
                onChangeText={setCategorySearch}
                blurOnSubmit
              />
              {categorySearch.length > 0 && (
                <TouchableOpacity onPress={() => setCategorySearch( '' )}>
                  <MaterialIcons name="cancel" size={16} color="#AAAAAA" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {filteredCategories.length === 0 ? (
                <Text style={styles.rightPanelHint}>No categories found</Text>
              ) : (
                filteredCategories.map( ( cat ) => {
                  const checked = selectedCategories.includes( cat.id ); // ← use id
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.checkRow}
                      onPress={() => toggleCategory( cat.id )} // ← toggle by id
                      activeOpacity={0.7}
                    >
                      <Text style={styles.checkLabel}>{cat.name}</Text>
                      <View style={[ styles.checkbox, checked && styles.checkboxChecked ]}>
                        {checked && <MaterialIcons name="check" size={13} color="#FFF" />}
                      </View>
                    </TouchableOpacity>
                  );
                } )
              )}

              {/* price chips stay same */}
              <Text style={styles.priceChipsLabel}>QUICK PRICE FILTER</Text>
              <View style={styles.priceChipsRow}>
                {priceChips.map( ( chip ) => (
                  <TouchableOpacity
                    key={chip}
                    style={[ styles.priceChip, selectedPrice === chip && styles.priceChipActive ]}
                    onPress={() => setSelectedPrice( selectedPrice === chip ? null : chip )}
                  >
                    <Text style={[ styles.priceChipText, selectedPrice === chip && styles.priceChipTextActive ]}>
                      {chip}
                    </Text>
                  </TouchableOpacity>
                ) )}
              </View>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        );
      case 'priceRange':
        return (
          <View style={styles.rightPanel}>
            <Text style={styles.rightPanelHint}>Select a price range</Text>
            <View style={styles.priceChipsRow}>
              {priceChips.map( ( chip ) => (
                <TouchableOpacity
                  key={chip}
                  style={[ styles.priceChip, selectedPrice === chip && styles.priceChipActive ]}
                  onPress={() => setSelectedPrice( selectedPrice === chip ? null : chip )}
                >
                  <Text style={[ styles.priceChipText, selectedPrice === chip && styles.priceChipTextActive ]}>
                    {chip}
                  </Text>
                </TouchableOpacity>
              ) )}
            </View>
          </View>
        );

      default:
        return (
          <View style={styles.rightPanel}>
            <Text style={styles.rightPanelHint}>Coming soon...</Text>
          </View>
        );
    }
  };

  if ( !visible ) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"       // we handle animation ourselves
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[ styles.backdrop, { opacity: bgAnim } ]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* ── KeyboardAvoidingView wraps only the drawer ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.kavWrapper, { bottom: insets.bottom }]} 
        // Only active when the search input inside is focused
        keyboardVerticalOffset={0}
      >
        <Animated.View style={[ styles.drawer, { transform: [ { translateY: slideAnim } ] } ]}>

          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Drawer Header */}
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Filters</Text>
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearAll}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.drawerBody}>
            {/* Left tabs */}
            <View style={styles.leftTabs}>
              {filterSections.map( ( sec ) => {
                const active = activeSection === sec.key;
                return (
                  <TouchableOpacity
                    key={sec.key}
                    style={[ styles.leftTab, active && styles.leftTabActive ]}
                    onPress={() => setActiveSection( sec.key )}
                    activeOpacity={0.7}
                  >
                    {active && <View style={styles.leftTabIndicator} />}
                    <Text style={[ styles.leftTabText, active && styles.leftTabTextActive ]}>
                      {sec.label}
                    </Text>
                  </TouchableOpacity>
                );
              } )}
            </View>

            {/* Right content */}
            {renderRightPanel()}
          </View>

          {/* Footer */}
          <View style={[styles.drawerFooter, { paddingBottom: Math.max(insets.bottom-20, 16) }]}>
            <View style={styles.resultsCount}>
              <Text style={styles.resultsLabel}>RESULTS FOUND</Text>
              <Text style={styles.resultsNumber}>{resultsCount} Items</Text>
            </View>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.88}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create( {
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  kavWrapper: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
  },

  drawer: {
    height: SCREEN_HEIGHT * 0.78,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  dragHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginTop: 10, marginBottom: 4,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  drawerTitle: {
    fontSize: 20, fontFamily: Fonts.secondary.semiBold, color: '#1A1A1A',
  },
  clearAll: {
    fontSize: 14, fontFamily: Fonts.secondary.medium, color: PINK,
  },

  drawerBody: { flex: 1, flexDirection: 'row' },

  // Left tabs
  leftTabs: { width: 100, backgroundColor: '#F7F7F9', paddingTop: 8 },
  leftTab: {
    paddingVertical: 18, paddingHorizontal: 14,
    position: 'relative', justifyContent: 'center',
  },
  leftTabActive: { backgroundColor: '#FFFFFF' },
  leftTabText: {
    fontSize: 12, fontFamily: Fonts.secondary.medium, color: '#888888', lineHeight: 18,
  },
  leftTabTextActive: { color: PINK },
  leftTabIndicator: {
    position: 'absolute', left: 0, top: '20%', bottom: '20%',
    width: 3, borderRadius: 2, backgroundColor: PINK,
  },

  // Right panel
  rightPanel: {
    flex: 1, paddingHorizontal: 14, paddingTop: 14, backgroundColor: '#FFFFFF',
  },
  rightPanelHint: {
    fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#AAAAAA',
    marginTop: 20, textAlign: 'center',
    marginBottom: 20
  },

  // Category search
  catSearchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8,
    gap: 6, marginBottom: 10,
  },
  catSearchInput: {
    flex: 1, fontSize: 13, fontFamily: Fonts.secondary.regular,
    color: '#1A1A1A', padding: 0,
  },

  checkRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F8F8F8',
  },
  checkLabel: {
    fontSize: 14, fontFamily: Fonts.secondary.regular, color: '#1A1A1A', flex: 1,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#CCCCCC',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF',
  },
  checkboxChecked: { backgroundColor: PINK, borderColor: PINK },

  priceChipsLabel: {
    fontSize: 10, fontFamily: Fonts.secondary.bold, color: '#AAAAAA',
    letterSpacing: 0.8, marginTop: 18, marginBottom: 10,
  },
  priceChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  priceChip: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#FFFFFF',
  },
  priceChipActive: { borderColor: PINK, backgroundColor: '#FFF0F6' },
  priceChipText: { fontSize: 12, fontFamily: Fonts.secondary.medium, color: '#555555', marginTop: 3 },
  priceChipTextActive: { color: PINK, fontFamily: Fonts.secondary.bold },

  drawerFooter: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    // paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1, borderTopColor: '#F5F5F5',
    gap: 16, backgroundColor: '#FFFFFF',
  },
  resultsCount: { gap: 2 },
  resultsLabel: {
    fontSize: 9, fontFamily: Fonts.secondary.bold, color: '#AAAAAA', letterSpacing: 1,
  },
  resultsNumber: { fontSize: 18, fontFamily: Fonts.secondary.bold, color: '#1A1A1A' },
  applyBtn: {
    flex: 1, backgroundColor: PINK, borderRadius: 14,
    paddingVertical: 11, alignItems: 'center', justifyContent: 'center',
    shadowColor: PINK, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  applyBtnText: { fontSize: 16, fontFamily: Fonts.secondary.bold, color: '#FFFFFF' },
} );