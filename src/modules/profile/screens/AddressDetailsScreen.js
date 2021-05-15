import React from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { translate } from '../../../common/services/translate';
import FontelloIcon from '../../../common/components/FontelloIcon';
import Theme from '../../../theme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MapView from 'react-native-maps';
import {
    getAddressByCoordinates,
    getCurrentLocation,
    NO_PERMISSION,
    requestLocationPermission,
} from '../../../common/services/location';
import AppText from '../../../common/components/AppText';
import Config from '../../../config';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import ContentLoader from '@sarmad1995/react-native-content-loader';
import { saveAddress } from '../../../store/actions/app';
import alerts from '../../../common/services/alerts';
import { extractErrorMessage } from '../../../common/services/utility';
import RouteNames from '../../../routes/names';
import { add } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

class AddressDetailsScreen extends React.Component {
    constructor(props) {
        super(props);

        const address = props.navigation.getParam('address', {});
        if (address.lat) {
            address.lat = parseFloat(address.lat);
        }
        if (address.lng) {
            address.lng = parseFloat(address.lng);
        }

        this.state = {
            loadingLocation: false,
            loaded: false,
            address,
        };
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: translate('add_new_address.header'),
            headerRight: navigation.getParam('rightHeaderIcons', () => {
                return <ActivityIndicator size={Theme.icons.small} color={Theme.colors.primary} />;
            }),
        };
    };

    componentDidMount(): void {
        const { address } = this.state;
        if (address.id) {
            this._setAddressData(address);
        } else {
            this._getFirstLocation().then();
        }
    }

    _setAddressData = () => {
        setTimeout(async () => {
            await this.setState({ loaded: true });
            this.setSaveButton();
        }, 250);
    };

    setSpinner = () => {
        this.props.navigation.setParams({
            rightHeaderIcons: () => {
                return <ActivityIndicator size={Theme.icons.small} color={Theme.colors.white} />;
            },
        });
    };

    setSaveButton = () => {
        this.props.navigation.setParams({
            rightHeaderIcons: () => {
                return (
                  <TouchableOpacity onPress={this.save}>
                      <View style={[{ justifyContent: 'center', alignItems: 'center' }]}>
                          <FontelloIcon icon='ok-1' size={Theme.icons.small} color={Theme.colors.text} />
                      </View>
                  </TouchableOpacity>
                );
            },
        });
    };

    save = () => {
        const { state } = this.props.navigation;
        this.setSpinner();
        this.props.saveAddress(this.state.address, state.routeName === RouteNames.HomeAddressDetailsScreen).then(
          () => {
              this.setSaveButton();
              this.props.navigation.goBack();
          },
          (error) => {
              this.setSaveButton();
              alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(error));
          }
        );
    };

    setAddressByCoordinates = async (locationObj) => {
        const currentAddress = await getAddressByCoordinates(locationObj);
        const { address } = this.state;
        address.street = currentAddress.street;
        address.city = currentAddress.city + ', ' + currentAddress.country;
        address.country = currentAddress.country;
        address.lat = locationObj.latitude;
        address.lng = locationObj.longitude;
        this.autoComplete.setAddressText(
          currentAddress.street + ', ' + currentAddress.city + ', ' + currentAddress.country
        );
        await this.setState({ address });
    };

    onMarkerDragEnd = async (evt) => {
        this.setAddressByCoordinates({
            latitude: evt.nativeEvent.coordinate.latitude,
            longitude: evt.nativeEvent.coordinate.longitude,
        });
    };

    renderAddressLabelInput = () => {
        return (
          <AppText
            style={{
                fontFamily: 'SanFranciscoDisplay-Bold',
                color: '#000',
                fontSize: 14,
                textAlign: 'center',
                marginTop: 15,
                marginBottom: 10,
            }}
          >
              {translate('add_new_address.please_enter_address')}
          </AppText>
        );
    };

    _getLocation = async () => {
        await this.setState({ loadingLocation: true });
        getCurrentLocation().then(
          async ({ latitude, longitude }) => {
              await this.setState({ loadingLocation: false });
              await this.setAddressByCoordinates(this.props.coordinates);
          },
          async (error) => {
              if (error.code === NO_PERMISSION) {
                  this.setState({ loadingLocation: false });
                  requestLocationPermission(Config.isAndroid).catch(() => {
                      alerts.error(translate('attention'), translate('locationUnavailable'));
                  });
              } else {
                  await this.setState({ loadingLocation: false });
              }
          }
        );
    };

    _getFirstLocation = async () => {
        try {
            await this.setAddressByCoordinates(this.props.coordinates);
            await this.setState({ loaded: true });
            this.setSaveButton();
        } catch (e) {
            await this.setState({ loaded: true });
            this.setSaveButton();
        }
    };

    renderAddressInput = () => {
        const { loadingLocation } = this.state;
        return (
          <View
            style={{
                flexDirection: 'row',
                borderWidth: 0.3,
                marginHorizontal: 15,
                borderTopWidth: 0.3,
                borderTopColor: '#9b9b9b',
                borderBottomWidth: 0.3,
                borderBottomColor: '#9b9b9b',
                borderColor: '#9b9b9b',
                marginBottom: 16,
                alignItems: 'flex-start',
            }}
          >
              <GooglePlacesAutocomplete
                placeholder={this.state.address.street + ', ' + this.state.address.city}
                minLength={2}
                getDefaultValue={() => this.state.address.street + ', ' + this.state.address.city}
                autoFocus={false}
                ref={(el) => (this.autoComplete = el)}
                returnKeyType={'default'}
                fetchDetails={true}
                listViewDisplayed={false}
                query={{
                    key: Config.GOOGLE_MAP_API_KEY,
                    language: 'sq',
                    components: 'country:al|country:xk',
                    types: 'geocode',
                }}
                onPress={(data, details = null) => {
                    let street = '';
                    let city = '';
                    for (let i = 0; i < details.address_components.length; i++) {
                        if (
                          details.address_components[i].types.includes('neighborhood') ||
                          details.address_components[i].types.includes('route')
                        ) {
                            street = details.address_components[i].long_name;
                        }
                        if (
                          details.address_components[i].types.includes('locality') ||
                          details.address_components[i].types.includes('postal_town')
                        ) {
                            city = details.address_components[i].long_name;
                        }
                    }
                    let address = Object.assign({}, this.state.address);

                    // address.street = data['structured_formatting']['main_text'] || details;
                    // address.city = data['structured_formatting']['secondary_text'];

                    address.street = street;
                    address.city = city;
                    address.lat = details.geometry.location.lat;
                    address.lng = details.geometry.location.lng;
                    this.setState({ address });
                }}
                styles={{
                    textInputContainer: {
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderBottomWidth: 0,
                        borderTopWidth: 0,
                        height: 35,
                    },
                    textInput: [
                        {
                            fontSize: 13.5,
                            marginTop: 4,
                        },
                    ],
                    predefinedPlacesDescription: {
                        fontSize: 14,
                        color: '#252525',
                    },
                }}
              />
              <TouchableOpacity onPress={() => this.autoComplete.triggerFocus()}>
                  <Image
                    source={require('./../../../common/assets/images/location_address_search.png')}
                    style={{
                        width: 15,
                        height: 15,
                        resizeMode: 'contain',
                        justifyContent: 'center',
                        marginRight: 10,
                        marginTop: 10,
                    }}
                  />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                    if (!loadingLocation) {
                        this._getLocation();
                    }
                }}
              >
                  {loadingLocation ? (
                    <ActivityIndicator
                      style={{
                          justifyContent: 'center',
                          alignContent: 'center',
                          marginRight: 10,
                          marginTop: 10,
                      }}
                      size={15}
                      color={Theme.colors.primary}
                    />
                  ) : (
                    <Image
                      source={require('./../../../common/assets/images/location_address_icon.png')}
                      style={{
                          width: 15,
                          height: 15,
                          resizeMode: 'contain',
                          justifyContent: 'center',
                          marginRight: 10,
                          marginTop: 10,
                      }}
                    />
                  )}
              </TouchableOpacity>
          </View>
        );
    };

    inputUpdated = (value, prop) => {
        const { address } = this.state;
        address[prop] = value;
        this.setState({ address });
    };

    focusOn = (input) => {
        this[input].focus();
    };

    renderAddressForm = () => {
        const { address } = this.state;
        return (
          <View>
              <View style={{ backgroundColor: '#f3f3f3', paddingHorizontal: 15, paddingVertical: 10 }}>
                  <AppText>{translate('add_new_address.add_address_details')}</AppText>
              </View>
              <View>
                  <TextInput
                    style={styles.textInput}
                    placeholder={translate('add_new_address.name')}
                    returnKeyType={'next'}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    onSubmitEditing={() => this.focusOn('notes')}
                    underlineColorAndroid={'transparent'}
                    placeholderTextColor={Theme.colors.gray3}
                    selectionColor={Theme.colors.cyan2}
                    onChangeText={(value) => this.inputUpdated(value, 'address_type')}
                    value={address['address_type']}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder={translate('add_new_address.driver_instructions')}
                    ref={(input) => {
                        this.notes = input;
                    }}
                    returnKeyType={'done'}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    onSubmitEditing={() => this.save()}
                    underlineColorAndroid={'transparent'}
                    placeholderTextColor={Theme.colors.gray3}
                    selectionColor={Theme.colors.cyan2}
                    onChangeText={(value) => this.inputUpdated(value, 'notes')}
                    value={address.notes}
                  />
              </View>
          </View>
        );
    };

    renderMap = () => {
        const { lat, lng } = this.state.address;
        if (!lat || !lng) {
            return null;
        }
        let marker;
        if (Platform.OS === 'ios') {
            marker = (
              <Image
                onLoad={() => this.forceUpdate()}
                source={require('./../../../common/assets/images/custom_marker_location.png')}
                style={{
                    width: 40,
                    height: 40,
                    resizeMode: 'contain',
                    justifyContent: 'center',
                }}
              />
            );
        }
        return (
          <MapView
            style={{ height: 300, width: width }}
            region={{
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.012,
                longitudeDelta: 0.019,
            }}
          >
              <MapView.Marker
                draggable
                coordinate={{
                    latitude: lat,
                    longitude: lng,
                }}
                onDragEnd={(e) => this.onMarkerDragEnd(e)}
              >
                  {!!marker && marker}
              </MapView.Marker>
          </MapView>
        );
    };

    render() {
        const { loaded } = this.state;
        if (!loaded) {
            return (
              <View>
                  <ContentLoader pRows={1} title={false} pHeight={[300]} pWidth={[width - 20]} />
                  <ContentLoader pRows={1} title={false} pHeight={[25]} pWidth={[width - 20]} />
                  <ContentLoader pRows={1} title={false} pHeight={[45]} pWidth={[width - 20]} />
                  <ContentLoader pRows={1} title={false} pHeight={[45]} pWidth={[width - 20]} />
                  <ContentLoader pRows={1} title={false} pHeight={[45]} pWidth={[width - 20]} />
              </View>
            );
        }
        return (
          <KeyboardAwareScrollView
            style={[{ flex: 1 }, { backgroundColor: '#ffffff' }]}
            extraScrollHeight={65}
            enableOnAndroid={true}
            keyboardShouldPersistTaps='handled'
          >
              <View>
                  {this.renderMap()}
                  {this.renderAddressLabelInput()}
                  {this.renderAddressInput()}
                  {this.renderAddressForm()}
              </View>
          </KeyboardAwareScrollView>
        );
    }
}

const styles = StyleSheet.create({
    textInput: {
        height: 40,
        paddingHorizontal: Theme.sizes.tiny,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.darkerBackground,
    },
});

function mapStateToProps({ app }) {
    return {
        coordinates: app.coordinates,
    };
}

export default connect(mapStateToProps, {
    saveAddress,
})(AddressDetailsScreen);
