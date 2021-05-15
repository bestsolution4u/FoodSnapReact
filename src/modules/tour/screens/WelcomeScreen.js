import React from 'react';
import {Image, ImageBackground, TouchableOpacity, View} from 'react-native';
import {translate} from '../../../common/services/translate';
import Theme from '../../../theme';
import LocationScreen from './LocationScreen';
import AppText from '../../../common/components/AppText';

class WelcomeScreen extends React.PureComponent {

    constructor (props) {
        super(props);

        this.state = {
            nextScreen: false,
        };
    }

    next () {
        this.setState({
            nextScreen: true,
        });
    }

    render () {
        if (!this.state.nextScreen) {
            return (
                <ImageBackground source={require('../../../common/assets/images/welcome/welcome.jpg')}
                                 style={Theme.styles.background}>
                    <View style={Theme.styles.top}>
                        <Image source={require('../../../common/assets/images/welcome/logo.png')}
                               style={Theme.styles.logo}
                        />
                        <AppText style={Theme.styles.title}>{translate('splash_intro.title')}</AppText>
                        <AppText style={Theme.styles.description}>
                            {translate('splash_intro.description1')}
                        </AppText>
                        <AppText style={Theme.styles.description}>
                            {translate('splash_intro.description2')}
                        </AppText>
                    </View>
                    <View style={Theme.styles.bottom}>
                        <TouchableOpacity style={Theme.styles.button} onPress={() => this.next()}>
                            <AppText style={Theme.styles.buttonText}>
                                {translate('splash_intro.button')}
                            </AppText>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            );
        } else {
            return <LocationScreen/>;
        }
    }
}

export default WelcomeScreen;
