import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {calculateCartTotal, formatPrice} from '../../services/utility';
import Theme from '../../../theme';
import AppText from '../AppText';
import {translate} from '../../services/translate';
import FastImage from 'react-native-fast-image';

const RestaurantBottomCart = ({items, currency, onPress}) => {

    if (!items || items.length === 0) {
        return null;
    }

    const total = calculateCartTotal(items);

    if (total > 0) {
        return (
            <TouchableOpacity style={styles.container} onPress={onPress}>
                <View style={{flex: 7, flexDirection: 'row'}}>
                    <AppText style={{
                        paddingLeft: 10,
                        color: Theme.colors.white,
                        fontFamily: 'SanFranciscoDisplay-Bold',
                        fontSize: 15,
                    }}>{translate('restaurant_details.check_the_basket')}</AppText>
                </View>
                <View style={{flex: 2}}>
                    <AppText
                        style={{
                            paddingRight: 15,
                            color: Theme.colors.white,
                            fontFamily: 'SanFranciscoDisplay-Bold',
                            fontSize: 15,
                            textAlign: 'right'
                        }}>
                        {formatPrice(total)} {' '}
                        {currency}
                    </AppText>
                </View>
                <View style={{flex: 1}}>
                    <FastImage
                        resizeMode={FastImage.resizeMode.contain}
                        source={require('../../../common/assets/images/restaurant/checkout_cart.png')}
                        style={{width: 15, height: 15, resizeMode: 'contain'}}
                    />
                </View>

            </TouchableOpacity>
        );
    }

    return null;

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'absolute',
        bottom: 0,
        zIndex: 11,
        flexDirection: 'row',
        backgroundColor: Theme.colors.cyan2,
        alignItems: 'center',
        padding: 9,
        height: 36,
        width: '100%',
        maxHeight: 36,
    },
});

export default React.memo(RestaurantBottomCart);
