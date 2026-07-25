// src/screens/MedicineDetail/ProductDetails.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    StatusBar, Platform, Image, Dimensions, Animated, FlatList, ActivityIndicator
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Fonts from '../../constant/Fonts';
import { base_api, api, BASE_URL } from '../../services/service';
import useAddToCart from '../../components/CustomAddToCart';
import GlobalLoader from '../../components/Loader';
import { useDispatch, useSelector } from 'react-redux';
import CustomModal from '../../components/CustomModal';
import { Share, Linking } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';


const { width: SCREEN_W } = Dimensions.get( 'window' );
const PINK = '#B6005B';
const PINK_LIGHT = '#FFF0F6';

const getImageUri = ( image ) => `${base_api}${image}`;
const discountedPrice = ( price, discount ) => {
    const p = parseFloat( price ) || 0;
    const d = parseFloat( discount ) || 0;
    return p - ( p * d ) / 100;
};

const getMedicineImages = ( medicine ) => {
    if ( !medicine ) return [];

    let gallery = [];
    if ( medicine?.medicine_image ) {
        try {
            const parsed = JSON.parse( medicine?.medicine_image );
            if ( Array.isArray( parsed ) ) {
                gallery = parsed.filter( Boolean );
            } else if ( typeof parsed === 'string' ) {
                gallery = [ parsed ];
            }
        } catch {
            // Not JSON — treat as a single path
            if ( typeof medicine.medicine_image === 'string' && medicine.medicine_image.trim() ) {
                gallery = [ medicine.medicine_image ];
            }
        }
    }

    if ( gallery.length === 0 && medicine.image ) {
        gallery = [ medicine.image ];
    }

    return gallery;
};

const Toast = ( { message, visible, type = 'success' } ) => {
    const opacAnim = useRef( new Animated.Value( 0 ) ).current;
    const slideAnim = useRef( new Animated.Value( 30 ) ).current;

    useEffect( () => {
        if ( visible ) {
            Animated.parallel( [
                Animated.timing( opacAnim, { toValue: 1, duration: 250, useNativeDriver: true } ),
                Animated.spring( slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 } ),
            ] ).start();
        } else {
            Animated.parallel( [
                Animated.timing( opacAnim, { toValue: 0, duration: 200, useNativeDriver: true } ),
                Animated.timing( slideAnim, { toValue: 30, duration: 200, useNativeDriver: true } ),
            ] ).start();
        }
    }, [ visible ] );

    const bgColor = type === 'success' ? '#1C8A4E' : '#555555';
    const iconName = type === 'success' ? 'heart' : 'heart-outline';

    return (
        <Animated.View
            style={[
                toastStyles.wrap,
                { backgroundColor: bgColor, opacity: opacAnim, transform: [ { translateY: slideAnim } ] },
            ]}
            pointerEvents="none"
        >
            <Icon name={iconName} size={16} color="#FFF" />
            <Text style={toastStyles.text}>{message}</Text>
        </Animated.View>
    );
};

