// src/screens/Search/SearchScreen.jsx

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, StatusBar, Platform, FlatList, Image, ActivityIndicator, Pressable
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fonts from '../../constant/Fonts';
import LinearGradient from 'react-native-linear-gradient';
import { api, base_api } from '../../services/service';
import useAddToCart from '../../components/CustomAddToCart';
import CustomModal from '../../components/CustomModal';
import { useSelector } from 'react-redux';
const PINK = '#B6005B';

// ─── Static UI Data ───────────────────────────────────────────────────────────
const POPULAR_SEARCHES = [
    'Diabetes Care', 'Antibiotics', 'Serum',
    'Thyroid Profile', 'Hair Care', 'Skin Care', 'Pain Relief',
];

const TRENDING_CATEGORIES = [
    {
        id: 'tc1',
        title: 'Pharmacy Essentials',
        subtitle: 'Up to 40% OFF',
        image: require( '../../assets/images/Pharmacy_img.png' ),
        navigate :'AllMedicinesScreen'
    },
    {
        id: 'tc2',
        title: 'Expert Lab\nTests',
        subtitle: null,
        image: require( '../../assets/images/Lab_tests_img.png' ),
        navigate :'AllMedicinesScreen'
    },
    {
        id: 'tc3',
        title: 'Daily\nVitamins',
        subtitle: null,
        image: require( '../../assets/images/vitamins_img.png' ),
        navigate :'AllMedicinesScreen'
    },
    {
        id: 'tc4',
        title: 'Online Consultations',
        subtitle: 'Top Specialists Available',
        image: require( '../../assets/images/online_consultation.png' ),
        navigate :'AllMedicinesScreen'
    },
];

const CARD_PALETTES = [
    { bg: '#0A1628', iconColor: '#00D4FF' },
    { bg: '#E8F4F8', iconColor: '#90CAF9' },
    { bg: '#1A1A2E', iconColor: '#FFD700' },
    { bg: '#2D1B4E', iconColor: '#CE93D8' },
    { bg: '#0D2137', iconColor: '#4DD0E1' },
    { bg: '#1B2A1B', iconColor: '#A5D6A7' },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
const getImageUri = ( image ) => {
    if ( !image ) return null;
    return image.startsWith( 'http' ) ? image : `${base_api}/${image}`;
};

// ─── Search Result Row ────────────────────────────────────────────────────────
const SearchResultRow = ( { item, query, onPress, navigation } ) => {
    const price = parseFloat( item.price ) || 0;
    const q = query.toLowerCase();
    const idx = item.name?.toLowerCase().indexOf( q ) ?? -1;
    const before = idx >= 0 ? item.name.slice( 0, idx ) : item.name;
    const match = idx >= 0 ? item.name.slice( idx, idx + query.length ) : '';
    const after = idx >= 0 ? item.name.slice( idx + query.length ) : '';
    const imageUri = getImageUri( item.image );

    return (
        <TouchableOpacity style={s.searchRow} onPress={() => onPress?.( item )} activeOpacity={0.7}>
            <View style={s.searchRowIcon}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={{ width: 28, height: 28, borderRadius: 6 }} resizeMode="cover" />
                ) : (
                    <Icon name="pill" size={17} color={PINK} />
                )}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={s.searchRowName}>
                    <Text style={s.searchNormal}>{before}</Text>
                    <Text style={s.searchMatch}>{match}</Text>
                    <Text style={s.searchNormal}>{after}</Text>
                </Text>
                <Text style={s.searchRowCat}>{item.unit_type || 'Medicine'}</Text>
            </View>
            <Text style={s.searchRowPrice}>₹{price.toFixed( 2 )}</Text>
        </TouchableOpacity>
    );
};

