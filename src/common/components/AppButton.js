import React, {PureComponent} from 'react';
import {ActivityIndicator, TouchableOpacity} from 'react-native';
import Theme from '../../theme';
import AppText from './AppText';

class AppButton extends PureComponent {

    render () {
        const {style, title, onPress, disabled, loading} = this.props;
        let buttonStyles = {...Theme.styles.button, ...style};
        if (disabled) {
            buttonStyles = {...buttonStyles, ...Theme.styles.disabledButton};
        }

        return <TouchableOpacity style={buttonStyles}
                                 activeOpacity={0.75}
                                 onPress={onPress}
                                 disabled={!!disabled || loading}>
            {!loading && <AppText style={Theme.styles.buttonText}>{title}</AppText>}
            {loading && <ActivityIndicator style={Theme.styles.buttonText}
                                           size={Theme.sizes.normal}
                                           color={Theme.colors.whitePrimary}/>}

        </TouchableOpacity>;
    }

}

export default AppButton;
