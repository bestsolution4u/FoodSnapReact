import React from 'react';
import {StyleSheet, TouchableOpacity, StatusBar, View, Text, FlatList, SafeAreaView} from 'react-native';
import {withNavigation} from 'react-navigation';
import {connect} from 'react-redux';
import BackButton from "../../../common/components/buttons/back_button";
import {CALL_HISTORY, CHAT_HISTORY} from "../../../config/constants";
import FastImage from "react-native-fast-image";
import {default as EvilIcon} from 'react-native-vector-icons/EvilIcons';
import {default as AntIcon} from 'react-native-vector-icons/AntDesign';
import Theme from "../../../theme";

class InvitationsScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isReceived: true
        };
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerShown: false,
            headerTitle: null,
        };
    };

    render() {
        const {isReceived} = this.state;
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="#ffffff" barStyle="dark-content"/>
                <View style={{flex: 1, paddingHorizontal: 20}}>
                    {this.renderTitleBar()}
                    {this.renderTab()}
                    {isReceived ? this.renderReceived() : this.renderSent()}
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
                <Text style={styles.title}>Invitations</Text>
            </View>
        );
    }

    renderTab() {
        const {isReceived} = this.state;
        return (
            <View style={styles.tabContainer}>
                {this.renderTabButton('Received', isReceived, () => {
                    this.setState({isReceived: true})
                })}
                <View style={styles.spaceRow}/>
                {this.renderTabButton('Sent', !isReceived, () => {
                    this.setState({isReceived: false})
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

    renderReceived() {
        return (
            <FlatList
                style={styles.listContainer}
                data={CHAT_HISTORY}
                numColumns={1}
                renderItem={this.renderReceivedItem}
                ItemSeparatorComponent={() => <View style={styles.spaceCol}/>}/>);
    }

    renderReceivedItem(item, index) {
        return (
            <TouchableOpacity style={styles.chatContainer}>
                <FastImage
                    style={styles.avatar}
                    source={{uri: item.item.avatar}}
                    resizeMode={FastImage.resizeMode.contain}/>
                <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.item.name}</Text>
                    <Text style={styles.time}>{item.item.time}</Text>
                </View>
                <TouchableOpacity style={{marginRight: 20, width: 30, height: 30, borderRadius: 6, backgroundColor: '#AAA8BF', alignItems: 'center', justifyContent: 'center'}}>
                    <EvilIcon name="close" size={16} color={'#FFFFFF'}/>
                </TouchableOpacity>
                <TouchableOpacity style={{width: 30, height: 30, borderRadius: 6, backgroundColor: '#00C22D', alignItems: 'center', justifyContent: 'center'}}>
                    <AntIcon name="check" size={16} color={'#FFFFFF'}/>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    }

    renderSent() {
        return (
            <FlatList
                style={styles.listContainer}
                data={CALL_HISTORY}
                numColumns={1}
                renderItem={this.renderSentItem}
                ItemSeparatorComponent={() => <View style={styles.spaceCol}/>}/>);
    }

    renderSentItem(item, index) {
        return (
            <TouchableOpacity style={styles.chatContainer}>
                <FastImage
                    style={styles.avatar}
                    source={{uri: item.item.avatar}}
                    resizeMode={FastImage.resizeMode.contain}/>
                <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.item.name}</Text>
                    <Text style={styles.time}>{item.item.time}</Text>
                </View>
                <TouchableOpacity>
                    <Text style={styles.invite}>Cancel</Text>
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
        fontSize: 14,
        fontFamily: Theme.fonts.regular
    },
    chatContainer: {
        padding: 10,
        flexDirection: 'row',
        borderRadius: 15,
        backgroundColor: '#FAFAFC',
        alignItems: 'flex-start'
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
        fontFamily: Theme.fonts.regular
    },
    time: {
        fontSize: 12,
        color: '#AAA8BF',
        marginTop: 5,
        fontFamily: Theme.fonts.regular
    },
    message: {
        flex: 1,
        fontSize: 12,
        color: 'black',
        fontFamily: Theme.fonts.regular
    },
    invite: {
        color: '#AAA8BF',
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
)(withNavigation(InvitationsScreen));