const toastStyles = StyleSheet.create( {
    wrap: {
        position: 'absolute',
        bottom: 110,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 24,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    text: {
        color: '#FFF',
        fontSize: 13,
        fontFamily: Fonts.secondary?.bold || Fonts.bold,
    },
} );

const StarRating = ( { rating = 4.3, reviews = 0 } ) => (
    <View style={styles.starRow}>
        {[ 1, 2, 3, 4, 5 ].map( ( i ) => (
            <MaterialIcons
                key={i}
                name={i <= Math.floor( rating ) ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-border'}
                size={20}
                color="green"
            />
        ) )}
        <View style={styles.ratingBadge}>
            <MaterialIcons name="star" size={13} color="#fff" />
            <Text style={styles.ratingBadgeText}>{rating?.toFixed( 1 )}</Text>
        </View>
        <Text style={styles.reviewCount}>({reviews} Reviews)</Text>
    </View>
);


const TabBtn = ( { label, active, onPress } ) => (
    <TouchableOpacity
        onPress={onPress}
        style={[ styles.tabBtn, active && styles.tabBtnActive ]}
        activeOpacity={0.75}
    >
        <Text style={[ styles.tabBtnText, active && styles.tabBtnTextActive ]}>{label}</Text>
    </TouchableOpacity>
);

// ─── BulletPoint ──────────────────────────────────────────────────────────────
const BulletPoint = ( { text } ) => (
    <View style={styles.bulletRow}>
        <View style={styles.bulletIcon}>
            <Icon name="check-circle" size={20} color={PINK} />
        </View>
        <Text style={styles.bulletText}>{text}</Text>
    </View>
);

// ─── BenefitRow ───────────────────────────────────────────────────────────────
const BenefitRow = ( { label, value, last } ) => (
    <View style={[ styles.benefitRow, !last && styles.benefitRowBorder ]}>
        <Text style={styles.benefitLabel}>{label}</Text>
        <Text style={styles.benefitValue}>{value}</Text>
    </View>
);

// ─── FBTCard ──────────────────────────────────────────────────────────────────
const FBTCard = ( { item, onPress, token, setModalVisible } ) => {
    const { addToCart } = useAddToCart();
    const imageUri = getImageUri( item.image );
    const price = parseFloat( item.price ) || 0;
    return (
        <TouchableOpacity style={styles.fbtCard} onPress={() => onPress( item )} activeOpacity={0.85}>
            <View style={styles.fbtImageWrap}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.fbtImage} resizeMode="cover" />
                ) : (
                    <View style={[ styles.fbtImage, { backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' } ]}>
                        <Icon name="pill" size={32} color="#CCC" />
                    </View>
                )}
            </View>
            <View style={styles.fbtInfo}>
                {item?.unit_type && <Text style={styles.fbtCategory}>{item.unit_type.toUpperCase()}</Text>}
                <Text style={styles.fbtName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.fbtBottom}>
                    <Text style={styles.fbtPrice}>₹{price.toFixed( 2 )}</Text>
                    <TouchableOpacity
                        style={styles.fbtAddBtn}
                        onPress={() => token ? addToCart( item ) : setModalVisible( true )}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="add" size={18} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ─── ImageCarousel ────────────────────────────────────────────────────────────
// Auto-sliding carousel for the hero product images with dot indicators.
const HERO_W = SCREEN_W - 30;

const ImageCarousel = ( { images } ) => {
    const [ activeIndex, setActiveIndex ] = useState( 0 );
    const carouselRef = useRef( null );

    if ( images.length === 0 ) {
        return (
            <LinearGradient colors={[ '#FFB8C8', '#FF8FAB' ]} style={styles.heroBg}>
                <View style={styles.heroPlaceholder}>
                    <Icon name="pill" size={80} color="rgba(255,255,255,0.6)" />
                </View>
            </LinearGradient>
        );
    }

    if ( images.length === 1 ) {
        return (
            <View style={styles.heroBg}>
                <Image
                    source={{ uri: getImageUri( images[ 0 ] ) }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />
            </View>
        );
    }

    return (
        <View style={styles.heroBg}>
            <Carousel
                ref={carouselRef}
                width={HERO_W}
                height={280}
                data={images}
                loop={true}
                autoPlay={true}
                autoPlayInterval={3000}
                scrollAnimationDuration={700}
                pagingEnabled
                onSnapToItem={( index ) => setActiveIndex( index )}
                renderItem={( { item } ) => (
                    <Image
                        source={{ uri: getImageUri( item ) }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                )}
            />

            <View style={styles.dotsRow}>
               {images.length > 1 && (
                <View style={styles.dotsWrapper}>
                    <View style={styles.dotsRow}>
                        {images.map( ( _, i ) => (
                            <View
                                key={i}
                                style={[ styles.dot, i === activeIndex && styles.dotActive ]}
                            />
                        ) )}
                    </View>
                </View>
            )}
            </View>
        </View>
    );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProductDetails( { route, navigation } ) {
    const medicineId = route?.params?.medicineId || route?.params?.medicine?.id;

    const [ medicine, setMedicine ] = useState( null );
    const [ fbtProducts, setFbtProducts ] = useState( [] );
    const [ isFav, setIsFav ] = useState( false );
    const [ favLoading, setFavLoading ] = useState( false );
    const [ pageLoading, setPageLoading ] = useState( true );
    const [ actionLoading, setActionLoading ] = useState( false );
    const [ error, setError ] = useState( null );
    const [ activeTab, setActiveTab ] = useState( 'Description' );
    const [ qty, setQty ] = useState( 1 );
    const [ modalVisible, setModalVisible ] = useState( false );
    const user = useSelector((state) => state.auth.user);  

    // console.log('user is ------------- ', user);
    
    // ── Toast state ──────────────────────────────────────────────────────────
    const [ toastVisible, setToastVisible ] = useState( false );
    const [ toastMessage, setToastMessage ] = useState( '' );
    const [ toastType, setToastType ] = useState( 'success' );
    const toastTimer = useRef( null );

    const [ addingToCart, setAddingToCart ] = useState( false );
    const [ buyingNow, setBuyingNow ] = useState( false );

    const token = useSelector( ( s ) => s.auth.token );
    const { addToCart } = useAddToCart();

    // ── Show toast helper ────────────────────────────────────────────────────
    const showToast = ( message, type = 'success' ) => {
        clearTimeout( toastTimer.current );
        setToastMessage( message );
        setToastType( type );
        setToastVisible( true );
        toastTimer.current = setTimeout( () => setToastVisible( false ), 2800 );
    };


    const handleShare = async () => {
        try {
            const productName = medicine?.name ?? 'Medicine';
            const productPrice = discountedPrice( medicine?.price, medicine?.discount ).toFixed( 2 );
            const productDesc = medicine?.description
                ? medicine.description.slice( 0, 100 ) + '...'
                : '';

            const deepLink = `medictopharmacy://medicine/${medicine?.id}`;

            const message =
                `🏥 *${productName}*\n` +
                `💊 ${productDesc}\n` +
                `💰 Price: ₹${productPrice}\n\n` +
                `📲 Open in Medicto Pharmacy app:\n${deepLink}\n\n` +
                `_Don't have the app? Download from Play Store:_\n` +
                `https://play.google.com/store/apps/details?id=com.medictopharmacy`;

            await Share.share(
                {
                    title: productName,
                    message: Platform.OS === 'android' ? message : productDesc,
                    url: Platform.OS === 'ios' ? deepLink : undefined,
                },
                {
                    dialogTitle: `Share ${productName}`,
                    subject: `Check out ${productName} on Medicto Pharmacy`,
                }
            );
        } catch ( err ) {
            console.log( 'Share error:', err );
        }
    };



    const fetchAddressCount = async () => {
        try {
            const res = await api.get( '/addresses' );
            const payload = res.data?.address ?? res.data?.data ?? res.data;
            const arr = Array.isArray( payload ) ? payload : ( payload?.id ? [ payload ] : [] );
            return arr.length;
        } catch {
            return 0;
        }
    };

  const handleAddToCart = async () => {
    if ( !token ) { setModalVisible( true ); return; }
    if ( !inStock ) { showToast( 'This item is out of stock.', 'remove' ); return; }  // ← add
    setAddingToCart( true );
    try {
        await addToCart( medicine );
        showToast( 'Added to cart!', 'success' );
    } catch {
        showToast( 'Failed to add to cart.', 'remove' );
    } finally {
        setAddingToCart( false );
    }
};

    // const handleAddToCart2 = async ( med ) => {
    //     setActionLoading( true );
    //     try { await addToCart( med ); } finally { setActionLoading( false ); }
    // };


    const handleBuyNow = async () => {
        if ( !token ) { setModalVisible( true ); return; }
        if ( !inStock ) { showToast( 'This item is out of stock.', 'remove' ); return; }
        setBuyingNow( true );

        try {
            // Build single item directly — no cart involved
            const finalPrice = discountedPrice( medicine.price, medicine.discount );

            const buyNowItems = [ {
                cartId: null,                          // no cart id needed
                id: medicine.id,
                qty: qty,                           // uses the qty state (default 1)
                name: medicine.name ?? 'Unknown',
                desc: `${medicine.unit_type ?? ''} • ${medicine.pack_size ?? ''} qty`,
                price: finalPrice,
                rawPrice: parseFloat( medicine.price ) || 0,
                discountPct: parseFloat( medicine.discount ) || 0,
                image: medicine.image ? `${base_api}${medicine.image}` : null,
                status: medicine.status ?? 'In Stock',
                stock: Number( medicine.quantity ) || 0,
            } ];

            const totalAmount = buyNowItems.reduce(
                ( sum, i ) => sum + ( i.price ?? 0 ) * ( i.qty ?? 1 ), 0
            );

            // Check address count
            const addressCount = await fetchAddressCount();

            if ( addressCount <= 0 ) {
                navigation.navigate( 'EditAddress', {
                    address: null,
                    mode: 'add',
                    fromCart: true,
                    cartItems: buyNowItems,
                    totalAmount,
                } );
            } else {
                navigation.navigate( 'CheckoutScreen', {
                    cartItems: buyNowItems,
                    totalAmount,
                } );
            }

        } catch ( err ) {
            console.log( 'Buy Now error:', err );
            showToast( 'Something went wrong. Try again.', 'remove' );
        } finally {
            setBuyingNow( false );
        }
    };
    useEffect( () => {
        if ( !medicineId ) {
            setError( 'No medicine ID provided.' );
            setPageLoading( false );
            return;
        }
        fetchMedicineDetail();
        // fetchFBTProducts();
        return () => clearTimeout( toastTimer.current );
    }, [ medicineId ] );

    const fetchMedicineDetail = async () => {
        try {
            setPageLoading( true );
            // console.log('med id is --------- ', medicineId);

            const response = await api.post( `/medicines`, { id: medicineId , coustmer_id : user?.id } );
            // console.log( 'response is -------- ', response?.data );

            if ( response?.data?.success && response.data ) {
                const data = response.data?.data;
                setMedicine( data );
                // console.log('-is fav data -------------- ', data);

                setIsFav( data?.is_favourite === true ? true : false );
            } else {
                setError( 'Failed to load medicine details.' );
            }
        } catch ( err ) {
            setError( 'Network error. Please try again.' );
        } finally {
            setPageLoading( false );
        }
    };


    // ── Toggle favourite ────────────────────────────────────────────────────
    const handleToggleFav = async () => {
        if ( !token ) { setModalVisible( true ); return; }
        if ( favLoading ) return;

        setFavLoading( true );
        const newFav = !isFav;
        setIsFav( newFav );

        try {
            const res1 = await api.post( '/medicine-favourite', { medicine_id: medicineId } );
            // console.log( 'res fav-------- ', res1 );

            const res = await api.post( `/medicines`, { id: medicineId } );
           

            if ( res.status === 200 ) {
                const data = res1.data;

                const data2 = res.data?.data;
                // console.log( 'res ---------- ', data2 );

                setMedicine( data2 );
                setIsFav( !!data?.is_favourite );
                showToast(
                    data?.is_favourite ? 'Added to favourites ♥' : 'Removed from favourites',
                    data?.is_favourite ? 'success' : 'remove',
                );
            }
        } catch {
            setIsFav( !newFav );
            showToast( 'Something went wrong. Try again.', 'remove' );
        } finally {
            setFavLoading( false );
        }
    };

    const handleFBTPress = ( item ) => navigation?.push( 'ProductDetails', { medicineId: item.id } );


    // ── Guards ───────────────────────────────────────────────────────────────
    if ( pageLoading ) {
        return <View style={styles.centered}><GlobalLoader visible={true} /></View>;
    }
    if ( error || !medicine ) {
        return (
            <View style={styles.centered}>
                <Icon name="alert-circle-outline" size={48} color={PINK} />
                <Text style={styles.errorText}>{error || 'Medicine not found.'}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={fetchMedicineDetail}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const originalPrice = parseFloat( medicine.price ) || 0;
    const discount = parseFloat( medicine.discount ) || 0;
    const finalPrice = discountedPrice( medicine.price, medicine.discount );
    const heroImages = getMedicineImages( medicine );
    const inStock = Number( medicine.quantity ) > 0; 
    const TABS = [ 'Description', 'Composition', 'Usage', 'Side Effects', 'Manufacturer' ];

    const renderTabContent = () => {
        switch ( activeTab ) {
            case 'Description': return (
                <View>
                    <Text style={styles.tabContent}>{medicine.description || 'No description available.'}</Text>
                    {medicine.benefits?.map( ( b, i ) => <BulletPoint key={i} text={b} /> )}
                </View>
            );
            case 'Usage': return <Text style={styles.tabContent}>{medicine.usage_instructions || 'Usage instructions not available.'}</Text>;
            case 'Manufacturer': return <Text style={styles.tabContent}>{medicine.manufacturer || 'Manufacturer information not available.'}</Text>;
            case 'Composition': return <Text style={styles.tabContent}>{medicine.composition || 'Composition details not available.'}</Text>;
            case 'Side Effects': return <Text style={styles.tabContent}>{medicine.side_effects || 'Side effects information not available.'}</Text>;
            default: return null;
        }
    };

    const dosageChips = [ medicine.pack_size, medicine.strength, medicine.unit_type, medicine.dosage_form ].filter( Boolean );

    return (
        <View style={styles.screen}>
            <StatusBar backgroundColor="#FFF" barStyle="dark-content" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.hBtn}>
                    <MaterialIcons name="arrow-back" size={22} color="#B6005B" />
                </TouchableOpacity>
                <View style={styles.hRight}>
                    <TouchableOpacity onPress={handleShare} style={styles.hBtn}>
                        <MaterialIcons name="share" size={22} color="#B6005B" />
                    </TouchableOpacity>

                    {/* ── Favourite button ── */}
                    <TouchableOpacity
                        style={styles.hBtn}
                        onPress={handleToggleFav}
                        disabled={favLoading}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons
                            name={isFav ? 'favorite' : 'favorite-border'}
                            size={22}
                            color={isFav ? PINK : '#B6005B'}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

                {/* ── Hero Image Carousel ── */}
                <View style={styles.heroWrap}>
                    <ImageCarousel images={heroImages} />
                </View>

                {/* ── Product Info ── */}
                <View style={styles.infoWrap}>
                    <Text style={styles.categoryLabel}>{medicine.unit_type || 'Medicine'}</Text>
                    <Text style={styles.productName}>{medicine.name}</Text>
                    {/* <StarRating rating={medicine.rating || 4.5} reviews={medicine.reviews || 100} /> */}
                    <StarRating rating={Number(medicine.reviews_avg_rating) || 4.5} reviews={medicine.reviews_count || 0} />
                    <View style={styles.priceRow}>
                        <Text style={styles.finalPrice}>₹{finalPrice.toFixed( 2 )}</Text>
                        {discount > 0 && (
                            <View style={styles.priceRight}>
                                <Text style={styles.strikePrice}>₹{originalPrice.toFixed( 2 )}</Text>
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>{discount}% OFF</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {medicine?.status && (
                        <View style={[styles.statusBadge, medicine.status === 'In Stock' ? styles.inStock : styles.outOfStock]}>
                            <Text style={[styles.statusText, medicine.status === 'In Stock' ? styles.inStockText : styles.outOfStockText]}>
                                {medicine?.status}
                            </Text>
                        </View>
                    )}
                </View>

                {/* ── Quick Dosage ── */}
                {dosageChips.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Quick Dosage</Text>
                        <View style={styles.chipRow}>
                            {dosageChips.map( ( v, i ) => (
                                <View key={i} style={styles.infoChip}>
                                    <Text style={styles.infoChipText}>{v}</Text>
                                </View>
                            ) )}
                        </View>
                        <View style={styles.verifiedRow}>
                            <Icon name="shield-check" size={18} color={PINK} />
                            <Text style={styles.verifiedText}>
                                Verified by Clinical Curator Health Panel. Quality assured for premium standards.
                            </Text>
                        </View>
                    </View>
                )}

                {/* ── Description Tabs ── */}
                <View style={styles.tabsWrap}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                        {TABS.map( ( tab ) => (
                            <TabBtn key={tab} label={tab} active={activeTab === tab} onPress={() => setActiveTab( tab )} />
                        ) )}
                    </ScrollView>
                    <View style={styles.tabContentWrap}>{renderTabContent()}</View>
                </View>

                {/* ── Key Benefits / Product Details ── */}
                {medicine.key_benefits?.length > 0 ? (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Key Benefits</Text>
                        {medicine.key_benefits.map( ( b, i ) => (
                            <BenefitRow key={i} label={b.label} value={b.value} last={i === medicine.key_benefits.length - 1} />
                        ) )}
                    </View>
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Product Details</Text>
                        {[
                            medicine.batch_no && { label: 'Batch No', value: medicine.batch_no },
                            medicine.quantity && { label: 'Available Quantity', value: medicine.quantity },
                            medicine.reorder_level && { label: 'Reorder Level', value: medicine.reorder_level },
                            medicine.expiry_date && { label: 'Expiry Date', value: medicine.expiry_date },
                            medicine.manufacture_date && { label: 'Manufacture Date', value: medicine.manufacture_date },
                        ].filter( Boolean ).map( ( b, i, arr ) => (
                            <BenefitRow key={i} label={b.label} value={b.value} last={i === arr.length - 1} />
                        ) )}
                    </View>
                )}
            </ScrollView>

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[ styles.addToCartBtn, addingToCart && { opacity: 0.7 } , !inStock && styles.disabledBtn ]}
                    onPress={handleAddToCart}
                    activeOpacity={0.85}
                    disabled={addingToCart || buyingNow || !inStock}
                >
                    {addingToCart ? (
                        <ActivityIndicator size="small" color={PINK} />
                    ) : (
                        <>
                            <Icon name="cart-plus" size={20} color={PINK} />
                            <Text style={styles.addToCartText}>Add to Cart</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[ styles.buyNowBtn, buyingNow && { opacity: 0.7 } ,   !inStock && styles.disabledBtn ]}
                    onPress={handleBuyNow}
                    activeOpacity={0.85}
                    disabled={addingToCart || buyingNow ||  !inStock}
                >
                    {buyingNow ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <>
                            <Icon name="shopping" size={20} color="#FFF" />
                            <Text style={styles.buyNowText}>Buy Now</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* ── Action overlay loader ── */}
            {actionLoading && (
                <View style={styles.loaderOverlay}>
                    <GlobalLoader visible={true} />
                </View>
            )}

            {/* ── Toast notification ── */}
            <Toast message={toastMessage} visible={toastVisible} type={toastType} />

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
const styles = StyleSheet.create( {
    screen: { flex: 1, backgroundColor: '#FFFFFF' },

    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#FFF' },
    errorText: { fontSize: 14, color: '#555', textAlign: 'center', paddingHorizontal: 32, fontFamily: Fonts.secondary?.regular || Fonts.secondary },
    retryBtn: { marginTop: 8, backgroundColor: PINK, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 10 },
    retryText: { color: '#FFF', fontSize: 14, fontFamily: Fonts.secondary?.bold || Fonts.bold },

    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.55)',
        alignItems: 'center', justifyContent: 'center', zIndex: 999,
    },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingTop: Platform.OS === 'ios' ? 54 : 36,
        paddingBottom: 10,
        backgroundColor: '#FFF',
    },
    hBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
    hRight: { flexDirection: 'row', gap: 2 },

    heroWrap: { paddingHorizontal: 16, paddingBottom: 8 },
    heroBg: {
        borderRadius: 20, height: 290, width: SCREEN_W - 30,
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
       
    },
    heroImage: { width: SCREEN_W - 30, height: 260 , borderRadius : 20},
    heroPlaceholder: { alignItems: 'center', justifyContent: 'center', flex: 1 },

    // Carousel dot indicators
    dotsRow: {
        position: 'absolute', bottom: 12, left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6,
    },
    dot: {
        width: 7, height: 7, borderRadius: 3.5,
        backgroundColor: 'rgba(187, 187, 187, 0.86)',
    },
    dotActive: {
        backgroundColor: '#FFF',
        width: 18, borderRadius: 3.5,
    },

    infoWrap: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
    categoryLabel: {
        fontSize: 11, fontFamily: Fonts.secondary?.bold || Fonts.bold,
        color: PINK, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
    },
    productName: {
        fontSize: 22, fontFamily: Fonts.secondary?.bold || Fonts.bold,
        color: '#1A1A1A', lineHeight: 30, marginBottom: 8,
    },
    starRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 14 },
    reviewCount: { fontSize: 12, fontFamily: Fonts.secondary?.regular || Fonts.secondary, color: '#888', marginLeft: 4, marginTop: 4 },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    finalPrice: { fontSize: 28, fontFamily: Fonts.secondary?.bold || Fonts.bold, color: '#1A1A1A' },
    priceRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    strikePrice: { fontSize: 15, fontFamily: Fonts.secondary?.regular || Fonts.secondary, color: '#AAAAAA', textDecorationLine: 'line-through' },
    discountBadge: { backgroundColor: PINK_LIGHT, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    discountText: { fontSize: 11, marginTop: 3, fontFamily: Fonts.secondary?.bold || Fonts.bold, color: PINK },
    statusBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
    inStock: { backgroundColor: '#E8F5E9' },
    outOfStock: { backgroundColor: '#FFEBEE' },
    statusText: { fontSize: 12, fontFamily: Fonts.secondary?.bold || Fonts.bold },
    inStockText: { color: '#2E7D32' },
    outOfStockText: { color: '#C62828' },

    card: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#F9F9F9', borderRadius: 16, padding: 16 },
    cardTitle: { fontSize: 15, fontFamily: Fonts.secondary?.bold || Fonts.bold, color: '#1A1A1A', marginBottom: 12 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
    infoChip: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#FFF' },
    infoChipText: { fontSize: 12, marginBottom: -2, fontFamily: Fonts.secondary?.medium || Fonts.secondary, color: '#333' },
    verifiedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#F0E0E8' },
    verifiedText: { flex: 1, fontSize: 12, fontFamily: Fonts.secondary?.regular || Fonts.secondary, color: '#555', lineHeight: 18 },

    tabsWrap: { marginTop: 16 },
    tabsScroll: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
    tabBtn: { borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 9 },
    tabBtnActive: { backgroundColor: PINK, borderColor: PINK },
    tabBtnText: { fontSize: 13, marginBottom: -3, fontFamily: Fonts.secondary?.medium || Fonts.secondary, color: '#555' },
    tabBtnTextActive: { color: '#FFF', fontFamily: Fonts.secondary?.bold || Fonts.bold },
    tabContentWrap: { paddingHorizontal: 16, paddingTop: 16 },
    tabContent: { fontSize: 14, fontFamily: Fonts.secondary?.regular || Fonts.secondary, color: '#444', lineHeight: 22 },
    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 12 },
    bulletIcon: { marginTop: 1 },
    bulletText: { flex: 1, fontSize: 14, fontFamily: Fonts.secondary?.regular || Fonts.secondary, color: '#333', lineHeight: 21 },

    benefitRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
    benefitRowBorder: { borderBottomWidth: 1, borderBottomColor: '#EFEFEF' },
    benefitLabel: { fontSize: 13, fontFamily: Fonts.secondary?.regular || Fonts.secondary, color: '#777' },
    benefitValue: { fontSize: 13, fontFamily: Fonts.secondary?.bold || Fonts.bold, color: '#1A1A1A' },

    fbtSection: { marginTop: 28, paddingBottom: 30 },
    secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, marginBottom: 16 },
    secTitle: { fontSize: 20, fontFamily: Fonts.secondary?.bold || Fonts.bold, color: '#1A1A1A', lineHeight: 28 },
    seeAll: { fontSize: 13, fontFamily: Fonts.secondary?.bold || Fonts.bold, color: PINK, marginTop: 4 },
    fbtCard: { width: 180, borderRadius: 16, marginBottom: 10, overflow: 'hidden', backgroundColor: '#FFF', marginLeft: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
    fbtImageWrap: { height: 140 },
    fbtImage: { width: '100%', height: '100%' },
    fbtInfo: { padding: 10, gap: 3 },
    fbtCategory: { fontSize: 9, fontFamily: Fonts.secondary?.bold || Fonts.bold, color: PINK, letterSpacing: 0.8 },
    fbtName: { fontSize: 13, fontFamily: Fonts.secondary?.bold || Fonts.bold, color: '#1A1A1A', lineHeight: 18 },
    fbtBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
    fbtPrice: { fontSize: 15, fontFamily: Fonts.secondary?.bold || Fonts.bold, color: '#1A1A1A' },
    fbtAddBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: PINK, alignItems: 'center', justifyContent: 'center' },

    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', gap: 12,
        paddingHorizontal: 16, paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 28 : 16,
        backgroundColor: '#FFF',
        borderTopWidth: 1, borderTopColor: '#F0F0F0',
    },
    addToCartBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        borderWidth: 1.5, borderColor: PINK, borderRadius: 14, paddingVertical: 14,
    },
    addToCartText: { marginBottom: -3, fontSize: 15, fontFamily: Fonts.secondary?.bold || Fonts.bold, color: PINK },
    buyNowBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: PINK, borderRadius: 14, paddingVertical: 14,
    },
    buyNowText: { marginBottom: -3, fontSize: 15, fontFamily: Fonts.secondary?.bold || Fonts.bold, color: '#FFF' },
    ratingBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        backgroundColor: '#2E7D32',
        borderRadius: 8,
        paddingHorizontal: 7,
        paddingVertical: 3,
        marginLeft: 4,
    },
    ratingBadgeText: {
        fontSize: 12,
        fontFamily: Fonts.secondary?.bold || Fonts.bold,
        color: '#fff',
        marginBottom: -2,
    },
    disabledBtn: {
    opacity: 0.5,
    borderColor: '#CCCCCC',
    backgroundColor: '#F0F0F0', 
   },
   dotsWrapper: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        // backgroundColor: 'rgba(0,0,0,0.35)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: 'rgba(189, 189, 189, 0.93)',
    },
    dotActive: {
        backgroundColor: '#1A1A1A',
        width: 18,
        borderRadius: 3.5,
    },

} );