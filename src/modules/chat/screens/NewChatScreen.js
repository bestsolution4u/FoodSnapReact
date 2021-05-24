import React from 'react';
import {StyleSheet, TouchableOpacity, StatusBar, View, Text, FlatList, Image, SafeAreaView} from 'react-native';
import {withNavigation} from 'react-navigation';
import {connect} from 'react-redux';
import BackButton from "../../../common/components/buttons/back_button";
import SearchBox from "../../../common/components/social/search/SearchBox";
import {translate} from '../../../common/services/translate';
import {CALL_HISTORY, CHAT_HISTORY} from "../../../config/constants";
import FastImage from "react-native-fast-image";
import Theme from "../../../theme";

class NewChatScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isFriend: true
        };
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerShown: false,
            headerTitle: null,
        };
    };

    render() {
        const {isFriend} = this.state;
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="#ffffff" barStyle="dark-content"/>
                <View style={{flex: 1, paddingHorizontal: 20}}>
                    {this.renderTitleBar()}
                    {this.renderSearchBar()}
                    {this.renderTab()}
                    {isFriend ? this.renderFriendList() : this.renderSnapfooders()}
                </View>
            </SafeAreaView>
        );
    }

    renderTitleBar() {
        return (
            <View style={styles.titleContainer}>
                <BackButton onPress={() => {
                    this.props.navigation.pop();
                }}/>
                <Text style={styles.title}>New Chat</Text>
            </View>
        );
    }

    renderSearchBar() {
        return (
            <View style={styles.searchContainer}>
                <SearchBox onChangeText={this.onChangeSearch} hint={translate('social.search.new_chat')}/>
            </View>
        );
    }

    onChangeSearch(search) {
        console.log(search);
    }

    renderTab() {
        const {isFriend} = this.state;
        return (
            <View style={styles.tabContainer}>
                {this.renderTabButton('Friends', isFriend, () => {
                    this.setState({isFriend: true})
                })}
                <View style={styles.spaceRow}/>
                {this.renderTabButton('Snapfooders', !isFriend, () => {
                    this.setState({isFriend: false})
                })}
            </View>
        );
    }

    renderTabButton(title, isSelected, onPress) {
        return (
            <TouchableOpacity style={[styles.tabButton, {backgroundColor: isSelected ? '#E0FBFB' : 'white'}]}
                              onPress={onPress}>
                <Text style={[styles.tabText, {color: isSelected ? '#23CBD8' : 'black'}]}>{title}</Text>
            </TouchableOpacity>
        );
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

    renderFriendItem(item, index) {
        return (
            <TouchableOpacity style={styles.chatContainer}>
                <FastImage
                    style={styles.avatar}
                    source={{uri: item.item.avatar}}
                    resizeMode={FastImage.resizeMode.contain}/>
                <Text style={styles.name}>{item.item.name}</Text>
            </TouchableOpacity>
        );
    }

    renderSnapfooders() {
        return (
            <FlatList
                style={styles.listContainer}
                data={CALL_HISTORY}
                numColumns={1}
                renderItem={this.renderSnapfooderItem}
                ItemSeparatorComponent={() => <View style={styles.spaceCol}/>}/>);
    }

    renderSnapfooderItem(item, index) {
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
                    <Text style={styles.invite}>Invite</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10
    },
    title: {
        alignSelf: 'center',
        flex: 1,
        textAlign: 'center',
        marginRight: 30,
        fontSize: 18,
        fontFamily: Theme.fonts.bold
    },
    searchContainer: {
        flexDirection: 'row'
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
        fontSize: 14,
        fontFamily: Theme.fonts.regular
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
        color: 'black',
        fontFamily: Theme.fonts.bold
    },
    time: {
        fontSize: 12,
        color: '#AAA8BF',
        fontFamily: Theme.fonts.regular
    },
    message: {
        flex: 1,
        fontSize: 12,
        color: 'black',
        fontFamily: Theme.fonts.regular
    },
    invite: {
        color: '#23CBD8',
        fontSize: 14,
        fontFamily: Theme.fonts.regular
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
)(withNavigation(NewChatScreen));
