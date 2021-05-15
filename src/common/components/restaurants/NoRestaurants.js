import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styles from '../../../modules/search/styles/resultsStyles';
import FastImage from 'react-native-fast-image';
import AppText from '../AppText';
import { translate } from '../../services/translate';

const NoRestaurants = ({ onRemoveFiltersPressed }) => {
    return (
      <View style={styles.nores}>
          <FastImage
            resizeMode={FastImage.resizeMode.contain}
            source={require('../../../common/assets/images/restaurant/no_res_near.png')}
            style={styles.image}
          />
          <AppText style={styles.title}>{translate('soon_in_your_area')}</AppText>
          <AppText style={styles.description}>{translate('soon_in_your_area_desc')}</AppText>
          {!!onRemoveFiltersPressed && (
            <TouchableOpacity
              onPress={onRemoveFiltersPressed}
              style={{ marginTop: 30, padding: 10 }}
              activeOpacity={0.7}
            >
                <AppText style={{ color: '#61C8D5', fontSize: 16 }}>
                  {translate('search.clearAppliedFilters')}
                </AppText>
            </TouchableOpacity>
          )}
      </View>
    );
};

export default NoRestaurants;
