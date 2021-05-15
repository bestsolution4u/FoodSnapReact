import React, { useRef, useState, useEffect } from 'react';
import {
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
  NativeModules,
  Dimensions,
  ImageBackground,
} from 'react-native';
import Theme from '../../../theme';
import { isIphoneX } from '../../services/utility';
import AppText from '../AppText';
import FontelloIcon from '../FontelloIcon';
import FastImage from 'react-native-fast-image';
import Swipeout from 'react-native-swipeout';

import ScrollableHorizontalMenu from '../ScrollableHorizontalMenu';
import AppImage from '../../components/AppImage';
import RestaurantSearchModal from '../RestaurantSearchModal';
import { getLanguage, translate } from '../../services/translate';
import { formatPrice } from '../../services/utility';
import productsMenuStyles from '../../../modules/home/screens/styles/details';

const headerOffset = Theme.specifications.statusBarHeight + Theme.specifications.headerHeight;
const HEADER_MAX_HEIGHT = 200 + headerOffset;
const HEADER_MIN_HEIGHT = Theme.specifications.headerHeight + (isIphoneX() ? 44 : Theme.specifications.statusBarHeight);

const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const StickyHeader = (props) => {
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const scrollView = useRef(null);
  const [restaurantMenuItems, setRestaurantMenuItems] = useState([]);
  const [restaurantCategories, setRestaurantCategories] = useState([]);
  const [scrolledUp, setScrolledUp] = useState(false);
  const [stsBarHeight, setStsBarHeight] = useState(0.000001);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [productsListDimensions, setProductsListDimensions] = useState([]);
  const [horizontalScrollMenuIndex, setHorizontalScrollMenuIndex] = useState([]);

  const headerScrollHeight = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });
  const coverBackgroundColor = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT],
    outputRange: ['rgba(0, 0, 0, 0.5))', 'rgba(0,0,0,0)'],
  });
  const headerContentColor = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT],
    outputRange: ['rgb(255,255,255)', 'rgb(0,0,0)'],
  });
  const subTranslate = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, 0],
    extrapolate: 'clamp',
  });
  const subHeaderOpacity = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE - 10, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    let statusBarHeight;

    if (Platform.OS === 'ios') {
      NativeModules.StatusBarManager.getHeight(({ height }) => {
        setStsBarHeight(height);
      });

      statusBarHeight = NativeModules.StatusBarManager.HEIGHT;
      setStsBarHeight(statusBarHeight);
    }
  }, []);

  useEffect(() => {
    if (!props.restaurant.categories) {
      return;
    }
    let allItems = [];
    let allCategories = [];
    for (let i = 0; i < props.restaurant.categories.length; i++) {
      const category = props.restaurant.categories[i];
      allCategories = [
        ...allCategories,
        {
          id: category.id,
          title: category.title,
        },
      ];
      let formattedItems = category.products.map((product) => {
        return {
          ...product,
          categoryName: category.title,
        };
      });

      allItems = [...allItems, ...formattedItems];
    }
    setRestaurantMenuItems(allItems);
    setRestaurantCategories(allCategories);
  }, [props.restaurant.categories]);

  const renderCustomStatusBar = () => {
    return (
      <Animated.View
        style={[
          { height: HEADER_MIN_HEIGHT, backgroundColor: '#00000000' },
          stsBarHeight && { marginTop: -stsBarHeight * 2 },
        ]}
      >
        <StatusBar
          animated={true}
          barStyle={scrolledUp ? 'dark-content' : 'light-content'}
          translucent={true}
          backgroundColor='#00000000'
        />
      </Animated.View>
    );
  };

  const renderCategoriesMenu = () => {
    return (
      <Animated.View style={[styles.categoriesMenuContainer, { top: HEADER_MIN_HEIGHT }]}>
        <ScrollableHorizontalMenu
          selectedItem={horizontalScrollMenuIndex}
          onItemSelected={(index) => {
            if (!scrollView.current) {
              return;
            }
            const offset = productsListDimensions[index];
            let { recentOrders } = props;
            let delta = HEADER_MAX_HEIGHT - 35;
            if (recentOrders && recentOrders.length > 0) delta += 180;
            let scrollOffset;
            if (index === 0) {
              scrollOffset = delta;
            } else {
              scrollOffset = offset.y + delta;
            }

            scrollView.current.scrollTo({ y: scrollOffset });
          }}
          items={restaurantCategories}
        />
      </Animated.View>
    );
  };

  const renderQuantityTextPerProduct = (product) => {
    return product.quantity > 0 ? `${product.quantity}x ` : '';
  };

  const renderSearchBar = () => (
    <TouchableOpacity style={[styles.searchContainer]} onPress={() => setSearchModalVisible(true)}>
      <FontelloIcon icon='search' size={Theme.icons.small} color='#000' />
    </TouchableOpacity>
  );

  const renderRightHeader = () => {
    const { isLoading, isLoggedIn, onToggleFavourite, onShare, onRestaurantProfilePressed, favorite } = props;
    if (isLoading) {
      return <ActivityIndicator size={Theme.icons.small} color={Theme.colors.white} />;
    }
    let source = require('../../../common/assets/images/restaurant/nofavorite.png');
    if (favorite) {
      source = require('../../../common/assets/images/restaurant/favorite.png');
    }
    return (
      <View style={styles.headerRightContainer}>
        {isLoggedIn ? (
          <TouchableOpacity onPress={() => onToggleFavourite(favorite)} style={styles.iconContainer}>
            <FastImage
              source={source}
              resizeMode={FastImage.resizeMode.contain}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconContainer} />
        )}

        <TouchableOpacity style={styles.iconContainer} onPress={onShare}>
          <FastImage
            source={require('../../../common/assets/images/restaurant/white_share.png')}
            resizeMode={FastImage.resizeMode.contain}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconContainer} onPress={onRestaurantProfilePressed}>
          <FastImage
            source={require('../../../common/assets/images/restaurant/white_info.png')}
            resizeMode={FastImage.resizeMode.contain}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCollapsibleTopView = () => {
    return (
      <>
        <Animated.View style={[styles.headerContainer, { height: headerScrollHeight }]}>
          <Animated.Image
            style={[
              styles.backgroundImage,
              {
                opacity: imageOpacity,
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                overflow: 'visible',
              },
            ]}
            source={props.image}
          />
          <Animated.View
            style={[
              styles.headerCover,
              { backgroundColor: scrolledUp ? 'white' : coverBackgroundColor },
              { paddingTop: isIphoneX() ? 44 : 22 },
            ]}
          >
            <View style={{ ...styles.headerLeftContainer }}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={{ flexDirection: 'row' }}
                onPress={props.onBackPressed}
              >
                <FontelloIcon icon='left-open' size={Theme.icons.base} color={headerContentColor} />
                <Animated.Text
                  style={[
                    Theme.styles.headerTitle,
                    {
                      color: headerContentColor,
                      marginLeft: Theme.sizes.xTiny,
                    },
                  ]}
                >
                  {props.restaurant.title}
                </Animated.Text>
              </TouchableOpacity>
            </View>
            {scrolledUp ? renderSearchBar() : renderRightHeader()}
          </Animated.View>
        </Animated.View>
      </>
    );
  };

  const renderMenuItem = (product) => {
    const { restaurant } = props;
    return (
      <View style={productsMenuStyles.foodInfoContainer}>
        <Swipeout
          autoClose={true}
          key={product.id.toString()}
          disabled={!product.quantity || !restaurant['is_open']}
          right={[
            {
              text: 'Delete',
              backgroundColor: '#f44336',
              underlayColor: 'rgba(0, 0, 0, 0.6)',
              onPress: () => props.removeItemFromCart(product),
            },
          ]}
        >
          <TouchableOpacity
            style={
              !product.quantity
                ? {
                  ...productsMenuStyles.foodContainer,
                  backgroundColor: product['available'] ? '#fff' : '#eee',
                }
                : productsMenuStyles.foodContainerSelected
            }
            onPress={() => props.onProductPress(restaurant, product)}
          >
            <View style={productsMenuStyles.foodContainerLeft}>
              <AppText
                style={{
                  ...productsMenuStyles.foodTitle,
                  textDecorationLine: product['available'] ? 'none' : 'line-through',
                  textDecorationStyle: 'solid',
                }}
              >
                <AppText
                  style={[
                    productsMenuStyles.foodTitle,
                    {
                      color: '#21adc4',
                      fontSize: 16,
                      fontFamily: 'SanFranciscoDisplay-Bold',
                      paddingLeft: 25,
                    },
                  ]}
                >
                  {renderQuantityTextPerProduct(product)}
                </AppText>
                {product.title}
              </AppText>
              <AppText style={productsMenuStyles.foodDesc}>{product.description}</AppText>
              <View style={productsMenuStyles.bottomContainer}>
                <AppText style={productsMenuStyles.foodPrice}>
                  {formatPrice(product.price)} {restaurant.currency || 'L'}{' '}
                </AppText>
                {product['is_popular'] === 1 && (
                  <FastImage
                    source={require('../../../common/assets/images/restaurant/star.png')}
                    style={productsMenuStyles.starPreferred}
                  />
                )}
                {product['is_popular'] === 1 && (
                  <AppText style={productsMenuStyles.foodPreferred}>E Preferuar</AppText>
                )}
              </View>
            </View>
            <View style={productsMenuStyles.foodContainerRight}>
              <FastImage
                style={productsMenuStyles.foodImage}
                source={{
                  uri: `https://snapfoodal.imgix.net/${product['image_thumbnail_path']}?w=600&h=600`,
                }}
              />
            </View>
          </TouchableOpacity>
        </Swipeout>
      </View>
    );
  };

  const renderMenuCategory = (item, index) => {
    return (
      <View
        onLayout={(event) => {
          const { y } = event.nativeEvent.layout;
          const newPrdouctsListDimensions = [...productsListDimensions];
          newPrdouctsListDimensions[index] = { index, y };
          console.log('newPrdouctsListDimensions: ', newPrdouctsListDimensions);
          setProductsListDimensions(newPrdouctsListDimensions);
        }}
        key={item.id.toString()}
      >
        <View style={productsMenuStyles.foodCategoryContainer}>
          <AppText style={productsMenuStyles.foodCategory}>
            {item.title}
            <AppText style={productsMenuStyles.foodCategoryAv}>{item['availability']}</AppText>
          </AppText>
        </View>
      </View>
    );
  };

  const renderProductsMenu = () => {
    const { restaurant, isLoading } = props;

    if (isLoading || !restaurant.categories || restaurant.categories.length === 0) {
      return (
        <View style={{ flex: 1 }}>
          <ActivityIndicator size={Theme.icons.xLarge} color={Theme.colors.primary} />
          <AppText style={{ textAlign: 'center' }}>
            {translate('restaurant_details.loading_products')}
          </AppText>
        </View>
      );
    }

    if (!restaurant.categories) {
      return null;
    }
    return (
      <View>
        {restaurant.categories.map((category, index) => {
          return (
            <>
              {renderMenuCategory(category, index)}
              {category.products.map((item) => {
                return renderMenuItem(item);
              })}
            </>
          );
        })}
      </View>
    );
  };

  return (
    <>
      <View style={{ flex: 1 }}>
        {renderCustomStatusBar()}
        {searchModalVisible && (
          <RestaurantSearchModal
            onItemPressed={props.onItemPressed}
            items={restaurantMenuItems}
            top={stsBarHeight}
            style={stsBarHeight && { modal: { top: stsBarHeight } }}
            onDismiss={() => setSearchModalVisible(false)}
          />
        )}

        <ScrollView
          ref={scrollView}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }], {
            listener: (event) => {
              const scrollY = event.nativeEvent.contentOffset.y;
              if (scrollY > 40 && !scrolledUp) {
                setScrolledUp(true);
              }
              if (scrollY < 40 && scrolledUp) {
                setScrolledUp(false);
              }
              let { recentOrders } = props;
              let delta = HEADER_MAX_HEIGHT - 40;
              if (recentOrders && recentOrders.length > 0) delta += 180;
              let { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
              let index = 0;
              for (let i = 0; i < productsListDimensions.length; i++) {
                if (scrollY > productsListDimensions[i].y + delta) {
                  index = i;
                }
              }
              if (layoutMeasurement.height + contentOffset.y >= contentSize.height) {
                index = productsListDimensions.length - 1;
              }
              setHorizontalScrollMenuIndex(index);
            },
          })}
          scrollEventThrottle={16}
        >
          <View style={{ paddingTop: HEADER_MAX_HEIGHT + 50 }}>{props.children}</View>
          {renderProductsMenu()}
        </ScrollView>
        <Animated.View
          style={[
            props.customStyles.categorySectionCategories,
            {
              position: 'absolute',
              zIndex: 1111,
            },
            {
              transform: [{ translateY: subTranslate }],
              opacity: subHeaderOpacity,
            },
          ]}
        >
          {!scrolledUp && (
            <View style={{ marginLeft: 10, flex: 7, flexDirection: 'row' }}>
              {props.restaurant['food_categories'] &&
              props.restaurant['food_categories'].slice(0, 4).map((category) => {
                return (
                  <TouchableOpacity
                    key={category.id.toString()}
                    onPress={() => {
                      props.onCategoryPress(category);
                    }}
                  >
                    <AppText style={props.customStyles.categoryTitle}>
                      {category[`title_${props.language}`]}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {!scrolledUp && !!props.restaurant['logo_thumbnail_path'] && (
            <AppImage
              src={props.restaurant.profile}
              style={props.customStyles.profileImage}
              resizeMode={'cover'}
            />
          )}
        </Animated.View>
        {renderCollapsibleTopView()}
        {renderCategoriesMenu()}
      </View>
    </>
  );
};

export default StickyHeader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    marginHorizontal: 16,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
  },
  header: {
    fontSize: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
  },
  headerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    width: '100%',
    overflow: 'hidden',
    zIndex: 999,
    backgroundColor: '#fff',
  },

  image: {
    flex: 1,
  },
  backgroundImage: {
    height: HEADER_MAX_HEIGHT,
    flexDirection: 'row',
    resizeMode: 'cover',
  },
  headerCover: {
    backgroundColor: '#00000050',
    flexDirection: 'row',
    position: 'absolute',
    height: HEADER_MIN_HEIGHT,
    top: 0,
    left: 0,
    right: 0,
  },
  headerLeftContainer: {
    flex: 6,
    marginLeft: Theme.sizes.tiny,
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  headerRightContainer: {
    flex: 2,
    paddingTop: 2,
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  iconContainer: {
    flex: 1,
    width: 35,
  },
  headerIcon: {
    width: 25,
    height: 25,
  },
  searchContainer: {
    paddingTop: 5,
    paddingRight: 20,
  },
  categoriesMenuContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 0,
    paddingTop: 0,
    right: 0,
    borderBottomColor: '#ededed',
    borderBottomWidth: 3,
  },
});

// import React, {Component} from 'react';
// import {Animated, Platform, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
// import Theme from '../../theme';
// import {isIphoneX} from '../services/utility';
// import RouteNames from '../../routes/names';
// import AppText from './AppText';
// import AppImage from './AppImage';

// const headerOffset = Theme.specifications.statusBarHeight + Theme.specifications.headerHeight;
// const HEADER_MAX_HEIGHT = 200 + headerOffset;
// const HEADER_MIN_HEIGHT = Theme.specifications.headerHeight + (isIphoneX() ? 44 : Theme.specifications.statusBarHeight);

// const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT + 50;

// class StickyHeader extends Component {

//     constructor (props) {
//         super(props);

//         this.state = {
//             scrollY: new Animated.Value(
//                 Platform.OS === 'ios' ? -HEADER_MAX_HEIGHT : 0,
//             ),
//             refreshing: false,
//         };
//     }

//     render () {
//         const scrollY = Animated.add(
//             this.state.scrollY,
//             Platform.OS === 'ios' ? HEADER_MAX_HEIGHT : 0,
//         );
//         const headerTranslate = scrollY.interpolate({
//             inputRange: [0, HEADER_SCROLL_DISTANCE],
//             outputRange: [0, -HEADER_SCROLL_DISTANCE],
//             extrapolate: 'clamp',
//         });
//         const subHeaderOpacity = scrollY.interpolate({
//             inputRange: [0, HEADER_SCROLL_DISTANCE - 10, HEADER_SCROLL_DISTANCE],
//             outputRange: [1, 1, 0],
//             extrapolate: 'clamp',
//         });

//         const imageOpacity = scrollY.interpolate({
//             inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
//             outputRange: [1, 1, 0],
//             extrapolate: 'clamp',
//         });
//         const imageTranslate = scrollY.interpolate({
//             inputRange: [0, HEADER_SCROLL_DISTANCE],
//             outputRange: [0, 100],
//             extrapolate: 'clamp',
//         });
//         const subTranslate = scrollY.interpolate({
//             inputRange: [0, HEADER_MAX_HEIGHT],
//             outputRange: [HEADER_MAX_HEIGHT, 0],
//             extrapolate: 'clamp',
//         });

//         const {restaurant, language, customStyles} = this.props;

//         return (
//             <View style={styles.fill}>
//                 <StatusBar barStyle={'light-content'}/>
//                 <Animated.ScrollView
//                     refreshControl={
//                         <RefreshControl
//                             refreshing={this.props.refreshing}
//                             tintColor={this.props.tintColor}
//                             onRefresh={this.props.onRefresh}
//                             progressViewOffset={HEADER_MAX_HEIGHT}
//                         />
//                     }
//                     scrollEventThrottle={1}
//                     onScroll={Animated.event(
//                         [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}],
//                         {useNativeDriver: true},
//                     )}
//                     contentInset={{
//                         top: HEADER_MAX_HEIGHT + 50,
//                     }}
//                     contentOffset={{
//                         y: -HEADER_MAX_HEIGHT - 50,
//                     }}
//                 >
//                     {this.props.children}
//                 </Animated.ScrollView>
//                 <Animated.View
//                     pointerEvents="none"
//                     style={[
//                         styles.header,
//                         {transform: [{translateY: headerTranslate}]},
//                     ]}>
//                     <Animated.Image
//                         style={[
//                             styles.backgroundImage,
//                             {
//                                 opacity: imageOpacity,
//                                 transform: [{translateY: imageTranslate}],
//                             },
//                         ]}
//                         source={this.props.image}
//                     />
//                 </Animated.View>
//                 <Animated.View style={[
//                     customStyles.categorySectionCategories,
//                     {
//                         position: 'absolute',
//                     },
//                     {
//                         transform: [{translateY: subTranslate}],
//                         opacity: subHeaderOpacity,
//                     }
//                 ]}>
//                     <View style={{marginLeft: 10, flex: 7, flexDirection: 'row'}}>
//                         {restaurant['food_categories'] && restaurant['food_categories'].slice(0, 4).map(category => {
//                             return (
//                                 <TouchableOpacity
//                                     key={category.id.toString()}
//                                     onPress={() => {
//                                         this.props.onCategoryPress(category);
//                                     }}>
//                                     <AppText style={customStyles.categoryTitle}>
//                                         {category[`title_${language}`]}
//                                     </AppText>
//                                 </TouchableOpacity>
//                             );
//                         })}
//                     </View>
//                     {
//                         !!restaurant['logo_thumbnail_path'] &&
//                         <AppImage src={restaurant.profile} style={customStyles.profileImage} resizeMode={'cover'}/>
//                     }
//                 </Animated.View>
//                 <Animated.View
//                     style={[
//                         styles.bar,
//                     ]}>
//                     {this.props.header}
//                 </Animated.View>
//             </View>
//         );
//     }
// }

// const styles = StyleSheet.create({
//     fill: {
//         flex: 1,
//     },
//     content: {
//         flex: 1,
//     },
//     header: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         backgroundColor: 'rgb(89, 89, 89)',
//         overflow: 'hidden',
//         height: HEADER_MAX_HEIGHT + 50,
//     },
//     backgroundImage: {
//         // position: 'absolute',
//         // top: 0,
//         // left: 0,
//         // right: 0,
//         // width: null,
//         height: HEADER_MAX_HEIGHT,
//         resizeMode: 'cover',
//     },
//     bar: {
//         width: '100%',
//         backgroundColor: 'rgba(0, 0, 0, 0.6)',
//         height: HEADER_MIN_HEIGHT,
//         alignItems: 'center',
//         justifyContent: 'center',
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         zIndex: 25,
//     },
//     title: {
//         color: 'white',
//         fontSize: 18,
//     },
// });

// export default StickyHeader;
