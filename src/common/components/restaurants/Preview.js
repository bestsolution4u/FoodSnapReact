import React from 'react';
import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Theme from '../../../theme';
import BottomRestaurantCard from './BottomRestaurantCard';
import FastImage from 'react-native-fast-image';
import AppText from '../AppText';
import {translate} from '../../services/translate';

const {width} = Dimensions.get('window');

class Preview extends React.PureComponent {

    renderBottomBar (restaurant) {
        let currency = 'L';
        return <BottomRestaurantCard currency={currency}
                                     styles={styles}
                                     rating={restaurant['rating_interval']}
                                     delivery_fee={restaurant['delivery_fee']}
                                     min_delivery_time={restaurant['minimum_delivery_time']}
                                     min_delivery_price={restaurant['delivery_minimum_order_price']}
                                     orderMethod={restaurant['order_method']}
        />;
    };

    render () {
        const {restaurant, horizontal, onPress} = this.props;
        const innerViewStyles = [styles.backgroundInnerView];
        if (!restaurant['is_open']) {
            innerViewStyles.push({backgroundColor: 'rgba(0, 0, 0, .8)'});
        }

        return (
            <View style={[styles.restaurantCard, {width: width - (horizontal ? 60 : 20)}]}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.topSection}
                    onPress={() => {
                        onPress(restaurant.id);
                    }}>
                    <FastImage source={{uri: `https://snapfoodal.imgix.net/${restaurant['profile_path']}?w=600&h=600`}}
                               style={[styles.imageBackground]}>
                        <View style={innerViewStyles}>
                            <View style={styles.topContainer}>
                                {
                                    !restaurant['is_open'] && <View style={styles.topContainerLeft}>
                                        <View style={styles.topContainerLeftTextContainer}>
                                            <FastImage
                                                source={require('./../../assets/images/restaurant/closed-small.png')}
                                                style={styles.infoIcoFirst}/>
                                            <AppText
                                                style={styles.topContainerLeftText}>{translate('vendor_list.closed')}</AppText>
                                        </View>
                                    </View>
                                }
                                <View style={{flex: 5}}/>
                                <View style={styles.topContainerRight}>
                                    {this.props.isFavorite && (
                                        <FastImage source={require('./../../assets/images/restaurant/favorite.png')}
                                                   style={styles.topContainerRightImage}
                                        />
                                    )}
                                </View>
                            </View>

                            <View style={[styles.nameContainer, {marginTop: -5}]}>
                                <Text style={styles.title}>{restaurant.title}</Text>
                                <Text style={styles.category}>{restaurant['custom_text']}</Text>
                            </View>
                            {this.renderBottomBar(restaurant)}
                        </View>
                    </FastImage>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    restaurantCard: {
        height: 170,
        margin: 10,
        marginLeft: 0,
        marginBottom: 10,
        overflow: 'hidden',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.listBorderColor,
        borderLeftWidth: 1,
        borderLeftColor: Theme.colors.listBorderColor,
        borderRightWidth: 1,
        borderRightColor: Theme.colors.listBorderColor,
    },
    topSection: {
        flex: 6,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        overflow: 'hidden',
        // backgroundColor: 'rgba(0.5,0.5,0.5,0.5)',
        backgroundColor: 'rgba(0,0,0,.6)',
    },
    bottomSection: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
    },
    imageBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    backgroundInnerView: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, .3)',
        paddingVertical: 3,
    },
    title: {
        color: Theme.colors.white,
        fontFamily: 'SanFranciscoDisplay-Semibold',
        fontSize: 26,
    },
    topContainer: {
        flex: 1,
        flexDirection: 'row',
        // paddingTop: 3
    },
    topContainerRight: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    topContainerRightImage: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
    },
    topContainerLeft: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainerLeftTextContainer: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    topContainerLeftText: {
        padding: 5,
        color: Theme.colors.white,
        fontFamily: 'SanFranciscoDisplay-Semibold',
        fontSize: 13,
        textAlign: 'center',
    },
    bottomContainer: {
        flex: 3,
        justifyContent: 'center',
    },

    category: {
        color: Theme.colors.white,
        fontFamily: 'SanFranciscoDisplay-Medium',
        paddingTop: 5,
        fontSize: 17,
    },
    nameContainer: {
        marginTop: -55,
        flex: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    /// //////////////////////////////////
    infoText: {
        marginLeft: 5,
        color: Theme.colors.white,
        fontFamily: 'SanFranciscoDisplay-Semibold',
        fontSize: 15,
    },
    infoTextRating: {
        marginLeft: 5,
        marginRight: 2,
        color: Theme.colors.white,
        fontFamily: 'SanFranciscoDisplay-Semibold',
        fontSize: 15,
    },
    infoTextClock: {
        marginLeft: 5,
        marginRight: 2,
        color: Theme.colors.white,
        fontFamily: 'SanFranciscoDisplay-Semibold',
        fontSize: 15,
    },
    infoIco: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
    },
    infoIcoReview: {
        width: 21,
        height: 21,
        marginTop: -3,
        resizeMode: 'contain',
    },

    infoIcoFirst: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
    },
    LocInfoIco: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    infoIcoClock: {
        width: 19,
        height: 19,
        resizeMode: 'contain',
    },
    infoReview: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoPrice: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    infoTime: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    infoTransport: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoTextClockMinOrder: {
        marginLeft: 5,
        marginRight: -2,
        color: Theme.colors.white,
        fontFamily: 'SanFranciscoDisplay-Semibold',
        fontSize: 15,
    },
    infoDeliveryTime: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoMinimumPrice: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Preview;
