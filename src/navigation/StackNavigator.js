// src/navigation/StackNavigator.jsx

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TabNavigator from "./TabNavigator";
import SplashScreen from '../screens/Splash/SplashScreen.jsx';
import OnBoardingScrren from '../screens/OnBoarding/OnBoardingScreen.jsx';
import LoginScreen from '../screens/Auth/Login.jsx';
import OTPVerificationScreen from '../screens/Auth/OtpVerify.jsx';
import RegisterScreen from '../screens/Auth/Register.jsx';
import ProfileUpdate from '../screens/Auth/ProfileUpdate.jsx';
import AllCategoriesScreens from '../screens/AllCategories/AllCategories.jsx';
import SingleCategoryScreen from '../screens/AllCategories/SingleCategory.jsx';
import AllMedicinesScreen from '../screens/Product/AllMedicinesScreen.jsx';
import CartScreen from "../screens/Cart/Cart.jsx";
import CheckoutScreen from '../screens/Checkout/Checkout.jsx';
import OrderConfirmed from '../components/OrderConfirmed.jsx';
import OrderHistory from '../screens/Orders/OrderHistory.jsx';
import OrderDetails from '../screens/Orders/OrderDetails.jsx';
import SaveAddressScreen from '../screens/Profile/SavedAddressesScreen.jsx';
import EditAddressScreen from '../screens/Profile/EditAddressScreen.jsx';
import ComingSoonScrren from '../components/ComingSoonScreen.jsx';
import ProductDetails from '../screens/Product/ProductDetails.jsx'
import TrackOrderScreen from '../screens/Orders/TrackOrder.jsx'
import WalletScreen from '../components/Wallet.jsx'
import ReferAndEarnScreen from '../components/ReferAndEarnScreen.jsx'
import ReferralScreen from '../components/ReferralScreen.jsx'
import FAQScreen from '../screens/Faq/Faq.jsx'

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="OnBoardingScrren" component={OnBoardingScrren} options={{
        headerShown: false,
        gestureEnabled: false,
      }} />

      <Stack.Screen name="Home" component={TabNavigator} />

      <Stack.Screen name="Login" component={LoginScreen}
        options={{ headerShown: false, title: 'Login' }} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen}
        options={{ headerShown: false, title: 'OTP Verification' }} />
      <Stack.Screen name="Register" component={RegisterScreen}
        options={{ headerShown: true }} />
      <Stack.Screen name="ReferralScreen" component={ReferralScreen}
        options={{ headerShown: false }} />
      <Stack.Screen name="UserInfo" component={ProfileUpdate}
        options={{ headerShown: false, title: 'Profile' }} />

      <Stack.Screen name="AllCategoriesScreens" component={AllCategoriesScreens}
        options={{ headerShown: false, title: 'All Categories' }} />
      <Stack.Screen name="SingleCategoryScreen" component={SingleCategoryScreen} />
      <Stack.Screen name="AllMedicinesScreen" component={AllMedicinesScreen} />
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <Stack.Screen name="OrderConfirmed" component={OrderConfirmed} />
      <Stack.Screen name="OrderHistory" component={OrderHistory} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} />
      <Stack.Screen name="SavedAddresses" component={SaveAddressScreen} />
      <Stack.Screen name="EditAddress" component={EditAddressScreen} />
      <Stack.Screen name="ComingSoonScrren" component={ComingSoonScrren} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="TrackOrderScreen" component={TrackOrderScreen} />
      <Stack.Screen name="WalletScreen" component={WalletScreen} />
      <Stack.Screen name="ReferAndEarnScreen" component={ReferAndEarnScreen} />
      <Stack.Screen name="FAQScreen" component={FAQScreen} />
    </Stack.Navigator>
  );
}