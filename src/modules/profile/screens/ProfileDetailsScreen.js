import React from 'react';
import {ActivityIndicator, StyleSheet, TouchableOpacity, View} from 'react-native';
import {connect} from 'react-redux';
import {translate} from '../../../common/services/translate';
import Theme from '../../../theme';
import AppText from '../../../common/components/AppText';
import {extractErrorMessage, validateUserData} from '../../../common/services/utility';
import {updateProfileDetails} from '../../../store/actions/auth';
import alerts from '../../../common/services/alerts';
import RouteNames from '../../../routes/names';
import {Button, TextField, ThemeProvider} from 'react-native-ios-kit';
import FontelloIcon from '../../../common/components/FontelloIcon';

const theme = {
    ...ThemeProvider,
    primaryColor: Theme.colors.cyan1,
};

class ProfileDetailsScreen extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            user: props.user,
        };
    }

    static navigationOptions = ({navigation}) => {
        const save = navigation.getParam('saveAction', () => {
        });

        return {
            title: translate('account_details.header_title'),
            headerRight: navigation.getParam('rightHeaderAction', () => {
                return <TouchableOpacity onPress={save}>
                    <FontelloIcon icon="ok-1" size={Theme.icons.small}
                                  color={Theme.colors.text}/>
                </TouchableOpacity>;
            }),
        };
    };

    componentDidMount () {
        this.props.navigation.setParams({saveAction: this.save});
    }

    setLoader = () => {
        this.props.navigation.setParams({
            rightHeaderAction: () => {
                return <ActivityIndicator size={Theme.sizes.small} color={Theme.colors.primary}/>;
            },
        });
    };

    setSaveButton = () => {
        this.props.navigation.setParams({
            rightHeaderAction: () => {
                return <TouchableOpacity onPress={this.save}>
                    <AppText style={styles.saveButton}>{translate('account_details.submit')}</AppText>
                </TouchableOpacity>;
            },
        });
    };

    save = () => {
        const {user} = this.state;
        validateUserData(user).then(async () => {
            this.setLoader();
            try {
                await this.props.updateProfileDetails(user);
                this.props.navigation.goBack();
            } catch (e) {
                alerts.error('Error', extractErrorMessage(e));
                this.setSaveButton();
            }
        });
    };

    inputUpdated = (value, prop) => {
        const {user} = this.state;
        user[prop] = value;
        this.setState({user});
    };

    render () {
        const {user} = this.state;

        return (
            <View style={styles.container}>
                <ThemeProvider>
                    <View>
                        <TextField
                            placeholder={translate('account_details.full_name')}
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            placeholderTextColor={Theme.colors.gray3}
                            selectionColor={Theme.colors.cyan2}
                            onValueChange={full_name => this.inputUpdated(full_name, 'full_name')}
                            defaultValue={user.full_name}
                        />
                        <TextField
                            placeholder={translate('account_details.email')}
                            autoCorrect={false}
                            autoCapitalize={'none'}
                            keyboardType={'email-address'}
                            underlineColorAndroid={'transparent'}
                            placeholderTextColor={Theme.colors.gray3}
                            selectionColor={Theme.colors.cyan2}
                            onValueChange={email => this.inputUpdated(email, 'email')}
                            defaultValue={user.email}
                        />
                        <TextField
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            returnKeyType={'done'}
                            autoCapitalize={'none'}
                            onSubmitEditing={() => this.save()}
                            keyboardType={'phone-pad'}
                            placeholderTextColor={Theme.colors.gray3}
                            selectionColor={Theme.colors.cyan2}
                            onValueChange={phone => this.inputUpdated(phone, 'phone')}
                            defaultValue={user.phone}
                            placeholder={translate('account_details.phone')}
                        />
                        <ThemeProvider theme={theme}>
                            <View style={{padding: 10}}>
                                <Button
                                    inline
                                    onPress={() =>
                                        this.props.navigation.navigate(RouteNames.ChangePasswordScreen)
                                    }>
                                    {translate('account_details.password')}
                                </Button>
                            </View>
                        </ThemeProvider>
                    </View>
                </ThemeProvider>
                {/*<View style={{flex: 1, padding: 10, justifyContent: 'flex-end'}}>*/}
                {/*    <AppButton*/}
                {/*        title={translate('account_change_pass.header_title')}*/}
                {/*        onPress={() => this.props.navigation.navigate(RouteNames.ChangePasswordScreen)}/>*/}
                {/*</View>*/}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
    saveButton: {
        color: Theme.colors.primary,
    },
    textInput: {
        height: 40,
        paddingHorizontal: Theme.sizes.tiny,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.darkerBackground,
    },
});

function mapStateToProps ({app}) {
    return {
        user: app.user,
    };
}

export default connect(
    mapStateToProps,
    {
        updateProfileDetails,
    },
)(ProfileDetailsScreen);
