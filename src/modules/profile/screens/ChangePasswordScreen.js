import React from 'react';
import {ActivityIndicator, StyleSheet, TouchableOpacity, View} from 'react-native';
import {connect} from 'react-redux';
import {translate} from '../../../common/services/translate';
import Theme from '../../../theme';
import AppText from '../../../common/components/AppText';
import {extractErrorMessage, validatePassword} from '../../../common/services/utility';
import {changePassword, updateProfileDetails} from '../../../store/actions/auth';
import alerts from '../../../common/services/alerts';
import {TextField, ThemeProvider} from 'react-native-ios-kit';
import FontelloIcon from '../../../common/components/FontelloIcon';

class ChangePasswordScreen extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            user: props.user,
            password: '',
            password_confirmation: '',
        };
    }

    static navigationOptions = ({navigation}) => {
        const save = navigation.getParam('saveAction', () => {
        });

        return {
            title: translate('account_change_pass.header_title'),
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
        const {password, password_confirmation} = this.state;
        validatePassword(password, password_confirmation).then(async () => {
            this.setLoader();
            try {
                this.props.changePassword(password).then(() => {
                    this.props.navigation.goBack();
                });
            } catch (e) {
                alerts.error('Error', extractErrorMessage(e));
                this.setSaveButton();
            }
        });
    };

    inputUpdated = (value, prop) => {
        this.setState({[prop]: value});
    };

    render () {
        return (
            <View style={styles.container}>
                <ThemeProvider>
                    <View>
                        <TextField
                            placeholder={translate('account_change_pass.password')}
                            autoCapitalize={'none'}
                            secureTextEntry={true}
                            autoCorrect={false}
                            underlineColorAndroid={'transparent'}
                            placeholderTextColor={Theme.colors.gray3}
                            selectionColor={Theme.colors.cyan2}
                            onValueChange={password => this.inputUpdated(password, 'password')}
                        />
                        <TextField
                            placeholder={translate('account_change_pass.re_type_password')}
                            ref={(input) => {
                                this.password_confirmation = input;
                            }}
                            autoCorrect={false}
                            returnKeyType={'done'}
                            autoCapitalize={'none'}
                            secureTextEntry={true}
                            onSubmitEditing={() => this.save()}
                            underlineColorAndroid={'transparent'}
                            placeholderTextColor={Theme.colors.gray3}
                            selectionColor={Theme.colors.cyan2}
                            onValueChange={password => this.inputUpdated(password, 'password_confirmation')}
                        />
                    </View>
                </ThemeProvider>
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
        changePassword,
    },
)(ChangePasswordScreen);
