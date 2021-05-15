import React, {Component} from 'react';
import {View} from 'react-native';
import {Provider} from 'react-redux';
import store from './src/store';
import AppRoot from './src/AppRoot';

console.disableYellowBox = true;

class App extends Component {
    render () {
        return (
            <Provider store={store}>
                <View style={{flex: 1}}>
                    <AppRoot/>
                </View>
            </Provider>
        );
    }
}

export default App;
