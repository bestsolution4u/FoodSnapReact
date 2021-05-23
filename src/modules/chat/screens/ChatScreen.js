import React from 'react';
import {StyleSheet, TouchableOpacity, StatusBar, View, Text, FlatList, Image, SafeAreaView} from 'react-native';
import {withNavigation} from 'react-navigation';
import {connect} from 'react-redux';
import {sendMessage, setMessagesSeen} from '../../../store/actions/chat';
import RouteNames from '../../../routes/names';
import IconBorderButton from "../../../common/components/buttons/icon_border_button";
import SearchBox from "../../../common/components/social/search/SearchBox";
import {translate} from '../../../common/services/translate';
import {CALL_HISTORY, CHAT_HISTORY} from "../../../config/constants";
import FastImage from "react-native-fast-image";
import {white} from "react-native-ios-kit/src/styles/colors";
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';
import {isCameraPresent} from "react-native-device-info";

class ChatScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            messages: [],
            loadEarlier: true,
            typingText: null,
            isLoadingEarlier: false,
            isChatList: true,
        };
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerShown: false,
            headerTitle: null,
        };
    };

    componentWillUnmount() {
        this.focusListener.remove();
    }

    componentDidMount() {
        const {navigation} = this.props;
        this.focusListener = navigation.addListener('didFocus', () => {
            this.checkForMessages();
            this.props.setMessagesSeen();
        });
    }

    componentDidUpdate() {
        this.checkForMessages();
    }

    goToWelcomeChat = () => {
        this.props.navigation.replace(RouteNames.WelcomeChatScreen);
    };

    checkForMessages = () => {
        const {messages, isLoggedIn} = this.props;
        if (!isLoggedIn && (!messages || messages.length === 0)) {
            this.goToWelcomeChat();
        }
    };

    render() {
        const {isChatList} = this.state;
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="#ffffff" barStyle="dark-content"/>
                {this.renderSearchbar()}
                {this.renderTab()}
                {isChatList ? this.renderChatHistory() : this.renderCallHistory()}
            </SafeAreaView>
        );
    }

    renderSearchbar() {
        const {isChatList} = this.state;
        return (<View style={styles.searchContainer}>
            <SearchBox onChangeText={this.onChangeSearch}  hint={translate('social.search.chat')}/>
            <View style={styles.spaceRow}/>
            <IconBorderButton
                icon={isChatList ? require('../../../common/assets/images/chat/icon-add-chat.png') : require('../../../common/assets/images/chat/icon-add-call.png')}
                onPress={() => this.onAddClick(isChatList)}/>
            <View style={styles.spaceRow}/>
            <Menu>
                <MenuTrigger>
                    <View style={styles.moreContainer}>
                        <Image style={styles.moreIcon} source={require('../../../common/assets/images/chat/icon-more-vertical.png')}/>
                        <View style={styles.moreAlert} />
                    </View>
                </MenuTrigger>
                <MenuOptions optionsContainerStyle={styles.popupContainer}>
                    <MenuOption onSelect={() => {this.props.navigation.push(RouteNames.InvitationsScreen);}} >
                        <View style={{paddingHorizontal: 5, paddingBottom: 10, paddingTop: 5, alignItems: 'center', borderColor: '#F6F6F9', borderBottomWidth: 1, flexDirection: 'row'}}>
                            <Text style={styles.popupText}>Invitations</Text>
                            <Text style={{color: '#F55A00', fontSize: 10, marginLeft: 5}}>(3 new)</Text>
                        </View>
                    </MenuOption>
                    <MenuOption onSelect={() => {this.props.navigation.push(RouteNames.MyFriendsScreen);}} >
                        <View style={{paddingHorizontal: 5, paddingBottom: 10, borderColor: '#F6F6F9', borderBottomWidth: 1, flexDirection: 'row'}}>
                            <Text style={styles.popupText}>My Friends</Text>
                        </View>
                    </MenuOption>
                    <MenuOption onSelect={() => {this.props.navigation.push(RouteNames.SnapfoodMapScreen);}}>
                        <View style={{paddingHorizontal: 5, paddingBottom: 10, flexDirection: 'row'}}>
                            <Text style={styles.popupText}>Snapfood Map</Text>
                        </View>
                    </MenuOption>
                </MenuOptions>
            </Menu>

        </View>);
    }

    renderTab() {
        const {isChatList} = this.state;
        return (
            <View style={styles.tabContainer}>
                {this.renderTabButton('Chats', isChatList, () => {
                    this.setState({isChatList: true})
                })}
                <View style={styles.spaceRow}/>
                {this.renderTabButton('Calls', !isChatList, () => {
                    this.setState({isChatList: false})
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

    renderChatHistory() {
        return (
            <FlatList
                style={styles.listContainer}
                data={CHAT_HISTORY}
                numColumns={1}
                renderItem={this.renderChatItem}
                ItemSeparatorComponent={() => <View style={styles.spaceCol}/>}/>);
    }

    renderChatItem(item, index) {
        return (
            <TouchableOpacity style={styles.chatContainer}>
                <FastImage
                    style={styles.avatar}
                    source={{uri: item.item.avatar}}
                    resizeMode={FastImage.resizeMode.contain}/>
                <View style={{flex: 1}}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={styles.name}>{item.item.name}</Text>
                        <Text style={styles.time}>{item.item.time}</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 5}}>
                        <Text style={styles.message}>{item.item.lastMessage}</Text>
                        {
                            item.item.unreadCount > 0 &&
                            <View style={styles.unreadContainer}>
                                <Text style={styles.unread}>{item.item.unreadCount}</Text>
                            </View>
                        }
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    renderCallHistory() {
        return (
            <FlatList
                style={styles.listContainer}
                data={CALL_HISTORY}
                numColumns={1}
                renderItem={this.renderCallItem}
                ItemSeparatorComponent={() => <View style={styles.spaceCol}/>}/>);
    }

    renderCallItem(item, index) {
        let lastCallColor;
        let lastCallIcon;
        let lastCallText;
        if (item.item.missedCount > 0) {
            lastCallColor = '#F55A00';
            lastCallIcon = require('../../../common/assets/images/chat/icon-call-missed.png');
            lastCallText = "" + item.item.missedCount + " Missed Call" + (item.item.missedCount > 0 ? 's' : '');
        } else if (item.item.lastCall === 'Incoming') {
            lastCallColor = '#00C22D';
            lastCallIcon = require('../../../common/assets/images/chat/icon-call-incoming.png');
            lastCallText = 'Incoming';
        } else {
            lastCallColor = '#23CBD8';
            lastCallIcon = require('../../../common/assets/images/chat/icon-call-outgoing.png');
            lastCallText = 'Outgoing';
        }
        return (
            <TouchableOpacity style={styles.chatContainer}>
                <FastImage
                    style={styles.avatar}
                    source={{uri: item.item.avatar}}
                    resizeMode={FastImage.resizeMode.contain}/>
                <View style={{flex: 1}}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={styles.name}>{item.item.name}</Text>
                        <Text style={styles.time}>{item.item.time}</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 5, alignItems: 'center'}}>
                        <FastImage source={lastCallIcon}
                                   resizeMode={'contain'}
                                   style={{width: 10, height: 10, marginRight: 5}}/>
                        <Text style={{color: lastCallColor, fontSize: 12}}>{lastCallText}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    onAddClick(isChat) {
        if (isChat) {
            this.props.navigation.push(RouteNames.NewChatScreen);
        } else {
            this.props.navigation.push(RouteNames.NewCallScreen);
        }
    }

    onChangeSearch(search) {
        console.log(search);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexDirection: 'row'
    },
    moreContainer: {
        width: 45,
        height: 45,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E9E9F7',
        alignItems: 'center',
        justifyContent: 'center'
    },
    moreIcon: {
        height: 20
    },
    moreAlert: {
        width: 10,
        height: 10,
        backgroundColor: '#F55A00',
        position: 'absolute',
        top: -5,
        right: -5,
        borderRadius: 10
    },
    spaceRow: {
        width: 15
    },
    spaceCol: {
        height: 10
    },
    tabContainer: {
        marginHorizontal: 20,
        borderColor: '#F6F6F9',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingVertical: 10,
        flexDirection: 'row'
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
        backgroundColor: '#FAFAFC'
    },
    listContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 6,
        backgroundColor: 'red',
        marginRight: 10
    },
    name: {
        flex: 1,
        fontSize: 14,
        color: 'black',
        fontWeight: 'bold'
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
    unreadContainer: {
        marginLeft: 20,
        width: 15,
        height: 15,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F55A00',
    },
    unread: {
        textAlign: 'center',
        color: white,
        fontSize: 12
    },
    popupContainer: {
        width: 140,
        borderColor: '#E9E9F7',
        borderRadius: 12,
        backgroundColor: 'white',
        borderWidth: 2,
        paddingHorizontal: 2,
        marginTop: 50,
        elevation: 0
    },
    popupText: {
        color: '#222222',
        fontSize: 14
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
    {
        setMessagesSeen,
        sendMessage,
    },
)(withNavigation(ChatScreen));
