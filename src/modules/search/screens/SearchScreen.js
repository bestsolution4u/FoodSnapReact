import React from 'react';
import { FlatList, ScrollView, TouchableOpacity, View, Text, TextInput, Dimensions, Image } from 'react-native';
import styles from '../styles/styles';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { translate } from '../../../common/services/translate';
import apiFactory from '../../../common/services/apiFactory';
import CategoryItem from '../components/CategoryItem';
import FoodItem from '../components/FoodItem';
import StartItem from '../components/StartItem';
import Icon from 'react-native-vector-icons/Entypo'
import AntDesign from 'react-native-vector-icons/AntDesign'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import RBSheet from 'react-native-raw-bottom-sheet';
import { throttle } from 'throttle-debounce';
import RouteNames from '../../../routes/names';
import BlockSpinner from '../../../common/components/BlockSpinner';
import { AsyncStorage } from 'react-native';
import FastImage from "react-native-fast-image";

const windowHeight = Dimensions.get('window').height;
const IS_LOADING_CATEGORIES = 'isLoadingCategories';
const IS_LOADING_RESTAURANTS = 'isLoadingRestaurants';

class SearchScreen extends React.Component {

  getRestaurants = throttle(500, (text) => {

    let { latitude, longitude } = this.props.coordinates;
    const { selectedAddress } = this.props;
    if (selectedAddress && selectedAddress.id) {
      latitude = selectedAddress.lat;
      longitude = selectedAddress.lng;
    }
    apiFactory.get(`vendors?lat=${latitude}&lng=${longitude}&name=${text}&per_page=999`).then(({ data }) => {
      this.setState({ restaurants: data.vendors.data });
    });

  });

  getFilteredRestaurants = throttle(500, () => {
    this.setState({ modalVisible: false });
    let { latitude, longitude } = this.props.coordinates;
    const { selectedAddress } = this.props;
    if (selectedAddress && selectedAddress.id) {
      latitude = selectedAddress.lat;
      longitude = selectedAddress.lng;
    }

    let arr = [];

    this.state.filters.map((item) => {
      if (item.check === true) {
        arr.push(item)
      }
    });

    if (arr.length === 0) {
      apiFactory.get(`vendors?lat=${latitude}&lng=${longitude}&name=${this.state.text}`).then(({ data }) => {
        this.setState({ restaurants: data.vendors.data });
      });
    }
    else if (arr.length === 1) {
      apiFactory.get(`vendors?lat=${latitude}&lng=${longitude}&name=${this.state.text}&${arr[0].keyFilter}=1`).then(({ data }) => {
        this.setState({ restaurants: data.vendors.data });
      });
    }
    else {
      apiFactory.get(`vendors?lat=${latitude}&lng=${longitude}&name=${this.state.text}&${arr[0].keyFilter}=1&${arr[1].keyFilter}=1`).then(({ data }) => {
        this.setState({ restaurants: data.vendors.data });
      });
    }

    this.RBSheet.close()
  });

  getItems = throttle(500, (text) => {

    let { latitude, longitude } = this.props.coordinates;
    const { selectedAddress } = this.props;
    if (selectedAddress && selectedAddress.id) {
      latitude = selectedAddress.lat;
      longitude = selectedAddress.lng;
    }

    apiFactory.get(`products?lat=${latitude}&lng=${longitude}&title=${text}`).then(({ data }) => {
      this.setState({ foodItems: data.products.data });
    });

  });

