import React from 'react';
import {Image, View} from 'react-native';
import {connect} from 'react-redux';

import {translate} from '../../../common/services/translate';
import AppText from '../../../common/components/AppText';
import Theme from '../../../theme';
import {
    getAddressByCoordinates,
    getCurrentLocation,
    requestLocationPermission,
} from '../../../common/services/location';
import AppButton from '../../../common/components/AppButton';
import {setAddress} from '../../../store/actions/app';
import alerts from '../../../common/services/alerts';
import Config from '../../../config';

class LocationScreen extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            loadingLocation: false,
        };
    }

    getLocation = async (forcedRun) => {
        await this.setState({loadingLocation: true});
        try {
            //GETTING LOCATION
            const location = await getCurrentLocation();
            this.props.setAddress({
                coordinates: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                },
                address: await getAddressByCoordinates(location),
            });
        } catch (e) {
            requestLocationPermission().then(() => {
                //RETRYING GETTING LOCATION AFTER USER ACCEPTS PERMISSION
                if (!forcedRun) {
                    this.getLocation(true);
                }
            }).catch(() => {
                alerts.error(translate('splash_activate_location.title'), translate('splash_activate_location.description'));
            });
        }
        await this.setState({loadingLocation: false});
    };

    render () {
        const {loadingLocation} = this.state;

        return (
            <View style={Theme.styles.container}>
                <View style={Theme.styles.top}>
                    <Image source={require('../../../common/assets/images/location/location.png')}
                           style={Theme.styles.location}/>
                    <AppText style={Theme.styles.locationTitle}>
                        {translate('splash_activate_location.title')}
                    </AppText>
                    <AppText style={Theme.styles.locationDescription}>
                        {translate('splash_activate_location.description')}
                    </AppText>
                </View>

                <View style={Theme.styles.bottom}>
                    <AppButton title={translate('splash_activate_location.button')}
                               onPress={() => this.getLocation()}
                               loading={loadingLocation}
                               disabled={loadingLocation}/>
                </View>
            </View>
        );
    }

}

const mapStateToProps = () => ({});

export default connect(
    mapStateToProps,
    {
        setAddress,
    },
)(LocationScreen);
