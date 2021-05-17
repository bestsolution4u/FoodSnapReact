import React from 'react';
import {StyleSheet, TouchableOpacity, StatusBar, View, Text, FlatList, Image} from 'react-native';
import {withNavigation} from 'react-navigation';
import {connect} from 'react-redux';
import RouteNames from '../../../routes/names';
import {sendMessage, setMessagesSeen} from "../../../store/actions/chat";
import BackButton from "../../../common/components/buttons/back_button";
import AppSearchBox from "../../../common/components/search/app_searchbox";
import {CALL_HISTORY, CHAT_HISTORY} from "../../../config/constants";
import FastImage from "react-native-fast-image";

class CallScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            muteActive: false,
            speakerActive: false
        };
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerShown: false,
            headerTitle: null,
        };
    };

    render() {
        const {muteActive, speakerActive} = this.state;
        let muteImage = muteActive ? require('../../../common/assets/images/chat/mute_active.png') : require('../../../common/assets/images/chat/mute_inactive.png');
        let speakerImage = speakerActive ? require('../../../common/assets/images/chat/speaker_active.png') : require('../../../common/assets/images/chat/speaker_inactive.png');
        return (
            <View style={styles.container}>
                <Image
                    style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
                    resizeMode='cover'
                    source={require('../../../common/assets/images/chat/caller-bg.png')}
                    blurRadius={3}
                />
                <View style={{flexDirection: 'row', marginHorizontal: 60, position: 'absolute', bottom: 0, alignItems: 'center'}}>
                    <TouchableOpacity style={{width: 60, height: 60}} onPress={() => {
                        this.setState({muteActive: !muteActive});
                    }}>
                        <FastImage
                            style={{width: 60, height: 60}}
                            source={muteImage}
                            resizeMode={FastImage.resizeMode.contain}/>
                    </TouchableOpacity>
                    <View style={{flex: 1}} />
                    <TouchableOpacity style={{width: 75, height: 75}} onPress={() => {
                        this.props.navigation.pop();
                    }}>
                        <FastImage
                            style={{width: 75, height: 75}}
                            source={require('../../../common/assets/images/chat/endcall.png')}
                            resizeMode={FastImage.resizeMode.contain}/>
                    </TouchableOpacity>
                    <View style={{flex: 1}} />
                    <TouchableOpacity style={{width: 60, height: 60}} onPress={() => {
                        this.setState({speakerActive: !speakerActive});
                    }}>
                        <FastImage
                            style={{width: 60, height: 60}}
                            source={speakerImage}
                            resizeMode={FastImage.resizeMode.contain}/>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
});

const mapStateToProps = ({app, chat}) => ({
    isLoggedIn: app.isLoggedIn,
    user: app.user,
    messages: chat.messages,
    safeAreaDims: app.safeAreaDims,
});

export default connect(
    mapStateToProps,
    {},
)(withNavigation(CallScreen));
