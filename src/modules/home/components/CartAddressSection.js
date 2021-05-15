import {TouchableOpacity, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import AppText from '../../../common/components/AppText';
import {translate} from '../../../common/services/translate';
import Theme from '../../../theme';
import {TextField, ThemeProvider} from 'react-native-ios-kit';
import React from 'react';

const CartAddressSection = ({selectedAddress, addressesModal, staticMapUrl, outOfDeliveryArea, showInstructions, notes, setState}) => {

    return <View style={{
        backgroundColor: '#ffffff',
        padding: 15,
        marginVertical: 15,
    }}>
        <View style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
        }}>
            <TouchableOpacity onPress={() => addressesModal.open()}>
                <FastImage
                    style={{
                        width: 100,
                        height: 100,
                        marginRight: 20,
                    }}
                    source={{uri: staticMapUrl}}
                />
            </TouchableOpacity>
            <View>
                <AppText style={{
                    color: '#030217',
                    fontSize: 16,
                    marginBottom: 8,
                    marginTop: -5,
                    fontWeight: '700',
                }}>
                    {selectedAddress.city.split(',')[0]}</AppText>
                <AppText
                    style={{
                        color: '#404040',
                        fontSize: 14,
                        marginBottom: 10,
                    }}
                >
                    {selectedAddress.street}
                </AppText>
                <TouchableOpacity onPress={() => addressesModal.open()}>
                    <AppText style={{
                        color: '#1FCBD9',
                        fontSize: 14,
                    }}>{translate('cart.change_address')}</AppText>
                </TouchableOpacity>
            </View>
        </View>
        <View>
            {outOfDeliveryArea &&
            <View style={{
                paddingTop: 10,
            }}>
                <AppText style={{
                    fontSize: 14,
                    color: Theme.colors.danger,
                }}>
                    {translate('cart.out_of_range_address')}
                </AppText>
            </View>
            }
            <View
                style={{marginTop: 15, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#cbcbcb'}}/>
            <TouchableOpacity
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
                onPress={() => {
                    setState((prevState) => {
                        return {
                            showInstructions: !prevState.showInstructions,
                        };
                    });
                }}
            >
                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                    }}
                >
                    <FastImage
                        style={{
                            width: 18,
                            height: 20,
                            marginRight: 10,
                        }}
                        source={require('../../../common/assets/images/instruksione.png')}
                    />
                    <AppText style={{
                        color: '#030217',
                        fontSize: 14,
                    }}>
                        {translate('cart.sender_instructions')}
                    </AppText>
                </View>
                <FastImage
                    style={{
                        width: 17,
                        height: 17,
                        marginRight: -4,
                        resizeMode: 'contain',
                    }}
                    source={require('../../../common/assets/images/arrow250.png')}
                />
            </TouchableOpacity>
            {showInstructions &&
            <View
                style={{
                    marginTop: 5,
                    borderBottomWidth: 1,
                    borderBottomColor: '#cbcbcb',
                }}
            >
                <ThemeProvider>
                    <View>
                        <TextField
                            placeholder={translate('cart.sender_instructions_placeholder')}
                            defaultValue={notes}
                            onValueChange={text => {
                                setState({
                                    notes: text,
                                });
                            }}
                            underlineColorAndroid={'#fff'}
                            inputStyle={{fontSize: 14}}
                            containerStyle={{paddingLeft: 0}}
                        />
                    </View>
                </ThemeProvider>
            </View>
            }
        </View>
    </View>;
};

export default CartAddressSection;
