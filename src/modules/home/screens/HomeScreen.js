import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ImageBackground,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { getFavourites, getFeaturedBlocks, getVendors, getFoodCategories } from '../../../store/actions/vendors';
import AppText from '../../../common/components/AppText';
import Theme from '../../../theme';
import { getLanguage, translate } from '../../../common/services/translate';
import Preview from '../../../common/components/restaurants/Preview';
import Banner from '../../../common/components/banner/Banner';
import FastImage from 'react-native-fast-image';
import RBSheet from 'react-native-raw-bottom-sheet';
import RouteNames from '../../../routes/names';
import RestaurantClosedModal from '../../../common/components/restaurants/RestaurantClosedModal';

import styles from './styles/home';
import RestaurantFeaturedHeaderTitle from '../../../common/components/restaurants/RestaurantFeaturedHeaderTitle';
import FavouriteRestaurant from '../../../common/components/restaurants/FavouriteRestaurant';
import SelectAddressModal from '../components/SelectAddressModal';
import { setStoreAddress } from '../../../store/actions/shop';
import { getAddresses, getBanners } from '../../../store/actions/app';
import BlockSpinner from '../../../common/components/BlockSpinner';
import NoRestaurants from '../../../common/components/restaurants/NoRestaurants';

const { width, height } = Dimensions.get('window');

const allBlockData = {
    title_sq: 'Te Gjithë',
    title_en: 'All Restaurants',
    description_sq: 'Zbulo të gjitha restorantet',
    description_en: 'Discover all restaurants',
    is_active: true,
};

const expectedBlocks = [
    { key: 'suggested', icon: 'top' },
    { key: 'new', icon: 'new' },
    { key: 'exclusive', icon: 'collision' },
    { key: 'free_delivery', icon: null },
    { key: 'all', icon: null },
];

class HomeScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            lang: 'sq',
            loadingVendors: false,
            refreshingVendors: false,
            refreshingBanners: false,
            loadingNextVendors: false,
            loadingFeaturedBlocks: false,
            refreshingFeaturedBlocks: false,
            featuredBlocks: {},
            vendors: [],
            selectedRestaurant: null,
            orderBy: null,
            orderDirection: null,
            page: 1,
            appliedFilters: {
                0: [false, false, false, false, false, false],
                1: [false, false, false, false, false],
            },
            orderByFilters: [
                { key: 'ordering_attribute=location', selected: false, title: 'Vendndodhjes' },
                { key: 'ordering_attribute=name', selected: false, title: 'Rendit Alfabetik' },
                { key: 'ordering_attribute=popularity', selected: false, title: 'Popullaritetit' },
            ],
            filterByFilters: [
                { key: 'free_delivery=1', selected: false, title: 'Transporti Falas' },
                { key: 'promotions=1', selected: false, title: 'Oferta' },
            ],
            foodCategories: [],
            selectedMainFilter: 0,
            hasAppliedFilters: false,
        };
    }

    static navigationOptions = ({ navigation }) => {
        return {
            headerLeft: () => this.headerLeft(navigation),
            headerLeftStyle: {
                flex: 4,
            },
            headerCenterStyle: {
                flex: 0,
            },
            headerRight: () => this.headerRight(navigation),
            headerRightStyle: {
                flex: 1,
            },
        };
    };

    static headerLeft = (navigation) => {
        const selectedAddress = navigation.getParam('selectedAddress', {});
        const locationAddress = navigation.getParam('locationAddress', {});
        const onAddressPress = navigation.getParam('onAddressPress', () => {});
        return (
          <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center' }} onPress={onAddressPress}>
              {selectedAddress && selectedAddress.id ? (
                <AppText style={{ fontSize: 16 }}>{selectedAddress.street}</AppText>
              ) : (
                <AppText style={{ fontSize: 16 }}>
                    {locationAddress && locationAddress.street
                      ? locationAddress.street
                      : translate('current_location')}
                </AppText>
              )}
              <FastImage
                source={require('../../../common/assets/images/location/navigate.png')}
                style={{
                    marginLeft: 10,
                    marginTop: 1,
                    width: 16,
                    height: 16,
                    resizeMode: 'contain',
                }}
              />
          </TouchableOpacity>
        );
    };

    static headerRight = (navigation) => {
        const badge = navigation.getParam('cartBadgeCount', 0);
        const badgeMethod = navigation.getParam('badgeMethod', () => {
            console.log('NO METHOD DEFINED FOR SETTING BADGE ON CART SCREEN (HOME SCREEN)!!!');
        });
        return (
          <TouchableOpacity
            onPress={() => {
                if (badge > 0) {
                    navigation.push(RouteNames.CartScreen, {
                        setBadge: badgeMethod,
                    });
                }
            }}
          >
              <View style={[{ justifyContent: 'center', alignItems: 'center' }]}>
                  <ImageBackground
                    source={require('../../../common/assets/images/cart.png')}
                    imageStyle={{}}
                    style={{
                        width: 18,
                        height: 23,
                    }}
                  >
                      {badge > 0 && (
                        <View
                          style={{
                              marginRight: -3,
                              marginTop: -3,
                              alignSelf: 'flex-end',
                              backgroundColor: '#35aec3',
                              borderRadius: width / 2,
                              minWidth: 12,
                              height: 12,
                              textAlign: 'center',
                              alignItems: 'center',
                              padding: 1,
                          }}
                        >
                            <AppText
                              style={{
                                  color: 'white',
                                  fontSize: 8,
                              }}
                            >
                                {badge}
                            </AppText>
                        </View>
                      )}
                  </ImageBackground>
              </View>
          </TouchableOpacity>
        );
    };

    callFoodCategories = () => {
        getFoodCategories().then((response) => {
            if (!!response && !!response.food_categories && !!response.food_categories.length > 0) {
                let formattedFoodCategories = [];
                formattedFoodCategories = response.food_categories.map(
                  ({ icon, id, search_count, title_en, title_sq }) => ({
                      id,
                      title_en,
                      title_sq,
                      selected: false,
                  })
                );
                this.setState({ foodCategories: formattedFoodCategories });
            }
        });
    };

    componentDidMount(): void {
        this.callFoodCategories();

        this._getFeaturedBlocks();
        this._getFavourites();
        this._getVendors();
        this._getBanners().then();
        this._setLanguage();
        this.focusListener = this.props.navigation.addListener('didFocus', async () => {
            await this.setState({ page: 1 });
            this._setLanguage();
            this._getFavourites();
            this._setCartBadge();
            this._getFeaturedBlocks('none');
            this._getVendors('none', this.state.vendors.length ? this.state.vendors.length : 15);
            this._getBanners('none').then();
            this._setOnAddressPress(null, true);
        });
        this._setOnAddressPress();
    }

    componentDidUpdate(prevProps): void {
        if (prevProps['items'].length !== this.props.items.length) {
            this._setCartBadge();
        }
    }

    componentWillUnmount() {
        this.focusListener.remove();
    }

    _onAddressPress = () => {
        this.addressesModal.open();
    };

    _setOnAddressPress = (address, shouldLoadAddresses) => {
        let selectedAddress = address;
        if (!selectedAddress) {
            selectedAddress = this.props.selectedAddress || {};
        }
        this.props.navigation.setParams({
            onAddressPress: this._onAddressPress,
            selectedAddress,
            locationAddress: this.props.locationAddress,
            badgeMethod: this._setCartBadge,
        });
        if (shouldLoadAddresses) {
            this.props.getAddresses();
        }
    };

    _setCartBadge = () => {
        const { items } = this.props;
        this.props.navigation.setParams({
            cartBadgeCount: items.length,
        });
    };

    _setLanguage = () => {
        this.setState({ lang: getLanguage() });
    };

    _getFavourites = () => {
        let { latitude, longitude } = this.props.coordinates;
        const { selectedAddress } = this.props;
        if (selectedAddress && selectedAddress.id) {
            latitude = selectedAddress.lat;
            longitude = selectedAddress.lng;
        }
        this.props.getFavourites(latitude, longitude);
    };

    _getFeaturedBlocks(propToLoad = 'loadingFeaturedBlocks') {
        this.setState({ [propToLoad]: true });
        let { latitude, longitude } = this.props.coordinates;
        const { selectedAddress } = this.props;
        if (selectedAddress && selectedAddress.id) {
            latitude = selectedAddress.lat;
            longitude = selectedAddress.lng;
        }
        this.props.getFeaturedBlocks(latitude, longitude).then(
          (featuredBlocks) => {
              this.setState({ [propToLoad]: false, featuredBlocks });
          },
          () => {
              this.setState({ [propToLoad]: false });
          }
        );
    }

    _getVendors(
      propToLoad = 'loadingVendors',
      perPage,

      filterKeys,
      foodCategories
    ) {
        this.setState({ [propToLoad]: true });
        let { latitude, longitude } = this.props.coordinates;
        const { selectedAddress } = this.props;
        if (selectedAddress && selectedAddress.id) {
            latitude = selectedAddress.lat;
            longitude = selectedAddress.lng;
        }
        const { page, vendors, orderBy, orderDirection } = this.state;
        console.log('vendors: ', vendors);
        this.props
          .getVendors(page, latitude, longitude, orderBy, orderDirection, perPage, filterKeys, foodCategories)
          .then(
            (vendorsData) => {
                if (['loadingVendors', 'loadingNextVendors'].indexOf(propToLoad) > -1) {
                    const currentVendorIds = vendors.map((x) => x.id);
                    const newVendors = vendorsData.data.filter((x) => currentVendorIds.indexOf(x.id) === -1);
                    this.setState({
                        [propToLoad]: false,
                        page: vendorsData['current_page'],
                        totalPages: vendorsData['last_page'],
                        vendors: [...vendors, ...newVendors],
                    });
                } else {
                    this.setState({
                        [propToLoad]: false,
                        page: vendorsData['current_page'],
                        totalPages: vendorsData['last_page'],
                        vendors: vendorsData.data,
                    });
                }
            },
            () => {
                this.setState({ [propToLoad]: false });
            }
          );
    }

    onApplyFiltersPressed = () => {
        const { foodCategories, filterByFilters, orderByFilters } = this.state;
        const selectedFilterByFilters = filterByFilters.filter((item) => !!item.selected);
        const selectedOrderByFilters = orderByFilters.filter((item) => !!item.selected);
        const selectedFoodCategories = foodCategories.filter((item) => !!item.selected);

        const allFilters = [...selectedOrderByFilters, ...selectedFilterByFilters];
        if (allFilters.length > 0) {
            this.setState({ hasAppliedFilters: true });
        } else {
            this.setState({ hasAppliedFilters: false });
        }
        this.setState({ vendors: [] }, () => {
            this._getVendors(
              'loadingVendors',
              this.state.vendors.length ? this.state.vendors.length : 15,
              allFilters,
              selectedFoodCategories
            );
        });

        this.filtersModal.close();
    };

    _getBanners = async () => {
        let { latitude, longitude } = this.props.coordinates;
        const { selectedAddress } = this.props;
        if (selectedAddress && selectedAddress.id) {
            latitude = selectedAddress.lat;
            longitude = selectedAddress.lng;
        }
        this.setState({ refreshingBanners: true });
        await this.props.getBanners(latitude, longitude);
        this.setState({ refreshingBanners: false });
    };

    isFavorite = (restaurant) => {
        return this.props.favourites.findIndex((x) => x.id === restaurant.id) > -1;
    };

    renderRestaurant = ({ item, isHorizontal, isVertical }) => {
        return (
          <View style={{ paddingLeft: isVertical ? 10 : 0 }}>
              <Preview
                onPress={() => this.onRestaurantPress(item)}
                isFavorite={this.isFavorite(item)}
                restaurant={item}
                horizontal={isHorizontal}
              />
          </View>
        );
    };

    _keyExtractor = (item) => {
        return item.id.toString();
    };

    _refresh = async () => {
        this._getFeaturedBlocks('refreshingFeaturedBlocks');
        this._getFavourites();
        this.props.getAddresses();
        await this.setState({ page: 1 });
        this._getVendors('refreshingVendors');
        this._getBanners();
    };

    sortByAttribute = async (attribute, direction) => {
        await this.setState({ orderBy: attribute, orderDirection: direction });
        this._getVendors('refreshingVendors');
    };

    FiltersMenuHeader = () => {
        const { selectedMainFilter } = this.state;
        const selectedStyle = {
            backgroundColor: '#61C8D5',
        };
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <TouchableOpacity
                onPress={() => this.setState({ selectedMainFilter: 0 })}
                activeOpacity={0.7}
                style={[styles.filerTopButton, selectedMainFilter === 0 && selectedStyle]}
              >
                  <AppText style={[styles.filterTopButtonText, selectedMainFilter === 0 && { color: '#fff' }]}>
                      {translate('search.filters')}
                  </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.setState({ selectedMainFilter: 1 })}
                activeOpacity={0.7}
                style={[styles.filerTopButton, selectedMainFilter === 1 && selectedStyle]}
              >
                  <AppText style={[styles.filterTopButtonText, selectedMainFilter === 1 && { color: '#fff' }]}>
                      {translate('search.theCuisines')}
                  </AppText>
              </TouchableOpacity>
          </View>
        );
    };

    Filters = () => {
        const { filterByFilters, orderByFilters } = this.state;

        return (
          <View
            style={{
                flex: 1,
                flexDirection: 'row',
                marginTop: 20,
                justifyContent: 'space-between',
                paddingHorizontal: 40,
            }}
          >
              <View style={{ textAlign: 'left', height: '100%', flex: 1 }}>
                  <AppText style={{ fontSize: 17, fontWeight: '700', color: '#595965', marginVertical: 10 }}>
                      {translate('search.orderBy')}
                  </AppText>
                  {orderByFilters.map((item, index) => (
                    <this.FilterItem
                      dataKey={'orderByFilters'}
                      data={orderByFilters}
                      title={item.title}
                      item={item}
                      index={index}
                    />
                  ))}
              </View>
              <View
                style={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    height: '100%',
                    flex: 1,
                }}
              >
                  <AppText style={{ fontSize: 17, fontWeight: '700', color: '#595965', marginVertical: 10 }}>
                      {translate('search.filterBy')}
                  </AppText>
                  {filterByFilters.map((item, index) => (
                    <this.FilterItem
                      dataKey={'filterByFilters'}
                      data={filterByFilters}
                      title={item.title}
                      item={item}
                      index={index}
                    />
                  ))}
              </View>
          </View>
        );
    };

    Cuisines = () => {
        return (
          <>
              <AppText
                style={{
                    fontSize: 17,
                    fontWeight: '700',
                    color: '#595965',
                    textAlign: 'left',
                    marginTop: 20,
                    marginBottom: 10,
                }}
              >
                  {translate('search.chooseFavCuisines')}
              </AppText>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{
                    flexDirection: 'row',
                    paddingBottom: 20,
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    marginTop: 10,
                    alignItems: 'center',
                }}
              >
                  {this.state.foodCategories.map((item, index) => {
                      return (
                        <this.FilterItem
                          item={item}
                          title={item.title_sq}
                          index={index}
                          data={this.state.foodCategories}
                        />
                      );
                  })}
              </ScrollView>
          </>
        );
    };

    FilterItem = (props) => {
        const selected = props.data[props.index].selected;
        return (
          <TouchableOpacity
            style={[styles.filterItem, { minWidth: width / 2 - 50, marginVertical: 16 }]}
            onPress={() => {
                let newData = props.data;
                if (props.dataKey == 'orderByFilters') {
                    for (let i = 0; i < newData.length; i++) {
                        if (newData[i] === newData[props.index]) {
                            continue;
                        }
                        newData[i].selected = false;
                    }
                    newData[props.index].selected = !newData[props.index].selected;
                    this.setState({ [props.dataKey]: newData });
                } else {
                    newData[props.index].selected = !newData[props.index].selected;
                    this.setState({ [props.dataKey]: newData });
                }
            }}
            activeOpacity={0.7}
          >
              <View
                style={[
                    styles.radioButton,
                    selected && {
                        borderColor: '#61C8D5',
                    },
                ]}
              >
                  {selected && <View style={styles.radioButtonSelected} />}
              </View>

              <AppText style={{ flex: 1, fontSize: 15, color: '#595965', fontWeight: '400' }}>{props.title}</AppText>
          </TouchableOpacity>
        );
    };

    ApplyFiltersButton = () => (
      <TouchableOpacity onPress={this.onApplyFiltersPressed} activeOpacity={0.7} style={styles.applyFiltersButton}>
          <AppText style={styles.applyFilterButtonText}>{translate('search.applyFilters')}</AppText>
      </TouchableOpacity>
    );

    renderBottomFiltersModal = () => {
        const { safeAreaDims } = this.props;
        return (
          <RBSheet
            ref={(ref) => (this.filtersModal = ref)}
            closeOnDragDown={true}
            duration={300}
            closeOnPressBack={true}
            height={450 + safeAreaDims.bottom}
            customStyles={{
                container: {
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    alignItems: 'center',
                },
            }}
          >
              <View
                style={{
                    flex: 1,
                    justifyContent: 'space-between',
                    paddingVertical: 26,
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    width: '100%',
                }}
              >
                  <this.FiltersMenuHeader />
                  {this.state.selectedMainFilter === 0 ? <this.Filters /> : <this.Cuisines />}
                  <this.ApplyFiltersButton />
              </View>
          </RBSheet>
        );
    };

    closeAddressModal = () => {
        this.addressesModal.close();
    };

    onAddressSelected = async (address) => {
        this.closeAddressModal();
        this._setOnAddressPress(address);
        this.flatListRef.scrollToOffset({ animated: true, offset: 0 });
        await this.props.setStoreAddress(address);
        this._refresh();
    };

    renderAddressesModal = () => {
        return (
          <SelectAddressModal
            setRef={(ref) => (this.addressesModal = ref)}
            addresses={this.props.addresses}
            selectedAddress={this.props.selectedAddress}
            onAddressSelected={this.onAddressSelected}
            onLocationPress={() => {
                this.onAddressSelected({}).then();
            }}
            onCreateAddressPress={() => {
                this.closeAddressModal();
                if (this.props.isLoggedIn) {
                    this.props.navigation.navigate(RouteNames.HomeAddressDetailsScreen);
                } else {
                    this.props.navigation.navigate(RouteNames.ProfileStack);
                }
            }}
          />
        );
    };

    goToRestaurantDetails = (restaurant) => {
        this.props.navigation.navigate(RouteNames.RestaurantDetailsScreen, {
            restaurant,
            isFavourite: this.isFavorite(restaurant),
            restaurantTitle: restaurant.title,
            setBadge: this._setCartBadge,
        });
    };

    onRestaurantPress = async (restaurant) => {
        if (restaurant['is_open']) {
            this.goToRestaurantDetails(restaurant);
        } else {
            await this.setState({ selectedRestaurant: restaurant });
            this.modalRef.open();
        }
    };

    loadNextPage = async () => {
        const { loadingNextVendors, page, totalPages } = this.state;
        if (!loadingNextVendors && page < totalPages) {
            await this.setState({
                page: page + 1,
                loadingNextVendors: true,
            });
            this._getVendors('loadingNextVendors');
        }
    };

    renderNextLoader = () => {
        if (this.state.loadingNextVendors) {
            return <ActivityIndicator size={Theme.sizes.xLarge} color={Theme.colors.primary} />;
        }
        return null;
    };

    renderFavourites = () => {
        const { favourites } = this.props;
        if (!favourites || favourites.length === 0) {
            return null;
        }
        const { lang } = this.state;
        return (
          <View>
              <AppText style={[styles.featuredTitle, { marginHorizontal: 10 }]}>
                  {translate('dashboard.your_favourites')}
              </AppText>
              <ScrollView
                horizontal={true}
                style={{ marginLeft: 0 }}
                indicatorStyle={'white'}
                showsHorizontalScrollIndicator={false}
              >
                  {favourites.map((item) => {
                      return (
                        <FavouriteRestaurant
                          key={item.id}
                          lang={lang}
                          restaurant={item}
                          onPress={() => this.onRestaurantPress(item)}
                        />
                      );
                  })}
              </ScrollView>
          </View>
        );
    };

    renderHeader = () => {
        const { featuredBlocks, lang } = this.state;
        return (
          <View>
              <View style={{ margin: 10 }}>
                  <Banner goToRestaurantDetails={(restaurant) => this.goToRestaurantDetails(restaurant)} />
                  {expectedBlocks.map(({ key, icon }) => {
                      if (
                        featuredBlocks[key] &&
                        featuredBlocks[key].block &&
                        featuredBlocks[key].block['is_active']
                      ) {
                          const restaurants = featuredBlocks[key].vendors;
                          if (!restaurants || restaurants.length === 0) {
                              return null;
                          }
                          return this.renderVendorList(restaurants, featuredBlocks[key].block, key, icon);
                      }
                  })}
              </View>
              {this.renderFavourites()}
              <View style={{ margin: 10 }}>
                  <RestaurantFeaturedHeaderTitle
                    title={allBlockData[`title_${lang}`]}
                    description={allBlockData[`description_${lang}`]}
                    onActionPress={() => this.filtersModal.open()}
                  />
              </View>
          </View>
        );
    };

    renderAllVendors = (restaurants) => {
        const { refreshingVendors, refreshingFeaturedBlocks, refreshingBanners, hasAppliedFilters } = this.state;
        return (
          <FlatList
            ref={(ref) => (this.flatListRef = ref)}
            keyExtractor={this._keyExtractor}
            refreshControl={
                <RefreshControl
                  refreshing={refreshingVendors || refreshingFeaturedBlocks || refreshingBanners}
                  onRefresh={() => this._refresh()}
                />
            }
            onEndReached={this.loadNextPage}
            ListHeaderComponent={restaurants.length > 0 && this.renderHeader}
            ListHeaderComponentStyle={{}}
            ListFooterComponent={this.renderNextLoader()}
            ListEmptyComponent={
                <View
                  style={{
                      flex: 1,
                      justifyContent: 'center',
                      height:
                        height - Theme.specifications.statusBarHeight - Theme.specifications.headerHeight - 80,
                  }}
                >
                    <NoRestaurants
                      onRemoveFiltersPressed={
                          hasAppliedFilters
                            ? () => {
                                this._getVendors();
                                this.setState({ hasAppliedFilters: false });
                            }
                            : null
                      }
                    />
                </View>
            }
            onEndReachedThreshold={0.3}
            data={restaurants}
            renderItem={({ item }) => this.renderRestaurant({ item, isVertical: true })}
          />
        );
    };

    renderVendorList = (restaurants, block, key, icon) => {
        const { lang } = this.state;
        return (
          <View key={key}>
              <RestaurantFeaturedHeaderTitle
                title={block[`title_${lang}`]}
                description={block[`description_${lang}`]}
                emoji={icon}
              />
              <FlatList
                showsHorizontalScrollIndicator={false}
                horizontal={true}
                keyExtractor={this._keyExtractor}
                indicatorStyle={'white'}
                data={restaurants}
                renderItem={({ item }) =>
                  this.renderRestaurant({
                      item,
                      isHorizontal: restaurants.length > 1,
                  })
                }
              />
          </View>
        );
    };

    render() {
        const { loadingVendors, loadingFeaturedBlocks } = this.state;

        if (loadingVendors || loadingFeaturedBlocks) {
            return <BlockSpinner />;
        }

        const { vendors, selectedRestaurant } = this.state;

        return (
          <SafeAreaView>
              {this.renderAllVendors(vendors, {})}
              {this.renderBottomFiltersModal()}
              {this.renderAddressesModal()}
              {selectedRestaurant && (
                <RestaurantClosedModal
                  restaurant={selectedRestaurant}
                  searchSimilar={() => {
                      if (
                        selectedRestaurant['food_categories'] &&
                        selectedRestaurant['food_categories'].length > 0
                      ) {
                          this.props.navigation.navigate(RouteNames.SearchByCategoryScreen, {
                              categoryId: selectedRestaurant['food_categories'][0].id,
                          });
                      }
                  }}
                  seeMenu={() => this.goToRestaurantDetails(selectedRestaurant)}
                  setRef={(ref) => (this.modalRef = ref)}
                />
              )}
          </SafeAreaView>
        );
    }
}

const mapStateToProps = ({ app, vendors, shop }) => ({
    coordinates: app.coordinates,
    favourites: vendors.favourites,
    items: shop.items,
    addresses: app.addresses,
    locationAddress: app.address,
    selectedAddress: shop.address,
    isLoggedIn: app.isLoggedIn,
    safeAreaDims: app.safeAreaDims,
});

export default connect(mapStateToProps, {
    getVendors,
    getFeaturedBlocks,
    getFavourites,
    setStoreAddress,
    getAddresses,
    getBanners,
})(withNavigation(HomeScreen));
