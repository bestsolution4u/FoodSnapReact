import {TouchableOpacity, View} from 'react-native';
import React from 'react';
import styles from '../../../modules/home/screens/styles/home';
import AppText from '../AppText';
import Emoji from 'react-native-emoji';
import FastImage from 'react-native-fast-image';


const RestaurantFeaturedHeaderTitle = ({title, description, emoji, onActionPress}) => {

    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignContent: 'center',
            ...styles.featuredLine,
        }}>
            <View>
                <AppText
                    style={styles.featuredTitle}>{title}</AppText>
                <AppText style={styles.featuredTitleDesc}
                         numberOfLines={1}
                         ellipsizeMode={'tail'}>
                    {description} {' '}
                    {
                        emoji && <Emoji name={emoji}/>
                    }
                </AppText>
            </View>
            {
                !!onActionPress && <View>
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={styles.filterView}
                            onPress={onActionPress}>
                            <FastImage
                                source={require('../../../common/assets/images/restaurant/filter.png')}
                                style={styles.filterIco}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            }
        </View>
    );
};


export default RestaurantFeaturedHeaderTitle;
