import {Image, Text, View} from 'react-native';
import React from 'react';
import {formatPrice} from '../../services/utility';


const BottomRestaurantCard = ({rating, orderMethod, currency, delivery_fee, min_delivery_time, min_delivery_price, styles}) => {

    rating = parseFloat(rating / 2).toFixed(1);

    const isPickup = orderMethod === 'pickup';
    return (
        <View style={styles.bottomSection}>
            {
                !isPickup ? <React.Fragment>

                        <View style={styles.infoReview}>

                            <Image
                                source={require('./../../assets/images/restaurant/star_new_small.png')}
                                style={styles.infoIcoReview}
                            />
                            <Text style={styles.infoTextRating}>{rating}</Text>

                        </View>

                        <View style={styles.infoTransport}>
                            <Image
                                source={require('./../../assets/images/restaurant/motor_small.png')}
                                style={styles.infoIcoFirst}
                            />
                            <Text style={styles.infoText}>
                                {formatPrice(delivery_fee)} {currency}
                            </Text>
                        </View>

                        <View style={styles.infoDeliveryTime}>
                            {/* eslint-disable-next-line camelcase */}
                            <Text style={styles.infoTextClock}>{min_delivery_time} min</Text>
                            <Image
                                source={require('./../../assets/images/restaurant/time-new-small.png')}
                                style={styles.infoIcoClock}
                            />
                        </View>

                        <View style={styles.infoMinimumPrice}>
                            <Text
                                style={styles.infoTextClockMinOrder}>
                                {formatPrice(min_delivery_price)} {currency}
                            </Text>
                            <Image
                                source={require('./../../assets/images/restaurant/new-l-small.png')}
                                style={styles.infoIcoClock}
                            />
                        </View>

                    </React.Fragment>
                    : <React.Fragment>
                        <View style={styles.infoReview}>
                            <Image
                                source={require('./../../assets/images/restaurant/location_small.png')}
                                style={styles.LocInfoIco}
                            />
                            <Text style={styles.infoText}>1.5 Km</Text>
                        </View>

                        <View style={styles.infoReview}>

                            <Text style={styles.infoTextRating}>{rating}</Text>
                            <Image
                                source={require('./../../assets/images/restaurant/star_new_small.png')}
                                style={styles.infoIcoReview}
                            />
                        </View>

                        <View style={styles.infoReview}>
                            <Text style={styles.infoTextClock}>10-20 min</Text>
                            <Image
                                source={require('./../../assets/images/restaurant/time-new-small.png')}
                                style={styles.infoIcoClock}
                            />
                        </View>
                    </React.Fragment>
            }
        </View>
    );
};


export default BottomRestaurantCard;
