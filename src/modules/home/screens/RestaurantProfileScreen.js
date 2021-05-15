import React from 'react';
import {Dimensions, ScrollView, StyleSheet, View} from 'react-native';
import MapView from 'react-native-maps';

import Theme from '../../../theme';
import {getLanguage, translate} from '../../../common/services/translate';
import AppText from '../../../common/components/AppText';

const {width} = Dimensions.get('window');


class RestaurantProfileScreen extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            loaded: false,
            language: getLanguage(),
            restaurant: props.navigation.getParam('restaurant'),
        };
    }

    static navigationOptions = (props) => {
        const restaurant = props.navigation.getParam('restaurant');
        return {
            title: restaurant.title,
        };
    };

    componentDidMount (): void {
        //Workaround to avoid slow animation on screen transition
        setTimeout(() => {
            this.setState({loaded: true});
        }, 300);
    }

    getReadableTime = (time) => {
        return time.slice(0, 5);
    };

    render () {
        const {restaurant, language, loaded} = this.state;

        return (
            <ScrollView style={styles.container}>
                {
                    loaded && <MapView style={styles.map}
                                       initialRegion={{
                                           latitude: parseFloat(restaurant.latitude),
                                           longitude: parseFloat(restaurant.longitude),
                                           latitudeDelta: 0.012,
                                           longitudeDelta: 0.019,
                                       }}>
                        <MapView.Marker
                            tracksViewChanges={false}
                            coordinate={{
                                latitude: parseFloat(restaurant.latitude),
                                longitude: parseFloat(restaurant.longitude),
                            }}
                            pinColor="rgba(128, 0, 0, 1)"/>
                    </MapView>
                }

                <View style={{paddingHorizontal: 10}}>
                    <View>
                        <AppText style={styles.title}>{restaurant.title}</AppText>
                        {
                            restaurant.description !== '' && restaurant.title.toLowerCase() !== restaurant.description.toLowerCase() &&
                            <AppText style={styles.desc}>{restaurant.description}</AppText>
                        }
                        <AppText style={styles.time}>
                            {translate('vendor_profile_info.working_hours')}
                        </AppText>
                    </View>

                    {
                        restaurant['vendor_opening_days'].map(openingDay => {
                            return <View key={openingDay['week_day']} style={styles.timeContainer}>
                                <View style={styles.timeItem}>
                                    <AppText style={styles.time}>
                                        {openingDay[`title_${language}`]}
                                    </AppText>
                                </View>
                                <View style={styles.timeItem}/>
                                <View style={[styles.timeItem, {alignItems: 'flex-end'}]}>
                                    <AppText style={styles.time}>
                                        {this.getReadableTime(openingDay['time_open'])} - {this.getReadableTime(openingDay['time_close'])}
                                    </AppText>
                                </View>
                            </View>;
                        })
                    }
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    map: {
        height: 200,
        width: width,
    },
    title: {
        color: Theme.colors.black,
        fontFamily: 'SanFranciscoDisplay-Bold',
        textAlign: 'justify',
        fontSize: 18,
        padding: 10,
        paddingBottom: 0,
    },
    desc: {
        color: Theme.colors.black,
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 16,
        paddingLeft: 10,
        padding: 5,
        textAlign: 'justify',
    },
    time: {
        color: Theme.colors.black,
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 16,
        padding: 10,
        textAlign: 'justify',
    },
    timeContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.listBorderColor,
    },
    timeItem: {
        flex: 1,
    },
});

export default RestaurantProfileScreen;
