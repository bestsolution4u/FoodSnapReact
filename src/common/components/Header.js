import React from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import {withNavigation} from 'react-navigation';
import Theme from '../../theme';
import {isIphoneX} from '../services/utility';
import TouchableScale from './TouchableScale';
import FontelloIcon from './FontelloIcon';
import AppText from './AppText';
import {EventRegister} from 'react-native-event-listeners';
import {headerLessRoutes} from '../../routes/names';

class Header extends React.PureComponent {

    onBackIconPressed = navigation => {
        navigation.goBack();
    };

    componentDidMount (): void {
        this.languageChangeListener = EventRegister.on('language-updated', () => {
            this.forceUpdate();
        });
    }

    componentWillUnmount (): void {
        EventRegister.removeEventListener(this.languageChangeListener);
    }

    getHeaderLeft = (headerLeft, navigation, routeIndex, defaultHeaderColor, headerLeftStyle, leftTitle, headerLeftTextStyle) => {
        return (<View style={[styles.leftContainer, headerLeftStyle]}>
            {headerLeft ? headerLeft(navigation) : routeIndex > 0 && <TouchableScale
                onPress={() => {
                    this.onBackIconPressed(navigation);
                }}>
                <FontelloIcon icon="left-open" size={Theme.icons.base}
                              style={{marginRight: 25}}
                              color={defaultHeaderColor ? defaultHeaderColor : Theme.colors.text}/>
            </TouchableScale>}
            {
                !!leftTitle && <AppText style={[Theme.styles.headerTitle, headerLeftTextStyle]}>{leftTitle}</AppText>
            }
        </View>);
    };

    getTitle = (headerCenter, navigation, defaultHeaderColor, logoUrl, title, headerCenterStyle) => {
        const containerStyle = {alignItems: 'center', alignSelf: 'center'};
        if (headerCenter) {
            return headerCenter(navigation);
        }
        if (title) {
            return (<View style={[containerStyle, headerCenterStyle]}>
                <AppText style={{...Theme.styles.headerTitle, color: defaultHeaderColor}} numberOfLines={1}
                         ellipsizeMode={'tail'}>{title}</AppText>
            </View>);
        }
        return null;
    };

    getHeaderRight = (headerRight, navigation, headerRightStyle) => {
        return (
            <View style={[styles.rightContainer, headerRightStyle]}>{headerRight && headerRight(navigation)}</View>);
    };

    render () {
        const {scene, navigation, backgroundStyle, forceRender} = this.props;
        if (headerLessRoutes.includes(navigation.state.routeName) && !forceRender) {
            return null;
        }
        const {logoUrl} = this.props;
        const navigationOptions = scene ? scene.descriptor.options : forceRender ? this.props : {};
        const {headerLeft, headerLeftStyle, headerRight, headerRightStyle, headerCenter, headerCenterStyle, headerColor, headerBackgroundColor, leftTitle, headerLeftTextStyle} = navigationOptions;
        let {title} = navigationOptions;
        const routeIndex = scene ? scene.index : 0;
        let defaultHeaderColor = headerColor ? headerColor : Theme.colors.text;
        let defaultHeaderBackgroundColor = headerBackgroundColor ? headerBackgroundColor : Theme.colors.background;
        return (
            <View style={{...styles.container, backgroundColor: defaultHeaderBackgroundColor}}>
                <Animated.View style={[styles.background, backgroundStyle]}/>
                <View style={styles.headerWrapper}>
                    {this.getHeaderLeft(headerLeft, navigation, routeIndex, defaultHeaderColor, headerLeftStyle, leftTitle, headerLeftTextStyle)}
                    {
                        (headerCenter || title) && <View style={styles.titleContainer}>
                            {this.getTitle(headerCenter, navigation, defaultHeaderColor, logoUrl, title, headerCenterStyle)}
                        </View>
                    }
                    {this.getHeaderRight(headerRight, navigation, headerRightStyle)}
                </View>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        height: Theme.specifications.headerHeight + (isIphoneX() ? 44 : Theme.specifications.statusBarHeight),
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.transparent,
        shadowColor: Theme.colors.blackPrimary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerImg: {
        width: '100%',
    },
    background: {
        backgroundColor: Theme.colors.background,
    },
    headerWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: (isIphoneX() ? 44 : Theme.specifications.statusBarHeight),
    },
    leftContainer: {
        flex: 2,
        marginLeft: Theme.sizes.tiny,
        flexDirection: 'row',
        textAlign: 'center',
    },
    titleContainer: {
        overflow: 'visible',
        flex: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightContainer: {
        flex: 2,
        marginLeft: Theme.sizes.tiny,
        flexDirection: 'row-reverse',
    },
});

Header.propTypes = {
    backgroundStyle: PropTypes.any,
};

export default withNavigation(Header);

