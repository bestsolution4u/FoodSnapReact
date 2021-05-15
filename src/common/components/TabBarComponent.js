import React, {PureComponent} from 'react';
import {StyleSheet} from 'react-native';
import {BottomTabBar} from 'react-navigation-tabs';
import Theme from '../../theme';
import RouteNames, {bottomLessRoutes} from '../../routes/names';
import {EventRegister} from 'react-native-event-listeners';
import {PUSH_NOTIFICATION_NEW_BLOG, PUSH_NOTIFICATION_NEW_VENDOR} from '../services/pushNotifications';

class TabBarComponent extends PureComponent {

    componentDidMount (): void {
        this.eventListener = EventRegister.addEventListener(PUSH_NOTIFICATION_NEW_VENDOR, (data) => {
            const restaurant = {
                id: data['vendor_id'],
            };
            this.props.navigation.navigate({
                routeName: RouteNames.RestaurantDetailsScreen,
                params: {
                    restaurant,
                },
                key: Math.random().toString(),
            });
        });
        this.blogListener = EventRegister.addEventListener(PUSH_NOTIFICATION_NEW_BLOG, (data) => {
            const blog = {
                id: data['blog_id'],
            };
            this.props.navigation.navigate({
                routeName: RouteNames.BlogDetailsScreen,
                params: {
                    blog,
                    backScreenView: RouteNames.BlogScreen,
                },
                key: Math.random().toString(),
            });
        });
    }

    componentWillUnmount (): void {
        EventRegister.removeEventListener(this.eventListener);
        EventRegister.removeEventListener(this.blogListener);
    }

    render () {
        const {state} = this.props.navigation;
        let currentRouteName = '';
        const currentRoute = state.routes[state.index];
        if (currentRoute.index && currentRoute.routes) {
            currentRouteName = currentRoute.routes[currentRoute.index].routeName;
        } else {
            currentRouteName = currentRoute.routeName;
        }

        if (bottomLessRoutes.includes(currentRouteName) || bottomLessRoutes.includes(currentRoute.routes[0].routeName)) {
            return null;
        }
        return <BottomTabBar {...this.props} style={styles.menu}/>;
    }

}

const styles = StyleSheet.create({
    menu: {
        backgroundColor: Theme.colors.background,
        height: 55,
        borderTopColor: Theme.colors.transparent,
        shadowColor: Theme.colors.blackPrimary,
        borderBottomWidth: 0,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default TabBarComponent;
