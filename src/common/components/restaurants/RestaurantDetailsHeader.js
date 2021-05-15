import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Theme from '../../../theme';
import {translate} from '../../services/translate';
import RestaurantRating from './RestaurantRating';
import FastImage from 'react-native-fast-image';
import AppText from '../AppText';
import {formatPrice} from '../../services/utility';

const {width} = Dimensions.get('window');

const RestaurantDetailsHeader = ({restaurant, orderMethod, currency = 'L'}) => {

    const isPickup = orderMethod === 'pickup';

    //TODO
    const renderPickup = () => {
        return <React.Fragment>

            <View style={styles.pickupInfo}>

                <FastImage source={require('./../../assets/images/restaurant/ora.png')}
                           style={styles.PickupInfoIcon}
                />
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <AppText style={[styles.infoTitle, {marginLeft: 3}]}>
                        {restaurant.min_delivery_time}-{restaurant.max_delivery_time}
                    </AppText>
                    <AppText style={[styles.infoTitle, {marginLeft: 3}]}>
                        {translate('vendor_profile.minutes_average')}
                    </AppText>
                </View>


            </View>

            <View style={styles.pickupInfo}>

                <Image
                    source={require('./../../assets/images/location/loc.png')}
                    style={styles.pickupInfoIcon}
                />
                <Text style={[styles.infoTitle, {marginLeft: 2, alignSelf: 'center'}]}>
                    Rr. Sami Frasheri (500m)
                </Text>

            </View>


            <View style={styles.pickupInfo}>
                <View>
                    <RestaurantRating rating={restaurant.rating}/>
                </View>
                <Text
                    style={[styles.infoTitle, {marginLeft: 2, alignSelf: 'center'}]}>{parseFloat(parseFloat(restaurant.rating).toFixed(1))}</Text>
            </View>
        </React.Fragment>;
    };

    const renderDelivery = () => {
        return <React.Fragment>

            <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                    <View>
                        <RestaurantRating rating={restaurant.rating}/>
                    </View>
                </View>
                <View>
                    <Text style={styles.infoTitle}>{parseFloat(restaurant.rating).toFixed(1)}</Text>
                    <Text style={styles.infoTitle}>
                        {translate('vendor_profile.rating')}
                    </Text>
                </View>
            </View>

            <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                    <Image
                        source={require('./../../assets/images/restaurant/dergesa.png')}
                        style={styles.infoIcon}
                    />
                </View>
                <View>
                    <Text
                        style={styles.infoTitle}>
                        {formatPrice(restaurant.delivery_fee)} {currency}
                    </Text>
                    <Text style={styles.infoTitle}>
                        {translate('vendor_profile.min_delivery')}
                    </Text>
                </View>
            </View>

            <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                    <Image
                        source={require('./../../assets/images/restaurant/ora.png')}
                        style={styles.infoIcon}
                    />
                </View>
                <View>
                    <Text style={styles.infoTitle}>
                        {restaurant.min_delivery_time}
                    </Text>
                    <Text style={styles.infoTitle}>
                        {translate('vendor_profile.minutes_average')}
                    </Text>
                </View>
            </View>

            <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                    <Image
                        source={require('./../../assets/images/restaurant/cmimi.png')}
                        style={styles.infoIcon}
                    />
                </View>
                <View>
                    <Text style={styles.infoTitle}>
                        {formatPrice(restaurant.min_delivery_price)} {currency}
                    </Text>
                    <Text style={styles.infoTitle}>
                        {translate('vendor_profile.min_order')}
                    </Text>
                </View>
            </View>

        </React.Fragment>;
    };

    return (
        <View style={styles.infoSection}>
            {isPickup ? renderPickup() : renderDelivery()}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        paddingTop: Theme.specifications.statusBarHeight,
        flex: 1,
        backgroundColor: '#fff',
    },
    headerSection: {
        height: 200,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
    },
    headerImage: {
        height: 200,
        width: width,
        resizeMode: 'cover',
    },
    categorySection: {
        paddingBottom: 10,
        paddingRight: 10,
        paddingTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    categorySectionCategories: {
        paddingBottom: 10,
        paddingRight: 10,
        paddingTop: 10,
        flexDirection: 'row',
        alignItems: 'center',

    },
    title: {
        color: Theme.colors.white,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 18,
    },

    headerPickupTitle: {
        marginLeft: 5,
        fontSize: 15,
        color: '#22a6b3',
    },

    categoryTitle: {
        padding: 7,
        backgroundColor: Theme.colors.backgroundColor,
        color: Theme.colors.cyan1,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 13,
        marginRight: 5,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileImage: {
        resizeMode: 'cover',
        marginTop: -50,
        marginLeft: -20,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        overflow: 'hidden',
        width: 80,
        height: 80,
    },
    //////////////////////////////////////////////////////////
    infoSection: {
        backgroundColor: Theme.colors.white,
        padding: 10,
        flexDirection: 'row',
    },
    infoItem: {
        flex: 1,
        flexDirection: 'row',
    },
    infoIconContainer: {
        paddingRight: 5,
        justifyContent: 'center',
    },
    infoIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
    },
    PickupInfoIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
    },

    pickupInfoIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
    },
    headerIcon: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
    },
    infoTitle: {
        color: Theme.colors.gray2,
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: Platform.OS === 'ios' ? 12 : 10,
        textAlign: 'center',
    },

    pickupInfo: {
        //marginTop: -10,
        flexDirection: 'row',
        borderWidth: 1,
        marginRight: 4,
        borderColor: 'lightgrey',
        borderRadius: 14,
        padding: 5,
    },
    //////////////////////////////////////////////////////////
    description: {
        padding: 10,
        paddingBottom: 0,
        color: Theme.colors.gray3,
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 15,
        textAlign: 'justify',
    },
    shareContainer: {
        padding: 10,
        flexDirection: 'row',
    },
    shareIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
    },
    share: {
        paddingLeft: 10,
        color: Theme.colors.cyan1,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 15,
    },
    //////////////////////////////////////////////////////////
    foodCategoryContainer: {
        padding: 5,
        marginTop: 10,
        marginBottom: -5,
        marginLeft: 10,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.listBorderColor,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.listBorderColor,
        backgroundColor: Theme.colors.backgroundColor,
    },
    foodInfoContainer: {
        padding: 5,
        marginLeft: 10,
    },
    foodContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.listBorderColor,
    },
    foodContainerSelected: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.listBorderColor,
        borderLeftColor: Theme.colors.cyan2,
        borderLeftWidth: 4,
    },
    foodContainerLeft: {
        flex: 4,
    },
    foodContainerRight: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    foodCategory: {
        color: Theme.colors.black,
        fontFamily: 'SF_bold',
        fontSize: 18,
    },
    foodCategoryAv: {
        color: Theme.colors.black,
        fontFamily: 'SF_light',
        fontSize: 16,
    },
    foodTitle: {
        padding: 5,
        color: Theme.colors.gray1,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 15,
        textAlign: 'justify',
    },
    foodDesc: {
        padding: 5,
        paddingTop: 0,
        color: Theme.colors.gray1,
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 13,
        textAlign: 'justify',
    },
    bottomContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    foodPreferred: {
        color: '#fe6a00',
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 12,
        textAlign: 'justify',
        paddingLeft: 5,
    },
    starPreferred: {
        width: 12,
        height: 12,
        resizeMode: 'contain',
    },
    foodPrice: {
        paddingLeft: 5,
        color: Theme.colors.gray3,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 15,
    },
    foodImage: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: 'hidden',
        borderRadius: 5,
    },
    //////////////////////////////////////////////////////////
    orderAgain: {
        color: Theme.colors.black,
        fontFamily: 'SF_bold',
        fontSize: 18,
        paddingLeft: 10,
        paddingTop: 10,
    },
    orderAgainDesc: {
        color: Theme.colors.gray3,
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 13,
        paddingLeft: 10,
    },
    ordersContainer: {
        margin: 10,
        marginBottom: 5,
        width: width - 50,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        //  height:190,
        // minHeight: 100
        //   maxHeight:190
        // minHeight: 50,
        // maxHeight:150
    },
    ordersContainerTop: {
        flexDirection: 'row',
    },
    ordersContainerBottom: {
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.listBorderColor,
        flexDirection: 'row',
        alignItems: 'center',
    },
    ordersContainerBottomText: {
        color: Theme.colors.gray3,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 15,
    },
    ordersContainerLeft: {
        flex: 3,
    },
    ordersContainerLeftTitle: {
        color: Theme.colors.gray3,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 15,
    },
    ordersContainerLeftOptionTitle: {
        color: Theme.colors.gray3,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 12,
    },
    ordersContainerLeftPrice: {
        padding: 2,
        color: Theme.colors.gray3,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 15,
    },
    ordersContainerLeftTop: {},
    ordersContainerLeftBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    ordersContainerBottomImage: {
        width: 13,
        height: 13,
        resizeMode: 'contain',
    },
    ordersContainerRight: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ordersContainerRightImage: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
    },
    ordersContainerRightImagePrevious: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalView: {
        backgroundColor: Theme.colors.white,
    },
    modalImageContainer: {
        width: width,
        height: 400,
        overflow: 'hidden',
        resizeMode: 'contain',
    },
    modalInfoContainer: {
        padding: 10,
        flexDirection: 'row',
    },
    modalInfoTitle: {
        color: Theme.colors.black,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 15,
    },
    modalInfoPrice: {
        color: Theme.colors.gray3,
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 15,
        textAlign: 'right',
    },
    modalNrContainer: {
        padding: 20,
        paddingBottom: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalNrImage: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    button: {
        backgroundColor: Theme.colors.cyan2,
        margin: 30,
        marginTop: 15,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        borderBottomLeftRadius: 3,
        borderBottomRightRadius: 3,
    },
    buttonText: {
        fontFamily: 'SanFranciscoDisplay-Medium',
        color: Theme.colors.white,
        fontSize: 18,
        textAlign: 'center',
    },
    modal2: {
        flexDirection: 'row',
    },
    modal2Text: {
        fontFamily: 'SanFranciscoDisplay-Medium',
        color: Theme.colors.white,
        fontSize: 16,
    },
    footerImage: {
        width: 15,
        height: 15,
        resizeMode: 'contain',
    },
});

export default RestaurantDetailsHeader;
