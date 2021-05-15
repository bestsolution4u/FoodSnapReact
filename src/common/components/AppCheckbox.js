import React, {PureComponent} from 'react';
import {Switch, View} from 'react-native';
import Theme from '../../theme';
import AppText from './AppText';
import FastImage from 'react-native-fast-image';

class AppCheckbox extends PureComponent {

    render () {
        const {title, onPress, onValueChange, image, color, disabled, value} = this.props;
        return <View style={{
            flex: 1,
            width: '100%',
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: Theme.colors.darkerBackground,
            paddingVertical: Theme.sizes.tiny,
            paddingHorizontal: Theme.sizes.tiny,
        }} onPress={onPress}>
            {image && <FastImage source={image}
                                 style={{
                                     marginRight: Theme.icons.tiny,
                                     width: Theme.icons.base,
                                     height: Theme.icons.base,
                                     resizeMode: 'contain',
                                 }}/>}
            <AppText style={{color: color, fontSize: Theme.sizes.small, lineHeight: Theme.icons.base}}>{title}</AppText>
            <Switch style={{position: 'absolute', right: Theme.sizes.tiny, top: Theme.sizes.tiny}}
                    ios_backgroundColor={Theme.colors.disabled}
                    trackColor={{true: Theme.colors.primary, false: Theme.colors.disabled}}
                    onValueChange={onValueChange}
                    thumbColor={Theme.colors.white}
                    tintColor={Theme.colors.white}
                    disabled={disabled}
                    value={value}/>
        </View>;
    }

}

export default AppCheckbox;
