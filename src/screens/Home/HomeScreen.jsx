// src/screens/Home/HomeScreen.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';

import { PremiumCareBanner } from './Banner';
import { HealthCategories } from './HealthCategories';
import { DealsOfTheDay } from './DealsOfTheDay';
import { CuratedBestsellers } from './CuratedBestsellers';
import { CollectionsAndBrands } from './CollectionsAndBrands';
import { FloatingChatButton } from './ChatIcon';
import { api } from '../../services/service';
import GlobalLoader from '../../components/Loader';
import CustomModal from '../../components/CustomModal';
import { useNavigation } from '@react-navigation/native';
import PrescriptionUpload from './PrescriptionUpload'
export default function HomeScreen() {
  const [ categories, setCategories ] = useState( [] );
  const [ banner, setBanner ] = useState( [] );
  const [ loading, setLoading ] = useState( true );   // initial load
  const [ refreshing, setRefreshing ] = useState( false );  // pull-to-refresh
  const [ medicines, setMedicines ] = useState( [] )
  const [ modalVisible, setModalVisible ] = useState( false )
  const navigation = useNavigation();


  const fetchHomeData = async () => {
    try {
      const [ categoriesRes, bannersRes, medicinesRes ] = await Promise.all( [
        api.post( '/categories' ),
        // api.post( '/categories?id=4' ),
        api.get( '/banners' ),
        api.get( '/deals-of-day' ),
      ] );

      // console.log('med----------- ',medicines);

      if ( categoriesRes.data?.success ) {
        // console.log('cate----------- ', categoriesRes);

        setCategories( categoriesRes.data.data );
      }
      // console.log('----------------- ', x );

      if ( bannersRes.data?.success ) {
        // console.log('-banners --------------', bannersRes);

        setBanner( bannersRes.data.data );
      }
      if ( medicinesRes?.data?.status === true ) {
        const availableMedicines = medicinesRes.data.data.filter(
          medicine => medicine.status !== 'Out of Stock'
        );

        setMedicines( availableMedicines );
      }
    } catch ( error ) {
      console.error( error );
    }
  }

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect( () => {
    const loadData = async () => {
      setLoading( true );
      await fetchHomeData();
      setLoading( false );
    };
    loadData();
  }, [] );

  // console.log('med --------- ', medicines);


  const onRefresh = useCallback( async () => {
    setRefreshing( true );
    await fetchHomeData();
    setRefreshing( false );
  }, [] );


  const showOverlay = loading;

  return (
    <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#B6005B"
            colors={[ '#B6005B' ]}
          />
        }
      >
        <PremiumCareBanner banners={banner} loading={loading} />
        <View style={{ marginTop: 13, marginBottom: -15 }}>
          <PrescriptionUpload setModalVisible={setModalVisible} />
        </View>
        {categories?.length > 0 && (
          <HealthCategories categories={categories} loading={loading} /> )}
        {medicines?.length > 0 &&

          <DealsOfTheDay medicines={medicines} setModalVisible={setModalVisible} loading={loading} />}
        <CuratedBestsellers />
        <CollectionsAndBrands />
      </ScrollView>

      <FloatingChatButton />

      <GlobalLoader visible={showOverlay} />
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