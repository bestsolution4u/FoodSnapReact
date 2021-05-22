import React, {Component} from 'react';
import {View} from 'react-native';
import {Provider} from 'react-redux';
import store from './src/store';
import AppRoot from './src/AppRoot';
import { MenuProvider } from 'react-native-popup-menu';

console.disableYellowBox = true;

class App extends Component {
    render () {
        return (
            <MenuProvider>
                <Provider store={store}>
                    <View style={{flex: 1}}>
                        <AppRoot/>
                    </View>
                </Provider>
            </MenuProvider>
        );
    }
}

export default App;
