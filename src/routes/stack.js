import React from 'react';
import RouteNames from './names';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import Theme from '../theme';
import TabBarComponent from '../common/components/TabBarComponent';
import { connect } from 'react-redux';
import { EventRegister } from 'react-native-event-listeners';
import WelcomeScreen from '../modules/tour/screens/WelcomeScreen';
import { ChatStack, createDefaultStackNavigator, HomeStack, OrdersStack, ProfileStack, SearchStack } from '../routes';
import FastImage from 'react-native-fast-image';
import { Dimensions } from 'react-native';
import Config from '../config';

const windowWidth = Dimensions.get('window').width;

class RootStack extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount(): void {
        this.languageChangeListener = EventRegister.on('language-updated', () => {
            this.forceUpdate();
        });
    }

    componentWillUnmount(): void {
        EventRegister.removeEventListener(this.languageChangeListener);
    }

    getRoutes = () => {
        return {
            [RouteNames.HomeStack]: { screen: HomeStack },
            [RouteNames.SearchStack]: { screen: SearchStack },
            [RouteNames.ChatStack]: { screen: ChatStack },
            [RouteNames.OrdersStack]: { screen: OrdersStack },
            [RouteNames.ProfileStack]: { screen: ProfileStack },
        };
    };

    renderIcon = (source) => {
        const iconSize = (windowWidth / 5) * 0.333;
        return (
          <FastImage
            style={{ width: iconSize, height: iconSize, resizeMode: FastImage.resizeMode.contain }}
            resizeMode={FastImage.resizeMode.contain}
            source={source}
          />
        );
    };

    getTabBarIcon = ({ navigation, focused }) => {
        const { routeName } = navigation.state;
        switch (routeName) {
            case RouteNames.HomeStack:
                if (focused) {
                    return this.renderIcon(require('../common/assets/images/tabs/restaurantsactive.png'));
                }
                return this.renderIcon(require('../common/assets/images/tabs/restaurants.png'));
            case RouteNames.SearchStack:
                if (focused) {
                    return this.renderIcon(require('../common/assets/images/tabs/searchactive.png'));
                }
                return this.renderIcon(require('../common/assets/images/tabs/search.png'));
            case RouteNames.ChatStack:
                if (focused) {
                    return this.renderIcon(require('../common/assets/images/tabs/activechat.png'));
                }
                return this.renderIcon(require('../common/assets/images/tabs/chat.png'));
            case RouteNames.OrdersStack:
                if (focused) {
                    return this.renderIcon(require('../common/assets/images/tabs/ordersactive.png'));
                }
                return this.renderIcon(require('../common/assets/images/tabs/orders.png'));
            case RouteNames.ProfileStack:
                if (focused) {
                    return this.renderIcon(require('../common/assets/images/tabs/profileactive.png'));
                }
                return this.renderIcon(require('../common/assets/images/tabs/profile.png'));
            default: {
                return null;
            }
        }
    };

    getBottomTabNavigatorConfig = () => {
        return {
            defaultNavigationOptions: ({ navigation }) => ({
                tabBarIcon: ({ focused, tintColor }) => this.getTabBarIcon({ navigation, tintColor, focused }),
                tabBarLabel: () => null,
            }),
            tabBarOptions: {
                backBehavior: 'none',
                keyboardHidesTabBar: Config.isAndroid,
                labelPosition: 'below-icon',
                activeTintColor: Theme.colors.primary,
                inactiveTintColor: Theme.colors.inactiveTintColor,
                animationEnabled: true,
                tabStyle: {
                    margin: 0,
                    padding: 0,
                },
            },
            tabBarComponent: (props) => <TabBarComponent {...props} />,
        };
    };

    bottomTabs = () => {
        return createBottomTabNavigator(this.getRoutes(), this.getBottomTabNavigatorConfig());
    };

    renderNotLoggedInStack = () => {
        const NotLoggedStack = createDefaultStackNavigator(
          {
              [RouteNames.WelcomeScreen]: { screen: WelcomeScreen },
          },
          {
              headerMode: 'none',
          }
        );

        const RootStack = createAppContainer(
          createSwitchNavigator({
              [RouteNames.NotLoggedStack]: { screen: NotLoggedStack },
          })
        );

        return <RootStack />;
    };

    renderLoggedInStack = () => {
        const LoggedStack = createDefaultStackNavigator(
          {
              [RouteNames.BottomTabs]: { screen: this.bottomTabs() },
          },
          {
              headerMode: 'none',
          }
        );

        const RootStack = createAppContainer(
          createSwitchNavigator({
              [RouteNames.LoggedStack]: { screen: LoggedStack },
          })
        );

        return <RootStack />;
    };

    render() {
        const { hasLocation } = this.props;
        if (hasLocation) {
            return this.renderLoggedInStack();
        }
        return this.renderNotLoggedInStack();
    }
}

const mapStateToProps = ({ app }) => {
    return {
        hasLocation: app.hasLocation,
    };
};

export default connect(mapStateToProps, {})(RootStack);
