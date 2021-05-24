import React from 'react';
import {StyleSheet, TouchableOpacity, StatusBar, View, Text, FlatList, Image} from 'react-native';
import {withNavigation} from 'react-navigation';
import {connect} from 'react-redux';
import BackButton from "../../../common/components/buttons/back_button";
import {default as MaterialIcon} from 'react-native-vector-icons/MaterialIcons';
import RouteNames from "../../../routes/names";
import MapView, {Callout, PROVIDER_GOOGLE, Point} from "react-native-maps";
import {getCurrentLocation, NO_PERMISSION} from "../../../common/services/location";
import {SNAPFOODERS} from "../../../config/constants";
import FastImage from "react-native-fast-image";
import {default as MaterialCommunityIcon} from 'react-native-vector-icons/MaterialCommunityIcons';

class SnapfoodMapScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            latitude: 41.3275,
            longitude: 19.8187
        };
    }

    componentDidMount(): void {
        this.getMyLocation();
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerShown: false,
            headerTitle: null,
        };
    };

    getMyLocation = () => {
        getCurrentLocation().then(({ latitude, longitude }) => {
                this.setState({ latitude: latitude, longitude: longitude});
            }, (error) => {
                console.log(error);
                if (error.code === NO_PERMISSION) {

                } else {
                }
            }
        );
    };

    render() {
        return (
            <View style={styles.container}>
                <StatusBar translucent backgroundColor='rgba(255, 255, 255, 0.4)' />
                {this.renderMap()}
                {this.renderTitleBar()}
            </View>
        );
    }

    renderMap() {
        const iconSize = 60;
        let markerMale = (
            <Image
                onLoad={() => this.forceUpdate()}
                source={require('./../../../common/assets/images/chat/pin_male.png')}
                style={{
                    width: iconSize,
                    height: iconSize,
                    resizeMode: 'contain',
                    justifyContent: 'center',
                }}
            />
        );
        let markerFemale = (
            <Image
                onLoad={() => this.forceUpdate()}
                source={require('./../../../common/assets/images/chat/pin_female.png')}
                style={{
                    width: iconSize,
                    height: iconSize,
                    resizeMode: 'contain',
                    justifyContent: 'center',
                }}
            />
        );
        let markerRest = (
            <Image
                onLoad={() => this.forceUpdate()}
                source={require('./../../../common/assets/images/chat/pin_restaurant.png')}
                style={{
                    width: iconSize,
                    height: iconSize,
                    resizeMode: 'contain',
                    justifyContent: 'center',
                }}
            />
        );
        const {latitude, longitude} = this.state;
        return (
            <MapView
                provider={PROVIDER_GOOGLE}
                showsUserLocation={false}
                showsMyLocationButton={true}
                showsPointsOfInterest={false}
                showsBuildings={false}
                style={{width: '100%', height: '100%', position: 'absolute', top: 0, left: 0}}
                region={{
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.025,
                }}
                initialRegion={{
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.05,
                }}>
                <MapView.Marker
                    key={'marker_position'}
                    anchor={{x: 0.5, y: 0.5}}
                    coordinate={{latitude: latitude, longitude: longitude}}>
                    <View style={{width: 36, height: 36, borderRadius: 18, backgroundColor: '#25DEE240', alignItems: 'center', justifyContent: 'center'}}>
                        <View style={{width: 20, height: 20, borderRadius: 10, backgroundColor: '#23CBD8'}}/>
                    </View>
                    <Callout tooltip={true} onPress={() => {}}>
                        <View>
                            <View style={{width: 80, height: 40, backgroundColor: 'white', borderRadius: 12, alignItems: 'center', justifyContent: 'center', zIndex: 1, flexDirection: 'row', paddingHorizontal: 20}}>
                                <Text style={{color: 'black', fontSize: 16, fontWeight: 'bold'}}>You</Text>
                            </View>
                            <View style={{width: 20, height: 20, backgroundColor: 'white', transform: [{ rotate: '45deg'}], marginTop: -8, marginLeft: 30, zIndex: 0}} />
                        </View>
                    </Callout>
                </MapView.Marker>
                {
                    SNAPFOODERS.map((value, index) => {
                        return (<MapView.Marker
                            key={'marker_' + index}
                            coordinate={{
                                latitude: value.latitude,
                                longitude: value.longitude,
                            }}>
                                {value.type === 'user' && value.gender === 'male' && !!markerMale && markerMale}
                                {value.type === 'user' && value.gender === 'female' && !!markerFemale && markerFemale}
                                {value.type === 'restaurant' && !!markerRest && markerRest}
                            {value.type === 'user' && this.renderUserCallout(value)}
                            {value.type === 'restaurant' && this.renderRestaurantCallout(value)}
                        </MapView.Marker>);
                    })
                }
            </MapView>
        );
    }

    renderUserCallout(user) {
        return (
            <Callout tooltip={true} onPress={event => {this.props.navigation.push(RouteNames.CallScreen);}}>
                <View>
                    <View style={{width: 300, height: 60, backgroundColor: 'white', borderRadius: 12, alignItems: 'center', justifyContent: 'center', zIndex: 1, flexDirection: 'row', paddingHorizontal: 20}}>
                        <FastImage
                            style={{
                                width: 30,
                                height: 30,
                                resizeMode: 'contain',
                                justifyContent: 'center',
                                backgroundColor: 'red',
                                marginRight: 10,
                                borderRadius: 6
                            }}
                            source={{uri: user.avatar}}
                            resizeMode={FastImage.resizeMode.contain}/>
                        <Text style={{color: 'black', fontSize: 16, fontWeight: 'bold', marginRight: 5}}>{user.name}</Text>
                        <MaterialCommunityIcon name={"zodiac-libra"} size={18} color={'black'}/>
                        <View style={{flex: 1}} />
                        <View style={{width: 1, height: 20, backgroundColor: '#E9E9F7', marginRight: 10}}/>
                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
                            <MaterialCommunityIcon name="chat-processing" size={24} color={'#23CBD9'}/>
                            <Text style={{fontSize: 14, color: '#23CBD9', marginLeft: 5}}>Chat</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{width: 20, height: 20, backgroundColor: 'white', transform: [{ rotate: '45deg'}], marginTop: -8, marginLeft: 140, zIndex: 0}} />
                </View>
            </Callout>
        );
    }

    renderRestaurantCallout(restaurant) {
        return (
            <Callout tooltip={true} onPress={event => {console.log('------- onPress ------------');}}>
                <View>
                    <View style={{width: 200, height: 80, backgroundColor: 'white', borderRadius: 12, alignItems: 'center', justifyContent: 'center', zIndex: 1}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                            <Image
                                onLoad={() => this.forceUpdate()}
                                source={{uri: restaurant.avatar}}
                                style={{
                                    width: 30,
                                    height: 30,
                                    resizeMode: 'contain',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 10,
                                    borderRadius: 6
                                }}
                            />
                            <Text style={{color: 'black', fontSize: 16, fontWeight: 'bold'}}>{restaurant.name}</Text>
                        </View>
                        <Text style={{color: '#23CBD8', fontSize: 12, marginTop: 5}}>In Delivery Range</Text>
                    </View>
                    <View style={{width: 20, height: 20, backgroundColor: 'white', transform: [{ rotate: '45deg'}], marginTop: -8, marginLeft: 90, zIndex: 0}} />
                </View>
            </Callout>
        );
    }

    renderTitleBar() {
        return (
            <View style={styles.titleContainer}>
                <BackButton onPress={() => {
                    this.props.navigation.pop();
                }}/>
                <View style={{flex: 1}}>
                </View>
                <TouchableOpacity style={styles.groupButton} onPress={() => {
                    this.props.navigation.push(RouteNames.SnapfoodersScreen);
                }}>
                    <MaterialCommunityIcon name="account-group" size={30} color={'black'}/>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'red',
    },
    titleContainer: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        position: 'absolute',
        top: 50,
        left: 0
    },
    groupButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
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
)(withNavigation(SnapfoodMapScreen));
