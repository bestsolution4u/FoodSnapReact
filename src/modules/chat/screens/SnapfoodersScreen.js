import React from 'react';
import {StyleSheet, TouchableOpacity, StatusBar, View, Text, FlatList, Image} from 'react-native';
import {withNavigation} from 'react-navigation';
import {connect} from 'react-redux';
import BackButton from "../../../common/components/buttons/back_button";
import AppSearchBox from "../../../common/components/search/app_searchbox";
import {CALL_HISTORY, CHAT_HISTORY} from "../../../config/constants";
import FastImage from "react-native-fast-image";

class SnapfoodersScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerShown: false,
            headerTitle: null,
        };
    };

    render() {
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor="#ffffff" barStyle="dark-content"/>
                {this.renderTitleBar()}
                {this.renderSearchBar()}
                {this.renderFriendList()}
            </View>
        );
    }

    renderTitleBar() {
        return (
            <View style={styles.titleContainer}>
                <BackButton onPress={() => {
                    console.log(this.props.navigation);
                    this.props.navigation.pop();
                }}/>
                <Text style={styles.title}>Snapfooders</Text>
            </View>
        );
    }

    renderSearchBar() {
        return (
            <View style={styles.searchContainer}>
                <AppSearchBox onChangeText={this.onChangeSearch} hint={'Search for names of cities'}/>
            </View>
        );
    }

    onChangeSearch(search) {
        console.log(search);
    }

    renderFriendList() {
        return (
            <FlatList
                style={styles.listContainer}
                data={CHAT_HISTORY}
                numColumns={1}
                renderItem={this.renderFriendItem}
                ItemSeparatorComponent={() => <View style={styles.spaceCol}/>}/>);
    }

    renderFriendItem(item) {
        const {index} = item;
        return (
            <TouchableOpacity style={styles.chatContainer}>
                <FastImage
                    style={styles.avatar}
                    source={{uri: item.item.avatar}}
                    resizeMode={FastImage.resizeMode.contain}/>
                    <View style={{flex: 1}}>
                        <Text style={styles.name}>{item.item.name}</Text>
                    </View>
                <TouchableOpacity>
                    <Text style={{fontSize: 14, color: (index === 2 || index === 4 ? '#23CBD8' : 'grey')}}>{index === 2 || index === 4 ? 'Invite' : 'Already invited'}</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingHorizontal: 20
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        alignSelf: 'center',
        flex: 1,
        textAlign: 'center',
        marginRight: 30,
        fontSize: 18,
        fontWeight: 'bold'
    },
    searchContainer: {
        marginTop: 20
    },
    spaceRow: {
        width: 15
    },
    spaceCol: {
        height: 10
    },
    tabContainer: {
        borderColor: '#F6F6F9',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingVertical: 10,
        flexDirection: 'row',
        marginTop: 10
    },
    tabButton: {
        flex: 1,
        padding: 10,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    tabText: {
        fontSize: 14
    },
    chatContainer: {
        padding: 10,
        flexDirection: 'row',
        borderRadius: 15,
        backgroundColor: '#FAFAFC',
        alignItems: 'center'
    },
    listContainer: {
        flex: 1,
        width: '100%',
        marginTop: 20
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 6,
        backgroundColor: 'red',
        marginRight: 20
    },
    name: {
        flex: 1,
        fontSize: 14,
        color: 'black'
    },
    time: {
        fontSize: 12,
        color: '#AAA8BF'
    },
    message: {
        flex: 1,
        fontSize: 12,
        color: 'black'
    },
    invite: {
        color: '#23CBD8',
        fontSize: 14
    }
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
)(withNavigation(SnapfoodersScreen));