  getItemsRestaurant = throttle(500, (restaurant) => {
    let a = null;
    let { latitude, longitude } = this.props.coordinates;
    const { selectedAddress } = this.props;
    if (selectedAddress && selectedAddress.id) {
      latitude = selectedAddress.lat;
      longitude = selectedAddress.lng;
    }

    apiFactory.get(`vendors?lat=${latitude}&lng=${longitude}&name=${restaurant.vendor.title}`).then(async ({ data }) => {
      let { recents } = this.state;
      let text = restaurant.vendor.title;
      if (text) {
        recents.push(text);
        if (recents.length >= 8) {
          let newrecents = recents.slice(1);
          this.setState({ recents: newrecents })
        }
        await AsyncStorage.setItem("recents", JSON.stringify(recents));
      }
        this.goToRestaurantDetails(data.vendors.data[0])
    });
  });

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      foodItems: [], selected: "",
      modalVisible: true,
      restaurants: [],
      popularSearches: [],
      filters: [
        {
          title: translate('search.recommended'),
          check: false,
          keyFilter: 'recommended'
        },
        {
          title: translate('search.free_delivery'),
          check: false,
          keyFilter: 'free_delivery'
        },
        {
          title: translate('search.fastest'),
          check: false,
          keyFilter: 'fastest'
        },
        {
          title: translate('search.distance'),
          check: false,
          keyFilter: 'distance'
        }
      ],
      recents: [],
      text: '',
      [IS_LOADING_CATEGORIES]: false,
      [IS_LOADING_RESTAURANTS]: false,
      selectedRestaurant: {},
      restaurantSelected: false,
    };
  }

  componentDidMount() {
    this.getCategories();
    this.getPopularSearch();
    this.getRecents();
  }

  getRecents = async () => {
    let recents = await AsyncStorage.getItem("recents");
    let newrecents = JSON.parse(recents);
    var filtered = newrecents.filter(function (el) {
        return el != null;
    });

    this.setState({ recents: filtered })
  };

  getCategories = async () => {
    await this.setState({
      [IS_LOADING_CATEGORIES]: true,
    });
    apiFactory.get('vendors/food-categories').then(({ data }) => {
      this.setState({ [IS_LOADING_CATEGORIES]: false, categories: data['food_categories'] });
    });
  };

  getPopularSearch = async () => {
    await this.setState({
        [IS_LOADING_CATEGORIES]: true,
    });
    apiFactory.get('search/suggestions').then(({ data }) => {

        this.setState({ [IS_LOADING_CATEGORIES]: false, popularSearches: data['suggestions'] });
    });
  };

  search = (text) => {
    this.setState({ text });
    if (text.length > 2) {
      this.getRestaurants(text);
      this.getItems(text)
    } else {
      this.setState({ restaurants: [] });
    }
  };

  isFavorite = (restaurant) => {
    return this.props.favourites.findIndex(x => x.id === restaurant.id) > -1;
  };

  showSimilar = async (restaurant) => {
    let { recents } = this.state;

    let text = restaurant.title;
    if (text) {
      recents.push(text);
      if (recents.length >= 8) {
        let newrecents = recents.slice(1);
        this.setState({ recents: newrecents })
      }
      await AsyncStorage.setItem("recents", JSON.stringify(recents))
    }

    this.props.navigation.navigate(RouteNames.SearchRestaurantDetailsScreen, {
      restaurant,
      isFavourite: this.isFavorite(restaurant),
      restaurantTitle: restaurant.title
    });
  };

  goToRestaurantDetails = (restaurant) => {
    this.props.navigation.navigate(RouteNames.SearchRestaurantDetailsScreen, {
      restaurant,
      isFavourite: this.isFavorite(restaurant),
      restaurantTitle: restaurant.title
    });
  };

 render() {
   if (this.state[IS_LOADING_CATEGORIES]) {
     return <BlockSpinner />;
   }

   const { filters, restaurants, selected, recents, foodItems, popularSearches, selectedRestaurant, restaurantSelected } = this.state;
   const { text } = this.state;

   let filteredRecents = recents.filter((value, index, self) => self.indexOf(value) === index);

   let array_last_eight;
   array_last_eight = filteredRecents.slice(-8);
   filteredRecents = array_last_eight;

   return (
     <View style={styles.container} >
       <RBSheet ref={ref => this.RBSheet = ref}
         closeOnDragDown={true}
         duration={300}
         closeOnPressBack={true}
         height={380}
         customStyles={{
           container: {
             borderTopLeftRadius: 10,
             borderTopRightRadius: 10,
             alignItems: 'center',
           },
         }}
       >
         <View onPress={() => { }} style={{ height: "100%", }}>
           <View style={{ borderTopLeftRadius: 15, borderTopRightRadius: 15, backgroundColor: "#fff" }}>
             <View style={{ flexDirection: "row" }}>
               <TouchableOpacity onPress={() => this.RBSheet.close()} style={{ height: 20, width: 20, left: 15, top: 15, flex: 1, zIndex: 1 }}>
                 <Icon name={"cross"} size={25} color={'#000'} />
               </TouchableOpacity>
               <Text style={{ width: "95%", top: 15, fontSize: 16, textAlign: "center", fontFamily: 'SanFranciscoDisplay-Bold', color: '#25252D' }}>
                 {translate('search.filter')}
               </Text>
             </View>
             <FlatList data={filters}
               style={{ marginTop: 45 }}
               renderItem={({ item, index }) => {
                 return (
                   <TouchableOpacity
                     onPress={() => {
                       let arr = filters;
                       arr[index].check = !arr[index].check;
                       this.setState({ filters: arr });
                     }}
                     style={{ flexDirection: "row", paddingVertical: 10, alignItems: "center", justifyContent: "center" }}
                   >
                     <Text style={{ width: "80%", left: 0, height: "100%", fontSize: 14, fontFamily: 'SanFranciscoDisplay-Medium', color: '#25252D' }}>{item.title}</Text>
                     <FontAwesome name={item.check === true ? "check-circle" : "circle-thin"} size={30} style={{}} color={item.check === true ? "#22ADC4" : "lightgray"} />
                   </TouchableOpacity>
                 );
               }}
             />
               <TouchableOpacity
                 onPress={() => this.getFilteredRestaurants()}
                 style={{ width: "90%", height: "13%", alignItems: "center", justifyContent: "center", borderRadius: 5, bottom: "10%", backgroundColor: "#22ADC4", alignSelf: 'center', marginBottom: 8 }}
               >
                 <Text style={{ color: "#fff", fontSize: 14, fontFamily: 'SanFranciscoDisplay-Bold' }}>
                   {translate('search.applyFilters')}
                 </Text>
               </TouchableOpacity>
           </View>
         </View>
       </RBSheet>
       <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
         <TouchableOpacity
           style={{ width: '10%', alignItems: 'center', justifyContent: 'center', marginTop: 3 }}
           onPress={() => { this.state.text !== '' ? (this.setState({ text: '' })) : (this.props.navigation.navigate("HomeStack")) }}
         >
           <Icon name={'chevron-small-left'} color={'#000000'} size={24} />
         </TouchableOpacity>
         <View style={{ backgroundColor: '#f9f9f9', width: '85%', borderRadius: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
           <TextInput
             value={this.state.text}
             onChangeText={this.search}
             placeholder={translate('search.input')}
             style={{
               backgroundColor: 'transparent',
               paddingHorizontal: 7,
               fontSize: 15,
               flexGrow: 1,
               paddingTop: 8,
               paddingBottom: 8,
              }}
           />
           {this.state.text !== '' ? (
             <TouchableOpacity onPress={() => this.setState({text: ''})}>
               <Icon name={'circle-with-cross'} color={'#878E97'} size={18} style={{ marginRight: 7 }} />
             </TouchableOpacity>
           ) : null}
         </View>
       </View>
       <ScrollView>
         {text.length > 2 && (
           <View style={{ flexDirection: 'row', width: '90%', alignSelf: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
             <View style={{ flexDirection: 'row', width: '45%', justifyContent: 'space-between', marginTop: 14 }}>
               <TouchableOpacity onPress={() => this.setState({ selectedRestaurant: true })}>
                 <Text style={{ color: selectedRestaurant ? "#22ADC4" : "#B5B5B5", fontSize: 16.5, fontFamily: 'SanFranciscoDisplay-Medium', }}>
                   {translate('search.restaurants_tab')}
                 </Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={() => this.setState({ selectedRestaurant: false })}>
                 <Text style={{ color: !selectedRestaurant ? "#22ADC4" : "#B5B5B5", fontSize: 16.5, fontFamily: 'SanFranciscoDisplay-Medium', }}>
                   {translate('search.items_tab')}
                 </Text>
               </TouchableOpacity>
             </View>
             {selectedRestaurant && (
               <TouchableOpacity
                 onPress={() => this.RBSheet.open()}
                 style={{
                   flexDirection: 'row', marginTop: 14, borderRadius: 4, borderWidth: 1, borderColor: '#EBEBEB', width: 69,
                   alignItems: 'center', justifyContent: 'center', height: 24
                 }}
               >
                 <Text style={{ color: '#25252D', fontSize: 12, }}>{translate('search.filter')}</Text>
                 <MaterialIcons name={'filter-list'} color={'#000000'} size={14} style={{ marginLeft: 3 }} />
               </TouchableOpacity>
             )}
           </View>
         )}
         <View>
         </View>
         {text.length < 3 ?
           <View>
             <Text
               style={{ color: "gray", fontSize: 13, marginTop: 11, paddingLeft: "5%" }}
             >
               {translate('search.recents')}
             </Text>
             <FlatList
               data={filteredRecents.reverse()}
               keyExtractor={item => item}
               renderItem={({ item }) => {
                 return (
                   <StartItem
                     title={item}
                     cat="recents"
                     onPress={() => this.search(item)}
                   />
                 );
               }}
             />
             <Text style={{ color: "gray", fontSize: 13, paddingLeft: "5%", marginTop: 20 }}>{translate('search.popular')}</Text>
             <FlatList
               data={popularSearches}
               renderItem={({ item }) => {
                 return (
                   <StartItem
                     title={item}
                     cat="popular"
                     onPress={() => this.search(item)}
                  />
                 );
               }}
             />
           </View>
           :
           <View>
             {selectedRestaurant ?
               <View>
                 {restaurants.length > 0 ? (
                   <FlatList
                     data={restaurants}
                     keyExtractor={item => item.id.toString()}
                     renderItem={({ item }) => {
                       return (
                         <CategoryItem
                           item={item}
                           onPress={() => this.showSimilar(item)}
                         />
                       );
                     }}
                   />
                  ) : (
                  <View style={{ height: windowHeight / 1.5, justifyContent: 'center', alignItems: 'center' }}>
                    <View>
                      <FastImage
                        source={require('../../../common/assets/images/search.png')}
                        style={{
                          marginBottom: 30,
                          width: 40,
                          height: 40,
                          resizeMode: 'contain'
                        }}
                      />
                    </View>
                    <Text style={{ fontSize: 16, color: '#7E7E7E', fontFamily: 'SanFranciscoDisplay-Regular' }}>{translate('search.not_found_part_one')}</Text>
                    <Text style={{ color: '#25252D', fontSize: 16, fontFamily: 'SanFranciscoDisplay-Medium', marginTop: 3 }}>{"'" + text + "'"}</Text>
                    <Text style={{ fontSize: 16, color: '#7E7E7E', fontFamily: 'SanFranciscoDisplay-Regular', marginTop: 12 }}>{translate('search.not_found_part_two')}</Text>
                  </View>
                 )}
           </View>
           :
           <View>
             {foodItems.length > 0 ? (
               <FlatList
                 data={foodItems}
                 keyExtractor={item => item.id.toString()}
                 renderItem={({ item }) => {
                   return (
                     <FoodItem
                       item={item}
                       onPress={() => this.getItemsRestaurant(item)}
                     />
                   );
                }}
              />
             ) : (
               <View style={{ height: windowHeight / 1.5, justifyContent: 'center', alignItems: 'center' }}>
                 <View>
                   <FastImage
                     source={require('../../../common/assets/images/search.png')}
                     style={{
                       marginBottom: 30,
                       width: 40,
                       height: 40,
                       resizeMode: 'contain'
                     }}
                   />
                 </View>
                 <Text style={{ fontSize: 16, color: '#7E7E7E', fontFamily: 'SanFranciscoDisplay-Regular' }}>{translate('search.not_found_part_one')}</Text>
                 <Text style={{ color: '#25252D', fontSize: 16, fontFamily: 'SanFranciscoDisplay-Medium', marginTop: 3 }}>{"'" + text + "'"}</Text>
                 <Text style={{ fontSize: 16, color: '#7E7E7E', fontFamily: 'SanFranciscoDisplay-Regular', marginTop: 12 }}>{translate('search.not_found_part_two')}</Text>
               </View>
              )
             }
           </View>
           }
           </View>
           }
          </ScrollView>
      </View>
   );
}
}

function mapStateToProps({ app, vendors, shop }) {
  return {
    coordinates: app.coordinates,
    favourites: vendors.favourites,
    selectedAddress: shop.selectedAddress,
  };
}

export default connect(
  mapStateToProps,
  {},
)(withNavigation(SearchScreen));