// ─── Trending Product Card ────────────────────────────────────────────────────
const TrendingProductCard = ( { item, index, navigation, addToCart , setModalVisible, token } ) => {
    const palette = CARD_PALETTES[ index % CARD_PALETTES.length ];
    const price = parseFloat( item.price ) || 0;
    const discount = item.discount ? `${item.discount}% OFF` : null;
    const imageUri = getImageUri( item.image );

    return (
        <Pressable onPress={() => navigation.navigate( 'ProductDetails', { medicineId: item?.id } )} style={[ s.trendCard, { backgroundColor: palette.bg } ]}>
            <View style={s.trendCardImg}>
                {imageUri ? (
                    <Image
                        source={{ uri: imageUri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                    />
                ) : (
                    <Icon name="pill" size={56} color={palette.iconColor} style={{ opacity: 0.9 }} />
                )}
                {discount && (
                    <View style={s.discountBadge}>
                        <Text style={s.discountText}>{discount}</Text>
                    </View>
                )}
            </View>
            <View style={s.trendCardInfo}>
                {item.unit_type ? (
                    <View style={s.catChip}>
                        <Text style={s.catChipText}>{item.unit_type.toUpperCase()}</Text>
                    </View>
                ) : null}
                <Text style={s.trendCardName} numberOfLines={1}>{item.name}</Text>
                <Text style={s.trendCardDesc} numberOfLines={1}>
                    {item.pack_size ? `Pack of ${item.pack_size}` : item.description?.slice( 0, 40 ) || ''}
                </Text>
                <View style={s.trendCardBottom}>
                    <Text style={s.trendCardPrice}>₹{price.toFixed( 2 )}</Text>
                    <TouchableOpacity onPress={() => token ? addToCart( item ) : setModalVisible(true)} style={s.addBtn} activeOpacity={0.85}>
                        <MaterialIcons name="add" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </Pressable>
    );
};

// ─── Trending Category Card ───────────────────────────────────────────────────
const TrendingCatCard = ( { item, style, navigation } ) => (
    <TouchableOpacity onPress={()=>navigation.navigate(item?.navigate)} style={[ s.trendCatCard, style ]} activeOpacity={0.85}>
        <Image source={item.image} style={s.trendCatImage} resizeMode="cover" />
        <LinearGradient
            colors={[ 'transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.65)', 'rgba(3,21,14,0.88)' ]}
            locations={[ 0, 0.35, 0.7, 1 ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
        />
        <View style={s.trendCatContent}>
            <Text style={s.trendCatTitle}>{item.title}</Text>
            {item.subtitle && <Text style={s.trendCatSub}>{item.subtitle}</Text>}
        </View>
    </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SearchScreen( { navigation } ) {
    const [ query, setQuery ] = useState( '' );
    const [ focused, setFocused ] = useState( false );
    const [ recents, setRecents ] = useState( [] );

    // Trending medicines (default / no-query view)
    const [ allMedicines, setAllMedicines ] = useState( [] );
    const [ loadingProducts, setLoadingProducts ] = useState( true );

    // Live search results from /medicines-search
    const [ searchResults, setSearchResults ] = useState( [] );
    const [ searching, setSearching ] = useState( false );
    const [ searchError, setSearchError ] = useState( null );

    const debounceRef = useRef( null );
    const lastQueryRef = useRef( '' ); // guards against stale responses overwriting newer ones

    const { addToCart } = useAddToCart();
    const token = useSelector( ( state ) => state.auth.token );
    const [ modalVisible, setModalVisible ] = useState( false );

    useEffect( () => {
        fetchMedicines();
    }, [] );

    const fetchMedicines = async () => {
        try {
            setLoadingProducts( true );
            const response = await api.get( '/trending-medicine' );
            const data = response?.data?.data || [];
            setAllMedicines( data );
        } catch ( error ) {
            console.error( 'Failed to fetch medicines:', error );
        } finally {
            setLoadingProducts( false );
        }
    };

   
    const searchMedicines = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) {
        setSearchResults([]);
        setSearchError(null);
        return;
    }

    lastQueryRef.current = trimmed;
    setSearching(true);
    setSearchError(null);

    try {
        const response = await api.get(`/medicines-search?medicine_name=${encodeURIComponent(trimmed)}`);

        if (lastQueryRef.current !== trimmed) return;

        const data = response?.data?.data || [];
        const results = Array.isArray(data) ? data : [data];
        const q = trimmed.toLowerCase();

        const sorted = results.sort((a, b) => {
            const aName = a.name?.toLowerCase() || '';
            const bName = b.name?.toLowerCase() || '';

            const score = (name) => {
                if (name === q) return 0;            
                if (name.startsWith(q)) return 1;     
                if (name.includes(q)) return 2;       
                return 3;                           
            };

            return score(aName) - score(bName);
        });

        setSearchResults(sorted);
    } catch (error) {
        if (lastQueryRef.current !== trimmed) return;
        console.error('Failed to search medicines:', error);
        setSearchError('Something went wrong. Please try again.');
        setSearchResults([]);
    } finally {
        if (lastQueryRef.current === trimmed) setSearching(false);
    }
};

    // Debounce search calls while typing (300ms)
    useEffect( () => {
        if ( debounceRef.current ) clearTimeout( debounceRef.current );

        if ( !query.trim() ) {
            setSearchResults( [] );
            setSearching( false );
            setSearchError( null );
            return;
        }

        debounceRef.current = setTimeout( () => {
            searchMedicines( query );
        }, 300 );

        return () => clearTimeout( debounceRef.current );
    }, [ query ] );

    // In-stock items for Trending Products section
    const trendingProducts = useMemo(
        () => allMedicines.filter( ( m ) => m.status?.toLowerCase() === 'in stock' ),
        [ allMedicines ]
    );

    const handleSelectProduct = ( item ) => {
        setQuery( item.name );
        if ( !recents.includes( item.name ) ) {
            setRecents( ( prev ) => [ item.name, ...prev ].slice( 0, 5 ) );
        }
        setTimeout( () => {
            navigation.navigate( 'ProductDetails', { medicineId: item?.id } )
            setQuery( '' )
        }, 400 )
    };

    return (
        <View style={s.screen}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

            {/* Header */}
            <View style={s.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <TouchableOpacity onPress={() => navigation?.goBack()} style={s.hIcon}>
                        <MaterialIcons name="arrow-back" size={22} color={PINK} />
                    </TouchableOpacity>
                    <Text style={s.hBrand}>Health Concierge</Text>
                </View>
            </View>

            {/* Search bar */}
            <View style={s.searchWrap}>
                <View style={[ s.searchBar, focused && s.searchBarFocused ]}>
                    <MaterialIcons name="search" size={20} color={focused ? PINK : '#AAAAAA'} style={{ marginRight: 8 , marginTop : 2 }} />
                    <TextInput
                        style={s.searchInput}
                        placeholder="Search for medicines, lab tests..."
                        placeholderTextColor="#BBBBBB"
                        value={query}
                        onChangeText={setQuery}
                        onBlur={() => setFocused( false )}
                        returnKeyType="search"
                        autoCorrect={false}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery( '' )}>
                            <MaterialIcons name="close" size={18} color="#AAAAAA" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ── Search Results ── */}
            {query.trim().length > 0 ? (
                <View style={{ flex: 1, backgroundColor: '#FFF' }}>
                    {searching ? (
                        <View style={s.loadingWrap}>
                            <ActivityIndicator size="small" color={PINK} />
                        </View>
                    ) : searchError ? (
                        <View style={s.noResults}>
                            <Icon name="alert-circle-outline" size={52} color="#E0E0E0" />
                            <Text style={s.noResultsTitle}>{searchError}</Text>
                            <TouchableOpacity onPress={() => searchMedicines( query )}>
                                <Text style={[s.actionLink, { marginTop: 8 }]}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : searchResults.length > 0 ? (
                        <FlatList
                            data={searchResults}
                            keyExtractor={( item ) => String( item.id )}
                            renderItem={( { item } ) => (
                                <SearchResultRow item={item} query={query} onPress={handleSelectProduct} />
                            )}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            ListHeaderComponent={
                                <Text style={s.resultsHeader}>
                                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
                                </Text>
                            }
                        />
                    ) : (
                        <View style={s.noResults}>
                            <Icon name="magnify-close" size={52} color="#E0E0E0" />
                            <Text style={s.noResultsTitle}>No results found</Text>
                            <Text style={s.noResultsSub}>Try different keywords</Text>
                        </View>
                    )}
                </View>
            ) : (
                /* ── Default (no query) ── */
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={s.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Recent Searches */}
                    {recents.length > 0 && (
                        <View style={s.section}>
                            <View style={s.secHeader}>
                                <Text style={s.secTitle}>Recent Searches</Text>
                                <TouchableOpacity onPress={() => setRecents( [] )}>
                                    <Text style={s.actionLink}>Clear All</Text>
                                </TouchableOpacity>
                            </View>
                            {recents.map( ( term ) => (
                                <TouchableOpacity
                                    key={term}
                                    style={s.recentRow}
                                    onPress={() => { setQuery( term ) }}
                                    activeOpacity={0.7}
                                >
                                    <Icon name="clock-outline" size={18} color="#AAAAAA" />
                                    <Text style={s.recentText}>{term}</Text>
                                </TouchableOpacity>
                            ) )}
                        </View>
                    )}

                    {/* Popular Searches */}
                    <View style={s.section}>
                        <Text style={s.secTitle}>Popular Searches</Text>
                        <View style={s.popularWrap}>
                            {POPULAR_SEARCHES.map( ( term ) => (
                                <TouchableOpacity
                                    key={term}
                                    style={s.popChip}
                                    onPress={() => setQuery( term )}
                                    activeOpacity={0.8}
                                >
                                    <Text style={s.popChipText}>{term}</Text>
                                </TouchableOpacity>
                            ) )}
                        </View>
                    </View>

                    {/* Trending Categories */}
                    <View style={s.section}>
                        <Text style={s.secTitle}>Trending Categories</Text>
                        <View style={{ gap: 10 }}>
                            <TrendingCatCard navigation={navigation} item={TRENDING_CATEGORIES[ 0 ]} style={{ height: 140 }} />
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TrendingCatCard  navigation={navigation} item={TRENDING_CATEGORIES[ 1 ]} style={{ flex: 1, height: 120 }} />
                                <TrendingCatCard  navigation={navigation} item={TRENDING_CATEGORIES[ 2 ]} style={{ flex: 1, height: 120 }} />
                            </View>
                            <TrendingCatCard  navigation={navigation} item={TRENDING_CATEGORIES[ 3 ]} style={{ height: 130 }} />
                        </View>
                    </View>

                    {/* Trending Products */}
                    <View style={s.section}>
                        <View style={s.secHeader}>
                            <Text style={s.secTitle}>Trending Products</Text>
                            <TouchableOpacity onPress={()=>navigation.navigate('AllMedicinesScreen' ,  {title : 'Trending Products' , items : allMedicines})}>
                                <Text style={s.actionLink}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        {loadingProducts ? (
                            <View style={s.loadingWrap}>
                                <ActivityIndicator size="small" color={PINK} />
                            </View>
                        ) : trendingProducts.length === 0 ? (
                            <View style={s.emptyProductsWrap}>
                                <Icon name="pill-off" size={32} color="#E0E0E0" />
                                <Text style={s.emptyProductsText}>No products available</Text>
                            </View>
                        ) : (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 14, paddingRight: 4 }}
                            >
                                {trendingProducts.map( ( item, index ) => (
                                    <TrendingProductCard key={item.id} item={item} index={index} addToCart={addToCart} token={token} setModalVisible={setModalVisible} navigation={navigation} />
                                ) )}
                            </ScrollView>
                        )}
                    </View>

                    <View style={{ height: 32 }} />
                </ScrollView>
            )}

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

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create( {
    screen: { flex: 1, backgroundColor: '#F9F9F9' },

    header: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingTop: Platform.OS === 'ios' ? 54 : 36,
        paddingBottom: 12,
    },
    hIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
    hBrand: { marginTop: 1, textAlign: 'center', fontSize: 17, fontFamily: Fonts.bold, color: PINK },

    searchWrap: {
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingBottom: 14,
        paddingTop: 4,
    },
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === 'ios' ? 13 : 13,
        borderWidth: 1.5, borderColor: '#E8E8E8',
    },
    searchBarFocused: {
        borderColor: PINK,
        shadowColor: PINK, shadowOpacity: 0.12,
        shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3,
    },
    searchInput: {
        flex: 1, fontSize: 14,
        fontFamily: Fonts.secondary.regular, color: '#1A1A1A', padding: 0,
        marginBottom : -5
    },

    resultsHeader: {
        fontSize: 12, fontFamily: Fonts.medium, color: '#AAAAAA',
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
    },
    searchRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 13,
        borderBottomWidth: 1, borderBottomColor: '#F8F8F8', gap: 12,
    },
    searchRowIcon: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: '#FFF0F6', alignItems: 'center', justifyContent: 'center',
    },
    searchRowName: { fontSize: 14, marginBottom: 2 },
    searchNormal: { fontFamily: Fonts.secondary.regular, color: '#1A1A1A' },
    searchMatch: { fontFamily: Fonts.secondary.bold, color: PINK },
    searchRowCat: { fontSize: 11, fontFamily: Fonts.secondary.regular, color: '#AAAAAA' },
    searchRowPrice: { fontSize: 14, fontFamily: Fonts.secondary.bold, color: PINK },

    noResults: {
        flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 10,
    },
    noResultsTitle: { fontSize: 16, fontFamily: Fonts.secondary.bold, color: '#1A1A1A' },
    noResultsSub: { fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#AAAAAA' },

    scrollContent: { paddingHorizontal: 16, paddingTop: 14 },

    section: { marginBottom: 28 },
    secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    secTitle: { fontSize: 20, fontFamily: Fonts.secondary.bold, color: '#1A1A1A' },
    actionLink: { fontSize: 13, fontFamily: Fonts.secondary.bold, color: PINK },

    recentRow: {
        flexDirection: 'row', alignItems: 'center', gap: 11,
        paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
    },
    recentText: { fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#1A1A1A', marginTop: 2 },

    popularWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
    popChip: {
        backgroundColor: '#F9E4EE', borderRadius: 20,
        paddingHorizontal: 16, paddingVertical: 9,
    },
    popChipText: { fontSize: 13, fontFamily: Fonts.secondary.medium, color: '#1A1A1A' , marginBottom : -3 },

    trendCatCard: { borderRadius: 16, overflow: 'hidden', position: 'relative' },
    trendCatImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
    trendCatContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 },
    trendCatTitle: { fontSize: 16, fontFamily: Fonts.secondary.medium, color: '#FFFFFF', lineHeight: 22 },
    trendCatSub: { fontSize: 12, fontFamily: Fonts.secondary.medium, color: 'rgba(255,255,255,0.90)', marginTop: 2 },

    trendCard: { width: 200, borderRadius: 18, overflow: 'hidden' },
    trendCardImg: { height: 160, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    discountBadge: {
        position: 'absolute', top: 10, left: 10,
        backgroundColor: PINK, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
    },
    discountText: { fontSize: 10, fontFamily: Fonts.secondary.bold, color: '#FFF' },
    trendCardInfo: { backgroundColor: '#FFF', padding: 14, gap: 4 },
    catChip: {
        alignSelf: 'flex-start', backgroundColor: '#F5F5F5',
        borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4,
    },
    catChipText: { fontSize: 9, fontFamily: Fonts.secondary.bold, color: '#888', letterSpacing: 0.6 },
    trendCardName: { fontSize: 15, fontFamily: Fonts.secondary.bold, color: '#1A1A1A' },
    trendCardDesc: { fontSize: 12, fontFamily: Fonts.secondary.regular, color: '#AAAAAA', marginBottom: 6 },
    trendCardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    trendCardPrice: { fontSize: 18, fontFamily: Fonts.secondary.bold, color: '#1A1A1A' },
    addBtn: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: PINK, alignItems: 'center', justifyContent: 'center',
        shadowColor: PINK, shadowOpacity: 0.35, shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 }, elevation: 4,
    },

    loadingWrap: { height: 160, alignItems: 'center', justifyContent: 'center' },
    emptyProductsWrap: { height: 100, alignItems: 'center', justifyContent: 'center', gap: 8 },
    emptyProductsText: { fontSize: 13, fontFamily: Fonts.secondary.regular, color: '#AAAAAA' },
} );