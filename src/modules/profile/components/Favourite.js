import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import AppText from '../../../common/components/AppText';
import Theme from '../../../theme';
import styles from '../styles/favorites';

const Favourite = ({vendor, language = 'sq', onPress}) => {

    const renderElement = () => {
        if (parseFloat(vendor['rating_interval']) >= 0 && parseFloat(vendor['rating_interval']) <= 2) {
            return <FastImage source={require('../../../common/assets/images/restaurant/review.png')}
                              style={styles.rightBottomSectionFirstImage}/>;
        } else if (parseFloat(vendor['rating_interval']) > 2 && parseFloat(vendor['rating_interval']) <= 4) {
            return <FastImage source={require('../../../common/assets/images/dashboard_review/neutral.png')}
                              style={styles.rightBottomSectionFirstImage}/>;
        } else if (parseFloat(vendor['rating_interval']) > 4 && parseFloat(vendor['rating_interval']) <= 6) {
            return <FastImage source={require('../../../common/assets/images/dashboard_review/ok.png')}
                              style={styles.rightBottomSectionFirstImage}/>;
        } else if (parseFloat(vendor['rating_interval']) > 6 && parseFloat(vendor['rating_interval']) <= 8) {
            return <FastImage source={require('../../../common/assets/images/dashboard_review/happy.png')}
                              style={styles.rightBottomSectionFirstImage}/>;
        } else if (parseFloat(vendor['rating_interval']) > 8 && parseFloat(vendor['rating_interval']) <= 10) {
            return <FastImage source={require('../../../common/assets/images/dashboard_review/heart.png')}
                              style={styles.rightBottomSectionFirstImage}/>;
        }
        return null;
    };

    const customStyles = {};

    if (!vendor['is_open']) {
        customStyles.backgroundColor = 'rgba(0,0,0,0.1)';
    }

    const categories = vendor['food_categories'].slice(0, 2).map(x => x[`title_${language}`]).join(', ');

    return <TouchableOpacity style={[styles.itemContainer, customStyles]} onPress={onPress}>
        <View style={styles.leftSection}>
            <FastImage resizeMode={FastImage.resizeMode.contain}
                       source={{
                           uri: `https://snapfoodal.imgix.net/${
                               vendor['logo_thumbnail_path']
                           }?w=600&h=600`,
                       }}
                       style={styles.leftSectionImage}
            />
        </View>
        <View style={styles.rightSection}>
            <View style={styles.rightTopSection}>
                <AppText style={styles.rightTopSectionTitle}>{vendor.title}</AppText>
                <FastImage resizeMode={FastImage.resizeMode.contain}
                           source={require('../../../common/assets/images/restaurant/favorite.png')}
                           style={styles.rightTopSectionImage}
                />
            </View>
            <View style={styles.rightBottomSection}>
                <View style={styles.rightBottomSectionFirst}>
                    <View>
                        {renderElement()}
                    </View>
                    <AppText
                        style={styles.rightBottomSectionText}>{' '}{(vendor['rating_interval'] / 2).toFixed(1)}</AppText>
                </View>
                <View style={styles.rightBottomSectionSecond}>
                    {
                        !!categories && <AppText
                            style={styles.rightBottomSectionText}
                            numberOfLines={1}
                            ellipsizeMode={'tail'}>
                            {categories}
                        </AppText>
                    }
                </View>
                <View style={styles.rightBottomSectionThird}>
                    <AppText
                        style={[
                            styles.rightBottomSectionText,
                            {color: Theme.colors.cyan2},
                        ]}>
                        {vendor['minimum_delivery_time']}
                    </AppText>
                    <AppText style={styles.rightBottomSectionText}> Min</AppText>
                </View>
            </View>
        </View>
    </TouchableOpacity>;
};

export default Favourite;
