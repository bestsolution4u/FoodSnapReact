import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import AppText from '../../../common/components/AppText';
import styles from '../styles/blog';
import FastImage from 'react-native-fast-image';
import {appMoment} from '../../../common/services/translate';

const BlogItem = ({item, language = 'sq', onPress}) => {

    return <TouchableOpacity style={[styles.container]} onPress={onPress} activeOpacity={1}>
        <View>
            <FastImage
                source={{uri: `https://snapfoodal.imgix.net/${item['image_cover']}?h=250`}}
                resizeMode={FastImage.resizeMode.cover}
                style={styles.image}/>
            <View style={styles.content}>
                {
                    item.categories && <AppText style={styles.category}>{item.categories.map(x => x.title).join(', ')}</AppText>
                }
                <AppText style={styles.title} numberOfLines={2} ellipsizeMode={'tail'}>{item.title}</AppText>
                <AppText style={styles.date}>
                    <AppText>{appMoment(item['created_at']).fromNow()}</AppText> | <AppText>{item['author']}</AppText>
                </AppText>
            </View>
        </View>
    </TouchableOpacity>;
};

export default BlogItem;
