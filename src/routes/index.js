import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import Theme from '../theme';
import RouteNames from './names';
import Header from '../common/components/Header';

import HomeScreen from '../modules/home/screens/HomeScreen';

import SearchScreen from '../modules/search/screens/SearchScreen';

import ChatScreen from '../modules/chat/screens/ChatScreen';
import WelcomeChatScreen from '../modules/chat/screens/WelcomeChatScreen';
import OfflineContactSupportScreen from '../modules/chat/screens/OfflineContactSupportScreen';

import OrdersScreen from '../modules/orders/screens/OrdersScreen';

import ProfileScreen from '../modules/profile/screens/ProfileScreen';
import LoginScreen from '../modules/profile/screens/LoginScreen';
import RegisterScreen from '../modules/profile/screens/RegisterScreen';
import RestaurantDetailsScreen from '../modules/home/screens/RestaurantDetailsScreen';
import RestaurantProfileScreen from '../modules/home/screens/RestaurantProfileScreen';
import ProfileDetailsScreen from '../modules/profile/screens/ProfileDetailsScreen';
import ChangePasswordScreen from '../modules/profile/screens/ChangePasswordScreen';
import FavouritesScreen from '../modules/profile/screens/FavouritesScreen';
import CartScreen from '../modules/home/screens/CartScreen';
import AddressesScreen from '../modules/profile/screens/AddressesScreen';
import AddressDetailsScreen from '../modules/profile/screens/AddressDetailsScreen';
import SearchByCategoryScreen from '../modules/search/screens/SearchByCategoryScreen';
import PhoneVerificationScreen from '../modules/profile/screens/PhoneVerificationScreen';
import EditPhoneScreen from '../modules/profile/screens/EditPhoneScreen';
import BlogScreen from '../modules/profile/screens/BlogScreen';
import BlogDetailsScreen from '../modules/profile/screens/BlogDetailsScreen';
import PromotionsScreen from '../modules/profile/screens/PromotionsScreen';

const defaultHeaderObject = {
  header: (props) => <Header scene={props.scene} />,
};

export const createDefaultStackNavigator = (screensObject, customOptions) =>
  createStackNavigator(screensObject, {
    defaultNavigationOptions: { ...defaultHeaderObject },
    cardStyle: {
      backgroundColor: Theme.colors.background,
    },
    headerMode: 'screen',
    ...customOptions,
  });

export const createDefaultStackModuleNavigator = (screensObject, customOptions) =>
  createStackNavigator(screensObject, {
    defaultNavigationOptions: { ...defaultHeaderObject },
    cardStyle: {
      backgroundColor: Theme.colors.background,
    },
    headerMode: 'screen',
    ...customOptions,
  });

export const HomeStack = createDefaultStackModuleNavigator(
  {
    [RouteNames.HomeScreen]: { screen: HomeScreen },
    [RouteNames.RestaurantDetailsScreen]: { screen: RestaurantDetailsScreen },
    [RouteNames.RestaurantProfileScreen]: { screen: RestaurantProfileScreen },
    [RouteNames.CartScreen]: { screen: CartScreen },
    [RouteNames.HomeAddressDetailsScreen]: { screen: AddressDetailsScreen },
  },
  { defaultNavigationOptions: { ...defaultHeaderObject } }
);

export const SearchStack = createDefaultStackModuleNavigator(
  {
    [RouteNames.SearchScreen]: { screen: SearchScreen },
    [RouteNames.SearchRestaurantDetailsScreen]: { screen: RestaurantDetailsScreen },
    [RouteNames.SearchRestaurantProfileScreen]: { screen: RestaurantProfileScreen },
    [RouteNames.SearchCartScreen]: { screen: CartScreen },
    [RouteNames.SearchByCategoryScreen]: { screen: SearchByCategoryScreen },
  },
  { defaultNavigationOptions: { ...defaultHeaderObject } }
);

export const ChatStack = createDefaultStackModuleNavigator(
  {
    [RouteNames.WelcomeChatScreen]: { screen: WelcomeChatScreen },
    [RouteNames.ChatScreen]: { screen: ChatScreen },
    [RouteNames.OfflineContactSupportScreen]: { screen: OfflineContactSupportScreen },
  },
  { defaultNavigationOptions: { ...defaultHeaderObject } }
);

export const OrdersStack = createDefaultStackModuleNavigator(
  {
    [RouteNames.OrdersScreen]: { screen: OrdersScreen },
    [RouteNames.OrdersCartScreen]: { screen: CartScreen },
  },
  { defaultNavigationOptions: { ...defaultHeaderObject } }
);

export const ProfileStack = createDefaultStackModuleNavigator(
  {
    [RouteNames.LoginScreen]: { screen: LoginScreen },
    [RouteNames.RegisterScreen]: { screen: RegisterScreen },
    [RouteNames.PhoneVerificationScreen]: { screen: PhoneVerificationScreen },
    [RouteNames.EditPhoneScreen]: { screen: EditPhoneScreen },
    [RouteNames.ProfileScreen]: { screen: ProfileScreen },
    [RouteNames.ProfileDetailsScreen]: { screen: ProfileDetailsScreen },
    [RouteNames.ChangePasswordScreen]: { screen: ChangePasswordScreen },
    [RouteNames.FavouritesScreen]: { screen: FavouritesScreen },
    [RouteNames.AddressesScreen]: { screen: AddressesScreen },
    [RouteNames.AddressDetailsScreen]: { screen: AddressDetailsScreen },
    [RouteNames.BlogScreen]: { screen: BlogScreen },
    [RouteNames.BlogDetailsScreen]: { screen: BlogDetailsScreen },
    [RouteNames.PromotionsScreen]: { screen: PromotionsScreen },
  },
  { defaultNavigationOptions: { ...defaultHeaderObject } }
);
