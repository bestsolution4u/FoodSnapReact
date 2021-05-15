import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import AppText from '../AppText';
import Theme from '../../../theme';
import RBSheet from 'react-native-raw-bottom-sheet';
import {translate} from '../../services/translate';
import {useSelector} from 'react-redux';

const RestaurantClosedModal = ({restaurant, setRef, seeMenu, searchSimilar}) => {

    let modal;
    const safeAreaDims = useSelector(({app}) => {
        return app.safeAreaDims;
    });

    let title = restaurant['custom_closed_title'];
    if (!title) {
        title = translate('dashboard.restaurant_is_closed');
    }

    return <RBSheet
        closeOnDragDown={true}
        closeOnPressBack={true}
        duration={300}
        height={230 + safeAreaDims.bottom}
        customStyles={{
            container: {
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
            },
        }}
        ref={ref => {
            modal = ref;
            setRef(ref);
        }}>
        <View style={styles.closedModalView}>
            <View style={styles.closedModalView}>
                <View style={{flexDirection: 'row'}}>
                    <View style={styles.closedModalImageContainer}>
                        <FastImage
                            source={{uri: `https://snapfoodal.imgix.net/${restaurant['logo_path']}?w=600&h=600`}}
                            style={styles.closedModalImage}
                        />
                    </View>
                    <View style={{flex: 4}}>
                        <AppText style={styles.closedModalTitle}>
                            {title}
                        </AppText>
                        <AppText style={styles.closedModalDesc}>
                            {restaurant['custom_closed_info']}
                        </AppText>
                    </View>
                </View>
            </View>

            <View style={styles.closedModalInfoContainer}>
                <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.closedModalInfo}
                    onPress={() => {
                        modal.close();
                        searchSimilar && searchSimilar();
                    }}>
                    <View style={styles.closedModalImageContainer}>
                        <FastImage
                            source={require('./../../assets/images/restaurant/open_restaurant.png')}
                            style={styles.closedModalIco}
                        />
                    </View>
                    <AppText style={styles.closedModalInfoDesc}>
                        {translate('dashboard.suggested_restaurants')}
                    </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.closedModalInfo}
                    onPress={() => {
                        modal.close();
                        seeMenu && seeMenu();
                    }}>
                    <View style={styles.closedModalImageContainer}>
                        <FastImage
                            source={require('./../../assets/images/restaurant/ope_menu.png')}
                            style={styles.closedModalIco}
                        />
                    </View>
                    <AppText
                        style={styles.closedModalInfoDesc}>{translate('dashboard.see_the_menu')}</AppText>
                </TouchableOpacity>
            </View>
        </View>
    </RBSheet>;
};

const styles = StyleSheet.create({
    closedModalView: {
        paddingTop: 10,
        paddingLeft: 10,
        backgroundColor: Theme.colors.white,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    closedModalTitle: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        color: Theme.colors.black,
        fontFamily: 'SanFranciscoDisplay-Bold',
        fontSize: 17,
    },
    closedModalDesc: {
        paddingLeft: 10,
        paddingVertical: 5,
        color: Theme.colors.gray1,
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 15,
    },
    closedModalImageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    closedModalImage: {
        height: 60,
        width: 60,
        borderRadius: 8,
        resizeMode: 'contain',
        overflow: 'hidden',
    },
    closedModalInfoContainer: {
        marginTop: 30,
        flexDirection: 'row',
    },
    closedModalInfo: {
        flex: 1,
    },
    closedModalInfoDesc: {
        paddingHorizontal: 10,
        paddingVertical: 20,
        color: Theme.colors.gray1,
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 13,
        textAlign: 'center',
    },
    closedModalIcoContainer: {
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closedModalIco: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
    },
    closedModalIcoRev: {
        height: 30,
        width: 30,
        resizeMode: 'contain',
    },
});

export default RestaurantClosedModal;
