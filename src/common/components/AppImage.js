import React, {PureComponent} from 'react';
import {Dimensions, View} from 'react-native';
import PropTypes from 'prop-types';
import FastImage from 'react-native-fast-image';

const screenWidth = Dimensions.get('screen').width;

class AppImage extends PureComponent {

    constructor (props) {
        super(props);

        this.state = {
            loaded: false,
        };
    }

    _loaded = () => {
        this.setState(() => ({loaded: true}));
    };

    render () {
        const {width, height, resizeMode, src} = this.props;
        let {style} = this.props;
        const {loaded} = this.state;

        if (!style) {
            style = {
                width,
                height,
            };
        }

        return <View>
            {
                !loaded && <FastImage source={require('../assets/images/logo.png')}
                                      resizeMode={'contain'}
                                      style={[{position: 'absolute'}, style]}/>
            }
            <FastImage style={[{zIndex: 10}, style]} onLoad={this._loaded}
                       resizeMode={resizeMode}
                       source={{uri: src}}/>
        </View>;
    }

}

export default AppImage;

AppImage.propTypes = {
    src: PropTypes.string,
};

AppImage.defaultProps = {
    width: screenWidth,
    height: 250,
    resizeMode: 'cover',
};
