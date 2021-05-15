import React, {PureComponent} from 'react';
import Theme from '../../theme';
import AppText from './AppText';
import FontelloIcon from './FontelloIcon';
import FastImage from 'react-native-fast-image';
import {TouchableOpacity} from 'react-native';

class AppListItem extends PureComponent {

    render () {
        const {title, onPress, icon, iconColor, fontSize, iconSize, image, color, customStyles} = this.props;
        let {type} = this.props;
        if (!type) {
            type = Theme.sizes.tiny;
        }
        return <TouchableOpacity activeOpacity={1} style={{
            flex: 1,
            width: '100%',
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: Theme.colors.darkerBackground,
            paddingVertical: type,
            paddingHorizontal: type,
            alignContent: 'center',
            alignItems: 'center',
            ...customStyles,
        }} onPress={onPress}>
            {image && <FastImage source={image}
                                 style={{
                                     marginRight: type,
                                     width: Theme.icons.base,
                                     height: Theme.icons.base,
                                     resizeMode: 'contain',
                                 }}/>}
            <AppText style={{
                color: color,
                fontSize: fontSize ? fontSize : Theme.sizes.small,
                lineHeight: Theme.icons.base,
            }}>{title}</AppText>
            {
                icon && <FontelloIcon
                    style={{position: 'absolute', right: type, alignItems: 'center',}}
                    icon={icon} size={iconSize || Theme.icons.base}
                    color={iconColor ? iconColor : Theme.colors.placeholder}/>
            }

        </TouchableOpacity>;
    }

}

export default AppListItem;
