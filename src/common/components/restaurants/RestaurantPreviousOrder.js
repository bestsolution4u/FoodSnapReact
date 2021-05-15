import React from 'react';
import ElevatedView from 'react-native-elevated-view';
import {ActivityIndicator, TouchableOpacity, View} from 'react-native';
import styles from './../../../modules/home/screens/styles/details';
import AppText from '../AppText';
import FastImage from 'react-native-fast-image';

import Theme from '../../../theme';
import {translate} from '../../services/translate';
import {formatPrice} from '../../services/utility';

const ITEMS_PER_ORDER = 2;

class RestaurantPreviousOrder extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            expanded: {},
        };
    }

    toggleShowMoreOrLess = (orderId) => {
        const {expanded} = this.state;
        expanded[orderId] = !expanded[orderId];
        this.setState({expanded});
    };

    render () {
        const {order, currency, onReOrder, loading} = this.props;
        const length = this.state.expanded[order.id] ? (order.products ? order.products.length : 1) : Math.min(order.products.length, ITEMS_PER_ORDER);
        let height = Math.max(15 * length, 30);

        return (
            <View>
                <ElevatedView elevation={1} style={styles.ordersContainer}>
                    <View style={{}}>
                        <View style={{flexDirection: 'row', height}}>
                            <View style={{width: '78%'}}>
                                {order.products.map((product, key) => {
                                    if (!this.state.expanded[order.id] && key > ITEMS_PER_ORDER - 1) {
                                        return null;
                                    }
                                    return <View key={product.id.toString()} style={{flexDirection: 'row'}}>
                                        <AppText
                                            style={[
                                                styles.ordersContainerLeftTitle,
                                                {color: Theme.colors.cyan1},
                                            ]}
                                        >
                                            {product.quantity}x{' '}
                                        </AppText>
                                        <View style={{flexDirection: 'column'}}>
                                            <AppText
                                                ellipsizeMode='tail'
                                                style={[styles.ordersContainerLeftTitle, {color: '#BDC3C4'}]}
                                                numberOfLines={1}
                                            >
                                                {product.title}
                                            </AppText>
                                            <View style={{flexDirection: 'row'}}>
                                                {this.props.products < 3
                                                    ? product['product_options'].slice(0, 3).map((option, optionKey) => {
                                                        return (
                                                            <AppText
                                                                style={styles.ordersContainerLeftOptionTitle}
                                                                numberOfLines={1}
                                                            >
                                                                {option.title}
                                                                {optionKey !== 2 ? ', ' : null}
                                                            </AppText>
                                                        );
                                                    })
                                                    : null}
                                            </View>
                                        </View>
                                    </View>;
                                })}
                            </View>

                            <View style={{
                                width: '22%',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-end',
                            }}>
                                <FastImage
                                    source={require('../../assets/images/restaurant/logoop.png')}
                                    style={styles.ordersContainerRightImagePrevious}
                                    resizeMode={FastImage.resizeMode.contain}
                                />
                            </View>
                        </View>
                        <View style={styles.ordersContainerLeftBottom}>
                            {
                                order.products.length > ITEMS_PER_ORDER &&
                                <TouchableOpacity onPress={() => this.toggleShowMoreOrLess(order.id)}>
                                    <AppText style={[
                                        styles.ordersContainerLeftOptionTitle,
                                        {color: 'lightblue', paddingVertical: 3},
                                    ]}>{!this.state.expanded[order.id] ? translate('see_more') : translate('see_less')}</AppText>
                                </TouchableOpacity>
                            }
                            {
                                order.products.length <= ITEMS_PER_ORDER && <AppText> </AppText>
                            }
                            <AppText style={styles.ordersContainerLeftPrice}>
                                {formatPrice(order['sub_total'])}{' '}
                                {currency}
                            </AppText>
                        </View>
                        <View>
                            <TouchableOpacity onPress={() => !loading && onReOrder(order)}
                                              style={styles.ordersContainerBottom}>
                                {
                                    !loading ? <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                        <FastImage
                                            resizeMode={FastImage.resizeMode.contain}
                                            source={require('../../assets/images/restaurant/rotate.png')}
                                            style={styles.ordersContainerBottomImage}
                                        />
                                        <AppText style={styles.ordersContainerBottomText}>
                                            {' '}
                                            {translate('reorder')}
                                        </AppText>
                                    </View> : <View style={{flex: 1, alignItems: 'center'}}>
                                        <ActivityIndicator color={Theme.colors.primary}/>
                                    </View>
                                }

                            </TouchableOpacity>
                        </View>
                    </View>
                </ElevatedView>
            </View>
        );
    }
}

export default RestaurantPreviousOrder;

