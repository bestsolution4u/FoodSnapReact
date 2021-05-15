import React from 'react';
import {FlatList, SafeAreaView, View} from 'react-native';
import {connect} from 'react-redux';
import {withNavigation} from 'react-navigation';
import apiFactory from '../../../common/services/apiFactory';
import Preview from '../../../common/components/restaurants/Preview';
import RestaurantClosedModal from '../../../common/components/restaurants/RestaurantClosedModal';
import RouteNames from '../../../routes/names';
import styles from '../styles/resultsStyles';
import FastImage from 'react-native-fast-image';
import AppText from '../../../common/components/AppText';
import {translate} from '../../../common/services/translate';
import BlockSpinner from '../../../common/components/BlockSpinner';
import NoRestaurants from '../../../common/components/restaurants/NoRestaurants';

const IS_LOADING_RESTAURANTS = 'isLoadingRestaurants';

class SearchByCategoryScreen extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            categoryId: props.navigation.getParam('categoryId', {}),
            restaurants: [],
        };
    }

    static navigationOptions = () => {
        return {
            headerCenter: () => {
                return <View style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <FastImage
                        resizeMode={FastImage.resizeMode.contain}
                        source={require('../../../common/assets/images/logo.png')}
                        style={{
                            width: 142,
                            height: 25,
                            resizeMode: 'contain',
                        }}
                    />
                </View>;
            },
        };
    };

    componentDidMount (): void {
        this.getRestaurants();
    }

    getRestaurants = async () => {
        await this.setState({
            [IS_LOADING_RESTAURANTS]: true,
        });
        let {latitude, longitude} = this.props.coordinates;
        const {selectedAddress} = this.props;
        if (selectedAddress && selectedAddress.id) {
            latitude = selectedAddress.lat;
            longitude = selectedAddress.lng;
        }
        const {categoryId} = this.state;
        apiFactory.get(`vendors?lat=${latitude}&lng=${longitude}&per_page=999&food_category_id=${categoryId}`).then(({data}) => {
            this.setState({
                restaurants: data.vendors.data,
                [IS_LOADING_RESTAURANTS]: false,
            });
        }, () => {
            this.setState({
                [IS_LOADING_RESTAURANTS]: false,
            });
        });
    };

    isFavorite = (restaurant) => {
        return this.props.favourites.findIndex(x => x.id === restaurant.id) > -1;
    };

    goToRestaurantDetails = (restaurant) => {
        this.props.navigation.navigate(RouteNames.SearchRestaurantDetailsScreen, {
            restaurant,
            isFavourite: this.isFavorite(restaurant),
            restaurantTitle: restaurant.title,
        });
    };

    onRestaurantPress = async (restaurant) => {
        if (restaurant['is_open']) {
            this.goToRestaurantDetails(restaurant);
        } else {
            await this.setState({selectedRestaurant: restaurant});
            this.modalRef.open();
        }
    };

    render () {
        if (this.state[IS_LOADING_RESTAURANTS]) {
            return <BlockSpinner/>;
        }

        const {restaurants, selectedRestaurant} = this.state;

        if (!restaurants || restaurants.length === 0) {
            return <NoRestaurants/>
        }

        return (
            <SafeAreaView>
                <FlatList
                    data={restaurants}
                    keyExtractor={item => item.id.toString()}
                    extraData={this.state}
                    renderItem={({item}) => {
                        return <View style={{paddingLeft: 10}}>
                            <Preview onPress={() => this.onRestaurantPress(item)}
                                     isFavorite={this.isFavorite(item)}
                                     restaurant={item}
                            />
                        </View>;
                    }}
                />
                {
                    selectedRestaurant && <RestaurantClosedModal
                        restaurant={selectedRestaurant}
                        searchSimilar={async () => {
                            if (selectedRestaurant['food_categories'] && selectedRestaurant['food_categories'].length > 0) {
                                this.props.navigation.navigate(RouteNames.SearchByCategoryScreen, {
                                    categoryId: selectedRestaurant['food_categories'][0].id,
                                });
                            }
                        }}
                        seeMenu={() => this.goToRestaurantDetails(selectedRestaurant)}
                        setRef={ref => this.modalRef = ref}/>
                }
            </SafeAreaView>
        );
    }
}

function mapStateToProps ({app, vendors, shop}) {
    return {
        coordinates: app.coordinates,
        favourites: vendors.favourites,
        selectedAddress: shop.selectedAddress,
    };
}

export default connect(
    mapStateToProps,
    {},
)(withNavigation(SearchByCategoryScreen));
