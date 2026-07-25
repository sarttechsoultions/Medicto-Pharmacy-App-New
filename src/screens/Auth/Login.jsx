import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, StatusBar, KeyboardAvoidingView,
    Platform, ScrollView, Image,ActivityIndicator
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fonts from '../../constant/Fonts';
import { api } from '../../services/service';
import Toast from 'react-native-toast-message';
import { useRoute } from '@react-navigation/native';

const Logo = () => (
    <View style={styles.logoWrap}>
        <Image source={require( '../../assets/images/medicto_logo_text.jpg.png' )} style={styles.logoImg} />
    </View>
);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen( { navigation } ) {
    const [ email, setEmail ] = useState( '' );
    const [ loading, setLoading ] = useState( false );
    const [ error, setError ] = useState( '' );
    const route = useRoute();
    
    const isOnboarding = route?.params;
    console.log('-------params ', isOnboarding);
    



    const handleEmailChange = ( text ) => {
        setEmail( text );
        if ( error ) setError( '' );
    };


    const isDisabled = !email.trim() || loading;

    const handleSendOTP = async () => {
        if ( !email.trim() ) {
            setError( 'Email is required.' );
            return;
        }

        if ( !emailRegex.test( email.trim() ) ) {
            setError( 'Please enter a valid email address.' );
            return;
        }

        setError( '' );
        setLoading( true );

        try {

            const res = await api.post( '/send-otp', { email } )

            // console.log( 'respos iiiiiiiiii ', res?.data );

            if ( res?.status === 200 ) {
                Toast.show( { type: 'success', text1: 'OTP Sent!', text2: `${res?.data?.message} - ${res?.data?.user?.otp}` } );
                // Toast.show( { type: 'success', text1: 'OTP Sent!', text2: `${res?.data?.message}` } );
                setTimeout( () => {
                    setLoading( false );
                    navigation?.navigate( 'OTPVerification', { email } );
                }, 800 );
            } else {
                console.log( 'respons eis----- ', res );

                Toast.show( { type: 'error', text1: 'Error in sending OTP!', text2: res?.data?.message } );
            }

        } catch ( err ) {

            setError( err.message || 'Something went wrong. Please try again.' );
        } finally {
            setLoading( false );
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar backgroundColor="#F7F7F9" barStyle="dark-content" />
         {isOnboarding ?  (<View style={[styles.header , {justifyContent :'flex-end' , backgroundColor :'transparent' , borderWidth : 0 ,elevation : 0}]}>
               <TouchableOpacity onPress={()=>navigation.navigate('Home')} style={{justifyContent :'center', alignItems : 'center', width : 80 , height : 30 , borderRadius : 50  , borderWidth : 1 , borderColor :'#B6005B' , marginTop : 20, marginRight :10}}> 
                  <Text style={{color :'#B6005B' , fontFamily : Fonts.medium , fontSize : 10}}>SKIP</Text>
               </TouchableOpacity>
            </View>) : (
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.hIcon}>
                        <MaterialIcons name="arrow-back" size={22} color="#DB2777" />
                    </TouchableOpacity>
                    <Text style={styles.hTitle}>Login</Text>
                </View>
               
            </View>
        )}
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >


                <Logo />

                <View style={styles.welcomeBlock}>
                    <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                    <Text style={styles.welcomeSub}>Log in to your account to continue.</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Email</Text>
                    <View style={[ styles.inputWrap, error && styles.inputWrapError ]}>
                        <TextInput
                            style={styles.input}
                            keyboardType="email-address"
                            placeholder="Enter your email"
                            placeholderTextColor="#BDBDBD"
                            value={email}
                            onChangeText={handleEmailChange}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {error ? (
                        <View style={styles.errorRow}>
                            <MaterialIcons name="error-outline" size={14} color="#D32F2F" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        style={[ styles.primaryBtn, isDisabled && styles.primaryBtnDisabled ]}
                        onPress={handleSendOTP}
                        activeOpacity={loading ? .4 : 0.85}
                        disabled={isDisabled}

                    >
                        <Text style={styles.primaryBtnText}>
                            {loading ? <ActivityIndicator size={18} color={'#fff'}/> : 'Send OTP'}
                        </Text>
                        {!loading && (
                            <MaterialIcons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 6 }} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation?.navigate('Register')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View> */}

                <Text style={styles.footer}>HEALTH CONCIERGE PREMIUM MEDICAL NETWORK</Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create( {
    flex: { flex: 1, backgroundColor: '#F7F7F9' },
    container: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingTop: 44,
        // paddingBottom: 32,
        backgroundColor: '#F7F7F9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 6,
        paddingTop: Platform.OS === 'ios' ? 54 : 36,
        paddingBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
    },
    hIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
    hTitle: { marginTop: 4, textAlign: 'center', fontSize: 16, fontFamily: Fonts.secondary.bold, color: '#DB2777' },


    // Logo
    logoWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 48,
    },
    logoImg: { width: 180, height: 50, resizeMode: 'contain' },

    // Welcome
    welcomeBlock: {
        alignItems: 'center',
        marginBottom: 36,
        width: '100%',
    },
    welcomeTitle: {
        fontSize: 24,
        fontFamily: Fonts.semiBold,
        color: '#1A1C1C',
        marginBottom: 8,
    },
    welcomeSub: {
        fontSize: 16,
        fontFamily: Fonts.medium,
        color: '#6C5964',
        textAlign: 'center',
    },

    // Form
    form: { width: '100%', marginBottom: 28 },
    label: {
        fontSize: 13,
        fontFamily: Fonts.semiBold,
        color: '#444',
        marginBottom: 8,
    },
    inputWrap: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 6,
        borderColor: '#E2BDC5'
    },
    inputWrapError: {
        borderColor: '#D32F2F',
        borderWidth: 1.5,
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 15,
        fontFamily: Fonts.regular,
        color: '#1A1A1A',
    },

    // Error
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 10,
        marginLeft: 2,
    },
    errorText: {
        fontFamily: Fonts.regular,
        color: '#D32F2F',
        fontSize: 12,
    },

    // Button
    primaryBtn: {
        marginTop: 10,
        backgroundColor: '#B6005B',
        borderRadius: 14,
        paddingVertical: 17,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#B6005B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryBtnDisabled: {
        opacity: 0.45,
        elevation: 0,
        shadowOpacity: 0,
    },
    primaryBtnText: {
        fontFamily: Fonts.bold,
        color: '#FFF',
        fontSize: 16,
        letterSpacing: 0.3,
    },

    // Sign Up
    signupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 'auto',
    },
    signupText: { fontSize: 14, fontFamily: Fonts.regular, color: '#777' },
    signupLink: { fontSize: 14, fontFamily: Fonts.bold, color: '#E91E8C' },

    // Footer
    footer: {
        fontFamily: Fonts.regular,
        fontSize: 9,
        color: '#BDBDBD',
        letterSpacing: 1.2,
        textAlign: 'center',
        marginTop: 180,
        marginBottom: 25
    },
} );