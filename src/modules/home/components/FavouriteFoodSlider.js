import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import styles from './../screens/styles/cart';
import {formatPrice} from '../../../common/services/utility';

class FavoriteFoodSlider extends React.Component {
    render () {
        const {product, add, currency, count} = this.props;

        return (
            <View style={{...styles.favoriteContainer, maxWidth: count > 1 ? '70%' : 'auto'}}>
                {product['image_thumbnail_path'] ? <Image
                    source={{uri: `https://snapfoodal.imgix.net/${product['image_thumbnail_path']}?w=600&h=600`}}
                    style={{
                        width: 40,
                        height: 35,
                        borderRadius: 5,
                    }}
                /> : null}
                <View style={styles.favoriteTop}>
                    <Text style={styles.favoriteTitle} numberOfLines={2} ellipsizeMode={'tail'}>
                        {product.title}
                    </Text>
                    <Text style={styles.priceStyle}>
                        {formatPrice(product.price) + ' ' + currency}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => add(product)}>
                    <Image
                        source={require('../../../common/assets/images/plus-250.png')}
                        style={{
                            width: 17,
                            height: 17,
                            resizeMode: 'contain',
                        }}
                    />
                </TouchableOpacity>

            </View>
        );
    }
}

export default FavoriteFoodSlider;
