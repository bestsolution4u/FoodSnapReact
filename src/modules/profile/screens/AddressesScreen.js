import React from 'react';
import {Dimensions, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View} from 'react-native';
import {translate} from '../../../common/services/translate';
import Theme from '../../../theme';
import AppText from '../../../common/components/AppText';
import {connect} from 'react-redux';
import FastImage from 'react-native-fast-image';
import RBSheet from 'react-native-raw-bottom-sheet';
import AppListItem from '../../../common/components/AppListItem';
import {setStoreAddress} from '../../../store/actions/shop';
import alerts from '../../../common/services/alerts';
import RouteNames from '../../../routes/names';
import FontelloIcon from '../../../common/components/FontelloIcon';
import {deleteAddress, getAddresses, setAddressAsDefault} from '../../../store/actions/app';
import {extractErrorMessage} from '../../../common/services/utility';

const screenWidth = Dimensions.get('screen').width;

class AddressesScreen extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            refreshingAddresses: false,
            selectedAddress: null,
        };
    }

    static navigationOptions = ({navigation}) => {
        return {
            title: translate('address_list.header_title'),
            headerRight: () => {
                return <TouchableOpacity onPress={() => navigation.push(RouteNames.AddressDetailsScreen)}>
                    <View style={[{justifyContent: 'center', alignItems: 'center'}]}>
                        <FontelloIcon icon="plus" size={Theme.icons.base}
                                      color={Theme.colors.text}/>
                    </View>
                </TouchableOpacity>;
            },
        };
    };

    componentDidMount (): void {
        this.focusListener = this.props.navigation.addListener('didFocus', () => {
            this.props.getAddresses();
        });
    }

    componentWillUnmount (): void {
        this.focusListener.remove();
    }

    renderAddress = (item) => {
        let source = require('../../../common/assets/images/account/adresat-not-primary.png');
        if (item.favourite) {
            source = require('../../../common/assets/images/account/adresat.png');
        }

        return <TouchableOpacity style={styles.itemContainer} onPress={() => this.openBottomMenu(item)}>
            <View style={styles.imageContainer}>
                <FastImage
                    source={source}
                    resizeMode={FastImage.resizeMode.contain}
                    style={styles.image}
                />
            </View>
            <View style={styles.textContainer}>
                {
                    !!item.city && <AppText style={styles.title}>{item.city}</AppText>
                }
                {
                    !!item.street && <AppText style={styles.subTitle}>{item.street}</AppText>
                }
            </View>
        </TouchableOpacity>;
    };

    openBottomMenu = (address) => {
        this.setState({selectedAddress: address});
        this.bottomMenu.open();
    };

    closeBottomMenu = () => {
        this.bottomMenu.close();
    };

    setAsDefault = () => {
        //this.props.setStoreAddress(this.state.selectedAddress);
        this.closeBottomMenu();
        try {
            this.props.setAddressAsDefault(this.state.selectedAddress).then(() => {
                this._refresh();
            });
        } catch (e) {
        }
        this.setState({selectedAddress: null});
    };

    edit = () => {
        const address = {...this.state.selectedAddress};
        this.setState({selectedAddress: null});
        this.closeBottomMenu();
        this.props.navigation.push(RouteNames.AddressDetailsScreen, {
            address,
        });
    };

    delete = () => {
        alerts.confirmation(translate('attention'), translate('alerts.confirm_delete_address')).then(() => {
            this.props.deleteAddress(this.state.selectedAddress.id).then(async () => {
                await this.setState({selectedAddress: null});
                await this.closeBottomMenu();
            }, error => alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(error)));
        });
    };

    renderBottomMenu = () => {
        return <RBSheet ref={ref => this.bottomMenu = ref}
                        closeOnDragDown={true}
                        duration={300}
                        closeOnPressBack={true}
                        height={180 + this.props.safeAreaDims.bottom}
                        customStyles={{
                            container: {
                                paddingHorizontal: 15,
                                borderTopLeftRadius: 10,
                                borderTopRightRadius: 10,
                                alignItems: 'center',
                            },
                        }}>
            <AppListItem title={translate('address_list.set_as_favourite')}
                         icon={'snap-heart'}
                         iconSize={Theme.icons.small}
                         color={Theme.colors.text}
                         iconColor={Theme.colors.text}
                         fontSize={17}
                         type={Theme.sizes.xTiny}
                         onPress={this.setAsDefault}/>
            <AppListItem title={translate('address_list.edit')}
                         icon={'snap-pen'}
                         iconSize={Theme.icons.small}
                         color={Theme.colors.text}
                         iconColor={Theme.colors.text}
                         fontSize={17}
                         type={Theme.sizes.xTiny}
                         onPress={this.edit}/>
            <AppListItem title={translate('address_list.delete')}
                         icon={'snap-trash'}
                         iconSize={Theme.icons.small}
                         color={Theme.colors.text}
                         iconColor={Theme.colors.text}
                         fontSize={17}
                         type={Theme.sizes.xTiny}
                         onPress={this.delete}/>
        </RBSheet>;
    };

    _refresh = async () => {
        await this.setState({refreshingAddresses: true});
        try {
            await this.props.getAddresses();
            await this.setState({refreshingAddresses: false});
        } catch (e) {
            await this.setState({refreshingAddresses: false});
        }
    };

    renderNoAddresses = () => {
        return <View style={{marginTop: 50, marginBottom: 300}}>
            <View style={Theme.styles.noData.imageContainer}>
                <FastImage
                    resizeMode={FastImage.resizeMode.contain}
                    source={require('../../../common/assets/images/orders/noorders.png')}
                    style={Theme.styles.noData.noImage}
                />
            </View>
            <AppText style={Theme.styles.noData.noTitle}>
                {translate('address_list.no_addresses')}
            </AppText>
            <AppText style={Theme.styles.noData.noDescription}>
                {translate('address_list.no_addresses_message')}
            </AppText>
            <TouchableOpacity onPress={() => this.props.navigation.push(RouteNames.AddressDetailsScreen)}
                              style={Theme.styles.noData.button}>
                <AppText style={Theme.styles.noData.buttonText}>{translate('address_list.create_new')}</AppText>
            </TouchableOpacity>
        </View>;
    };

    render () {
        const {refreshingAddresses} = this.state;
        const {addresses} = this.props;

        return (
            <View>
                <FlatList data={addresses}
                          extraData={this.state}
                          keyExtractor={i => i.id.toString()}
                          ListEmptyComponent={this.renderNoAddresses()}
                          refreshControl={
                              <RefreshControl
                                  refreshing={refreshingAddresses}
                                  onRefresh={() => this._refresh()}
                              />
                          }
                          renderItem={({item}) => {
                              return this.renderAddress(item);
                          }}
                />
                {this.renderBottomMenu()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        width: screenWidth - 60,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingRight: 5,
    },
    image: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 18,
        fontFamily: 'SanFranciscoDisplay-Medium',
    },
    subTitle: {
        fontSize: Theme.sizes.tiny,
        fontFamily: 'SanFranciscoDisplay-Light',
        color: '#595959',
    },
    menuItem: {
        marginVertical: 10,
        flexDirection: 'row',
    },
    menuIcon: {
        justifyContent: 'flex-end',
        alignContent: 'flex-end',
    },
});

function mapStateToProps ({app, shop}) {
    return {
        addresses: app.addresses,
        selectedAddress: shop.address,
        safeAreaDims: app.safeAreaDims,
    };
}

export default connect(
    mapStateToProps,
    {
        getAddresses,
        setStoreAddress,
        deleteAddress,
        setAddressAsDefault,
    },
)(AddressesScreen);
