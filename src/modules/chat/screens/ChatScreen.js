import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {withNavigation} from 'react-navigation';
import {connect} from 'react-redux';
import {Bubble, GiftedChat, Message, MessageText, SystemMessage, Time} from 'react-native-gifted-chat';
import {translate} from '../../../common/services/translate';
import {sendMessage, setMessagesSeen} from '../../../store/actions/chat';
import Theme from '../../../theme';
import RouteNames from '../../../routes/names';
import FastImage from 'react-native-fast-image';

class ChatScreen extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            messages: [],
            loadEarlier: true,
            typingText: null,
            isLoadingEarlier: false,
        };
    }

    static navigationOptions = ({navigation}) => {
        return {
            title: 'Chat',
            headerLeft: () => {
                return <TouchableOpacity onPress={() => navigation.navigate(RouteNames.HomeScreen)}>
                    <FastImage
                        resizeMode={FastImage.resizeMode.contain}
                        source={require('../../../common/assets/images/user/close_modal.png')}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                        }}
                    />
                </TouchableOpacity>;
            },
        };
    };

    componentWillUnmount () {
        this.focusListener.remove();
    }

    componentDidMount () {
        const {navigation} = this.props;
        this.focusListener = navigation.addListener('didFocus', () => {
            this.checkForMessages();
            this.props.setMessagesSeen();
        });
    }

    componentDidUpdate () {
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

    onSend (message = []) {
        this.props.sendMessage(message);
    }

    renderBubble (props) {
        return (
            <Bubble{...props}
                   messageTextProps={{
                       textStyle: {
                           right: {
                               text: {color: 'black'},
                           },
                       },
                   }}
                   wrapperStyle={{
                       left: {
                           backgroundColor: Theme.colors.primary,
                       },
                       right: {
                           backgroundColor: '#f0f0f0',
                       },
                   }}
            />
        );
    }

    renderMessage (props) {
        return <Message
            {...props}
        />;
    }

    renderMessageText (props) {
        return <MessageText
            {...props}
            textStyle={
                {
                    right: {color: 'black'},
                    left: {color: '#f0f0f0'},
                }}
        />;
    }

    renderSystemMessage (props) {
        return (
            <SystemMessage
                {...props}

                containerStyle={{
                    marginBottom: 15,
                }}
                textStyle={{
                    fontSize: 14,
                }}
            />
        );
    }

    renderFooter () {
        if (this.state.typingText) {
            return (
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>
                        {this.state.typingText}
                    </Text>
                </View>
            );
        }
        return null;
    }

    renderTime (props) {
        return (
            <Time
                {...props}
                timeTextStyle={{
                    right: {color: 'grey'},
                    left: {color: '#2c2c2c'},
                }}
            />
        );
    }

    render () {
        const {user, messages, safeAreaDims} = this.props;

        return (
            <View style={{flex: 1}}>
                <GiftedChat showUserAvatar
                            bottomOffset={55 + safeAreaDims.bottom}
                            user={{
                                _id: user.id,
                                name: user.full_name,
                            }}
                            messages={messages}
                            autoCorrect={false}
                            placeholder={translate('chat.placeholder')}
                            renderMessage={this.renderMessage}
                            renderMessageText={this.renderMessageText}
                            renderTime={props => this.renderTime(props)}
                            renderBubble={props => this.renderBubble(props)}
                            renderSystemMessage={props => this.renderSystemMessage(props)}
                            renderFooter={props => this.renderFooter(props)}
                            onSend={(messages) => this.onSend(messages[0])}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    footerContainer: {
        marginTop: 5,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
    },
    footerText: {
        fontSize: 14,
        color: '#aaa',
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
