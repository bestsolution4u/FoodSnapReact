import React from 'react';
import {Dimensions, StyleSheet, TouchableOpacity, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import AppText from '../AppText';
import Theme from '../../../theme';
import {formatPrice} from '../../services/utility';

const {width} = Dimensions.get('window');

const FavouriteRestaurant = ({restaurant, onPress, lang}) => {

    return (
        <TouchableOpacity style={styles.restaurantCard} onPress={onPress}>
            <View style={styles.leftSection}>
                <FastImage
                    source={{uri: `https://snapfoodal.imgix.net/${restaurant['logo_thumbnail_path']}?w=200&h=6200`}}
                    style={styles.infoImage}/>
            </View>
            <View style={styles.rightSection}>
                <View style={styles.topSection}>
                    <AppText style={styles.title} numberOfLines={1} ellipsizeMode={'tail'}>
                        {restaurant.title}
                    </AppText>
                    <FastImage
                        source={require('./../../assets/images/restaurant/favorite.png')}
                        style={styles.topContainerRightImage}
                    />
                </View>

                <View style={styles.bottomSection}>
                    <View style={styles.infoItem}>
                        <FastImage source={require('./../../assets/images/restaurant/cmimi.png')}
                                   style={styles.infoIco}
                        />
                        <AppText style={[styles.infoText, {color: Theme.colors.cyan1}]}
                                 numberOfLines={1}
                                 ellipsizeMode={'tail'}
                        >
                            {formatPrice(restaurant.delivery_fee)} L Delivery
                            {'   '}
                        </AppText>
                    </View>
                    <View style={styles.infoItem}>
                        <FastImage
                            source={require('./../../assets/images/restaurant/ora.png')}
                            style={styles.infoIco}
                        />
                        <AppText style={styles.infoText}>
                            {' '}
                            {restaurant['minimum_delivery_time']} min
                            {'   '}
                        </AppText>
                    </View>
                    {
                        !!restaurant['food_categories'] && <View style={styles.infoItem}>
                            <FastImage
                                source={require('./../../assets/images/restaurant/info.png')}
                                style={styles.infoIco}
                            />
                            <AppText style={styles.infoText}> </AppText>
                            {
                                restaurant['food_categories'].slice(0, 1).map(item => {
                                    return (
                                        <AppText
                                            key={Math.random()
                                                .toString(36)
                                                .substring(7)}
                                            style={styles.infoText}
                                            numberOfLines={1}
                                            ellipsizeMode={'tail'}
                                        > {item[`title_${lang}`]}
                                        </AppText>
                                    );
                                })}
                        </View>
                    }

                </View>
            </View>
        </TouchableOpacity>
    );

};

const styles = StyleSheet.create({
    restaurantCard: {
        width: width - 20,
        margin: 10,
        marginBottom: 20,
        overflow: 'hidden',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.listBorderColor,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.listBorderColor,
        borderLeftWidth: 1,
        borderLeftColor: Theme.colors.listBorderColor,
        borderRightWidth: 1,
        borderRightColor: Theme.colors.listBorderColor,
        flexDirection: 'row',
    },
    leftSection: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
    },
    rightSection: {
        flex: 7,
        justifyContent: 'center',
        paddingVertical: 10,
    },
    topSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    topContainerRightImage: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
    },
    bottomSection: {
        flex: 1,
        flexDirection: 'row',
    },
    title: {
        color: Theme.colors.black,
        fontFamily: 'SanFranciscoDisplay-Bold',
        fontSize: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        color: Theme.colors.gray3,
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 12,
    },
    infoImage: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },
    infoIco: {
        width: 13,
        height: 13,
        resizeMode: 'contain',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default FavouriteRestaurant;
