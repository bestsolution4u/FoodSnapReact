import React from 'react';
import {StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';

const RestaurantRating = ({rating}) => {
    if (parseFloat(rating) >= 0 && parseFloat(rating) <= 1) {
        return <FastImage source={require('../../../common/assets/images/restaurant/review.png')}
                          style={styles.infoIcon}/>;
    } else if (parseFloat(rating) > 1 && parseFloat(rating) <= 2) {
        return <FastImage source={require('../../../common/assets/images/dashboard_review/neutral.png')}
                          style={styles.infoIcon}/>;
    } else if (parseFloat(rating) > 2 && parseFloat(rating) <= 3) {
        return <FastImage source={require('../../../common/assets/images/dashboard_review/ok.png')}
                          style={styles.infoIcon}/>;
    } else if (parseFloat(rating) > 3 && parseFloat(rating) <= 4) {
        return <FastImage source={require('../../../common/assets/images/dashboard_review/happy.png')}
                          style={styles.infoIcon}/>;
    } else if (parseFloat(rating) > 4 && parseFloat(rating) <= 5) {
        return <FastImage source={require('../../../common/assets/images/dashboard_review/heart.png')}
                          style={styles.infoIcon}/>;
    }
    return null;
};

const styles = StyleSheet.create({
    infoIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
    },
});

export default RestaurantRating;
