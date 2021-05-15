import React from 'react';
import { Dimensions, View } from 'react-native';
import FastImage from 'react-native-fast-image';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

class LoadingScreen extends React.PureComponent {
    render() {
        return (
          <View
            style={{
                flex: 1,
                width,
                height,
                justifyContent: 'center',
                alignItems: 'center',
            }}
          >
              <FastImage
                style={{ width: width, height: height }}
                resizeMode={'cover'}
                source={require('../assets/images/splash.png')}
              />
          </View>
        );
    }
}

export default LoadingScreen;
