import React from 'react';
import {ActivityIndicator, Dimensions, SafeAreaView, TouchableOpacity, View} from 'react-native';
import {NavigationActions, StackActions, withNavigation} from 'react-navigation';
import {connect} from 'react-redux';
import AppText from '../../../common/components/AppText';
import {translate} from '../../../common/services/translate';

import styles from './styles';
import AuthContainer from '../components/AuthContainer';
import ElevatedView from 'react-native-elevated-view';
import RouteNames from '../../../routes/names';
import Theme from '../../../theme';
import FastImage from 'react-native-fast-image';
import AuthInput from '../components/AuthInput';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import {extractErrorMessage} from '../../../common/services/utility';
import {setHasVerifiedPhone} from '../../../store/actions/auth';

const windowWidth = Dimensions.get('window').width;
const ICON_CONTAINER_SIZE = 25;
const ICON_SIZE = 14;

class PhoneVerificationScreen extends React.Component {

    constructor () {
        super();

        this.state = {
            loadingResend: false,
            loading: false,
            code: '',
        };
    }

    goBack = () => {
        this.props.navigation.navigate(RouteNames.HomeScreen);
    };

    verify = async () => {
        const {code} = this.state;
        await this.setState({loading: true});
        apiFactory.post('verify-code', {code}).then(async () => {
            this.setState({loading: false});
            await this.props.setHasVerifiedPhone(true);
            const backRoute = this.props.navigation.getParam('backScreenView');
            if (backRoute) {
                this.props.navigation.navigate(backRoute);
            } else {
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({routeName: RouteNames.BottomTabs})],
                });
                this.props.navigation.dispatch(resetAction);
            }
        }, async error => {
            this.setState({loading: false});
            alerts.error(translate('attention'), extractErrorMessage(error));
        });
    };

    resend = async () => {
        const {user} = this.props;
        await this.setState({loadingResend: true});
        apiFactory.post('send-verification-code', {phone: user.phone}).then(() => {
            this.setState({loadingResend: false});
        }, error => {
            this.setState({loadingResend: false});
            alerts.error(translate('attention'), extractErrorMessage(error));
        });
    };

    changeNumber = () => {
        this.props.navigation.navigate(RouteNames.EditPhoneScreen);
    };

    render () {
        const {user} = this.props;
        const {loading, loadingResend} = this.state;

        return <AuthContainer onBackPress={this.goBack}>
            <SafeAreaView style={styles.container}>
                <View style={[styles.centeredContainer]}>
                    <AppText style={styles.headerTitle}>{translate('phone_verification.header')}</AppText>
                    <ElevatedView elevation={1} style={[styles.mainContainer, {
                        alignItems: 'center',
                    }]}>
                        <View style={{
                            width: windowWidth - (Theme.sizes.normal) - (2 * Theme.sizes.large),
                            paddingHorizontal: Theme.sizes.normal,
                        }}>
                            <AppText style={{
                                marginVertical: Theme.sizes.base,
                                fontSize: 19,
                                textAlign: 'center',
                                fontFamily: 'SanFranciscoDisplay-Bold',
                                color: Theme.colors.text,
                            }}>{translate('phone_verification.text')}</AppText>
                            {
                                !!user.phone && <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    marginBottom: Theme.sizes.small,
                                }}>
                                    <View style={{flex: 4, alignItems: 'flex-end'}}>
                                        <View style={{
                                            width: ICON_CONTAINER_SIZE,
                                            height: ICON_CONTAINER_SIZE,
                                            backgroundColor: Theme.colors.cyan2,
                                            borderRadius: ICON_CONTAINER_SIZE / 2,
                                        }}>
                                            <FastImage
                                                source={require('../../../common/assets/images/auth/auth_phone_icon.png')}
                                                style={{
                                                    width: ICON_SIZE,
                                                    height: ICON_SIZE,
                                                    margin: (ICON_CONTAINER_SIZE - ICON_SIZE) / 2,
                                                }}
                                                resizeMode={FastImage.resizeMode.contain}/>
                                        </View>
                                    </View>
                                    <View style={{flex: 5, marginTop: 1}}>
                                        <AppText style={{
                                            fontFamily: 'SanFranciscoDisplay-Semibold',
                                            textAlign: 'center',
                                            color: Theme.colors.cyan2,
                                            fontSize: 17,
                                            height: ICON_CONTAINER_SIZE,
                                        }}>{user.phone}</AppText>
                                    </View>
                                    <View style={{flex: 4}}>

                                    </View>
                                </View>
                            }

                            <AuthInput
                                icon={require('../../../common/assets/images/auth/auth_lock_icon.png')}
                                placeholder={translate('phone_verification.placeholder')}
                                underlineColorAndroid={'transparent'}
                                keyboardType={'phone-pad'}
                                placeholderTextColor={'#DFDFDF'}
                                selectionColor={Theme.colors.cyan2}
                                onChangeText={code => this.setState({code})}
                                onSubmitEditing={() => this.onEmailDone()}
                                returnKeyType={'next'}
                                autoCapitalize={'none'}
                                value={this.state.email}
                            />

                            <TouchableOpacity
                                onPress={this.verify}
                                disabled={loading}
                                style={styles.verifyButton}>
                                {
                                    loading ? <ActivityIndicator
                                            style={styles.loginButtonText}
                                            size={Theme.sizes.normal}
                                            color={Theme.colors.whitePrimary}/>
                                        :
                                        <AppText style={styles.verifyButtonText}>
                                            {translate('phone_verification.button')}
                                        </AppText>
                                }
                            </TouchableOpacity>

                            <View style={{alignItems: 'center'}}>
                                <AppText style={styles.registerText}>
                                    {translate('phone_verification.not_received')}
                                </AppText>

                                <View style={{flexDirection: 'row'}}>
                                    <TouchableOpacity style={[styles.phoneFormActionButton, {marginRight: 2}]}
                                                      disabled={loadingResend}
                                                      onPress={this.resend}>
                                        {
                                            loadingResend ? <ActivityIndicator
                                                    style={styles.registerButtonText}
                                                    size={Theme.sizes.normal}
                                                    color={Theme.colors.cyan2}/>
                                                :
                                                <AppText style={styles.registerButtonText}>
                                                    {translate('phone_verification.resend')}
                                                </AppText>
                                        }
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.phoneFormActionButton, {marginLeft: 2}]}
                                                      onPress={this.changeNumber}>
                                        <AppText style={styles.registerButtonText}>
                                            {translate('phone_verification.change_number')}
                                        </AppText>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>
                    </ElevatedView>
                    <View style={{height: 80}}/>
                </View>
            </SafeAreaView>
        </AuthContainer>;
    }
}

function mapStateToProps ({app}) {
    return {
        user: app.user,
    };
}

export default connect(mapStateToProps, {
    setHasVerifiedPhone,
})(withNavigation(PhoneVerificationScreen));
