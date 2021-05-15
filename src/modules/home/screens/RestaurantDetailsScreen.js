import React from 'react';
import { ActivityIndicator, FlatList, Share, TouchableOpacity, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import AppText from '../../../common/components/AppText';
import Theme from '../../../theme';
import FastImage from 'react-native-fast-image';
import { deepDiffer } from 'react-native/Libraries/ReactPrivate/ReactNativePrivateInterface';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import { toggleFavourite } from '../../../store/actions/vendors';
import RouteNames from '../../../routes/names';
import RestaurantDetailsHeader from '../../../common/components/restaurants/RestaurantDetailsHeader';
import { getLanguage, translate } from '../../../common/services/translate';

import styles from './styles/details';
import RestaurantProductModal from '../../../common/components/restaurants/RestaurantProductModal';
import { reOrder, setCutlery, updateCart } from '../../../store/actions/shop';
import RestaurantBottomCart from '../../../common/components/restaurants/RestaurantBottomCart';
import { extractErrorMessage, isIphoneX } from '../../../common/services/utility';
import RestaurantPreviousOrder from '../../../common/components/restaurants/RestaurantPreviousOrder';
import StickyHeader from '../../../common/components/StickyHeader';

const IS_LOADING = 'isLoading';
const IS_REFRESHING = 'isRefreshing';

class RestaurantDetailsScreen extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			[IS_LOADING]: false,
			[IS_REFRESHING]: false,
			favorite: props.navigation.getParam('isFavourite', false),
			language: getLanguage(),
			selectedProduct: {},
			selectedQuantity: 0,
			reorderingId: null,
			recentOrders: [],
			restaurant: this.prepareRestaurantData(props.navigation.getParam('restaurant', {})),
			categoryIndex: 0,
		};
	}

	shouldComponentUpdate(nextProps, nextState, nextContext) {
		const reorderingDiff = deepDiffer(this.state.reorderingId, nextState.reorderingId);
		if (reorderingDiff) {
			return true;
		}

		const favoriteDiff = this.state.favorite !== nextState.favorite;
		if (favoriteDiff) {
			return true;
		}

		const selectedProductDiff = deepDiffer(this.state.selectedProduct, nextState.selectedProduct);
		if (selectedProductDiff) {
			return true;
		}

		const itemsDiff = deepDiffer(this.props.items, nextProps.items);
		if (itemsDiff) {
			return true;
		}

		const ordersDiff = deepDiffer(this.state.recentOrders, nextState.recentOrders);
		if (ordersDiff) {
			return true;
		}

		const selectedCategoryDiff = deepDiffer(this.state.categoryIndex, nextState.categoryIndex);
		if (selectedCategoryDiff) {
			return true;
		}

		return deepDiffer(this.state.restaurant, nextState.restaurant);
	}

	componentDidMount(): void {
		this.getRestaurantDetails().then();
		this.getRecentOrders();
		this.focusListener = this.props.navigation.addListener('didFocus', () => {
			this._setLanguage();
			const restaurant = this.prepareRestaurantData(this.state.restaurant);
			this.setState(
				{
					restaurant,
				},
				() => {
					this.forceUpdate();
				}
			);
		});
	}

	componentWillUnmount() {
		this.focusListener.remove();
	}

	_setLanguage = () => {
		this.setState({ language: getLanguage() });
	};

	prepareRestaurantData = (restaurant) => {
		const { items } = this.props;

		if (restaurant.categories) {
			restaurant.categories = restaurant.categories
				.filter((c) => c.products && c.products.length > 0)
				.map((category) => {
					if (category.products) {
						category.products.map((product) => {
							const isProductInCart = items.find((x) => x.product.id === product.id);
							if (isProductInCart) {
								product.quantity = isProductInCart.quantity;
								product.options = isProductInCart.options;
								product.item_instructions = isProductInCart.item_instructions;
							} else {
								product.quantity = 0;
							}
							return product;
						});
					}
					category.data = category.products; //Needed as section list prop
					return category;
				});
		}

		this.props.navigation.setParams({
			restaurantTitle: restaurant.title,
		});

		return {
			...restaurant,
			vendor_id: restaurant.id,
			rating: restaurant['rating_interval'] / 2,
			profile: `https://snapfoodal.imgix.net/${restaurant['logo_thumbnail_path']}?w=600&h=600`,
			cover: `https://snapfoodal.imgix.net/${restaurant['profile_path']}?w=600&h=600`,
			min_delivery_price: restaurant['delivery_minimum_order_price'],
			min_delivery_time: restaurant['minimum_delivery_time'],
			max_delivery_time: restaurant['maximum_delivery_time'],
		};
	};

	getRestaurantDetails = async (prop = IS_LOADING) => {
		const { id } = this.state['restaurant'];
		await this.setState({ [prop]: true });
		let { latitude, longitude } = this.props.coordinates;
		const { selectedAddress } = this.props;
		if (selectedAddress && selectedAddress.id) {
			latitude = selectedAddress.lat;
			longitude = selectedAddress.lng;
		}
		apiFactory.get(`vendors/${id}?lat=${latitude}&lng=${longitude}`).then(
			({ data }) => {
				const restaurant = this.prepareRestaurantData(data.vendor);
				this.setState({
					restaurant: restaurant,
					[prop]: false,
				});
				//this.setRightHeader();
			},
			(error) => {
				alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(error));
				this.setState({ [prop]: false });
			}
		);
	};

	getRecentOrders = () => {
		const { restaurant } = this.state;
		apiFactory.get(`orders?vendor_id=${restaurant.id}`).then(({ data }) => {
			this.setState({
				recentOrders: data.orders.data,
			});
		});
	};

	goBack = () => {
		this.props.navigation.goBack();
	};

	toggleFavourite = (status) => {
		this.setState({ favorite: !status });
		this.props.toggleFavourite(this.state['restaurant'].id, !status);
	};

	share = async () => {
		const { restaurant } = this.state;
		const shareOptions = {
			title: 'Snapfood Restaurant',
			message:
				Platform.OS === 'android'
					? `https://snapfood.al/restaurant/${restaurant['hash_id']}/${restaurant['slug']}`
					: '',
			url: `https://snapfood.al/restaurant/${restaurant['hash_id']}/${restaurant['slug']}`,
			subject: 'Link for Snapfood',
		};
		await Share.share(shareOptions);
	};

	goToRestaurantProfile = () => {
		let route = RouteNames.RestaurantProfileScreen;
		if (this.props.navigation.state.routeName === RouteNames.SearchRestaurantDetailsScreen) {
			route = RouteNames.SearchRestaurantProfileScreen;
		}
		this.props.navigation.navigate(route, {
			restaurant: this.state['restaurant'],
		});
	};

	// renderRightHeader = () => {
	// 	const isLoading = this.state[IS_LOADING];
	// 	if (isLoading) {
	// 		return <ActivityIndicator size={Theme.icons.small} color={Theme.colors.white} />;
	// 	}
	// 	let source = require('../../../common/assets/images/restaurant/nofavorite.png');
	// 	if (this.state['favorite']) {
	// 		source = require('../../../common/assets/images/restaurant/favorite.png');
	// 	}
	// 	return (
	// 		<View style={styles.headerRightContainer}>
	// 			{this.props.isLoggedIn ? (
	// 				<TouchableOpacity
	// 					onPress={() => this.toggleFavourite(this.state['favorite'])}
	// 					style={styles.iconContainer}
	// 				>
	// 					<FastImage
	// 						source={source}
	// 						resizeMode={FastImage.resizeMode.contain}
	// 						style={styles.headerIcon}
	// 					/>
	// 				</TouchableOpacity>
	// 			) : (
	// 				<View style={styles.iconContainer} />
	// 			)}

	// 			<TouchableOpacity style={styles.iconContainer} onPress={this.share}>
	// 				<FastImage
	// 					source={require('../../../common/assets/images/restaurant/white_share.png')}
	// 					resizeMode={FastImage.resizeMode.contain}
	// 					style={styles.headerIcon}
	// 				/>
	// 			</TouchableOpacity>
	// 			<TouchableOpacity style={styles.iconContainer} onPress={this.goToRestaurantProfile}>
	// 				<FastImage
	// 					source={require('../../../common/assets/images/restaurant/white_info.png')}
	// 					resizeMode={FastImage.resizeMode.contain}
	// 					style={styles.headerIcon}
	// 				/>
	// 			</TouchableOpacity>
	// 		</View>
	// 	);
	// };

	renderRestaurantDescription(restaurant) {
		const { description } = restaurant;
		if (description !== '') {
			return (
				<View>
					<AppText style={styles.description}>{description}</AppText>
				</View>
			);
		}
		return null;
	}

	_removeItemFromCart = (product) => {
		this.updateCart({
			product: product,
			quantity: 0,
		});
		this.forceUpdate();
	};

	showBottomModal = (product) => {
		this.setState(
			{
				selectedProduct: product,
			},
			() => {
				setTimeout(() => {
					this.addProductToCartModal.open();
				});
			}
		);
	};

	onProductPress = (restaurant, product) => {
		if (!restaurant['is_open']) {
			alerts.error(
				translate('restaurant_details.we_are_sorry'),
				translate('restaurant_details.restaurant_closed')
			);
		} else if (!product['available']) {
			alerts.error(
				translate('restaurant_details.we_are_sorry'),
				translate('restaurant_details.product_not_available')
			);
		} else {
			if (
				this.props.shopRestaurant &&
				this.props.shopRestaurant.id &&
				this.props.shopRestaurant.id !== this.state.restaurant.id
			) {
				alerts
					.confirmation(
						translate('restaurant_details.started_new_order'),
						translate('restaurant_details.current_cart_will_erase'),
						translate('restaurant_details.confirm'),
						translate('restaurant_details.cancel')
					)
					.then(() => {
						this.showBottomModal(product);
						this.props.setCutlery(false);
						this.props.updateCart([], null);
					});
			} else {
				this.showBottomModal(product);
			}
		}
	};

	updateRestaurantProductQuantity = (product, quantity, item_instructions) => {
		const { restaurant } = this.state;
		const { categories } = restaurant;
		const category = categories.find((c) => c.id === product['category_id']);
		const restaurantProduct = category.products.find((p) => p.id === product.id);
		restaurantProduct.quantity = quantity;
		restaurantProduct.item_instructions = item_instructions;
		this.setState({ restaurant });
	};

	updateCart = ({ product, quantity, options, item_instructions }) => {
		this.updateRestaurantProductQuantity(product, quantity, item_instructions);
		const { items } = this.props;
		let currentProduct = items.find((i) => i.product.id === product.id);
		if (currentProduct) {
			if (quantity > 0) {
				currentProduct.quantity = quantity;
				currentProduct.options = options;
				currentProduct.item_instructions = item_instructions;
			} else {
				const i = items.findIndex((i) => i.product.id === product.id);
				items.splice(i, 1);
			}
		} else {
			items.push({ product, quantity, options, item_instructions });
		}
		this.props.updateCart(items, {
			...this.state.restaurant,
			favourite: this.state.favorite,
		});
		const setBadge = this.props.navigation.getParam('setBadge', null);
		if (setBadge) {
			setBadge();
		}
	};

	onDismiss = () => {
		this.setState({ selectedProduct: {} });
	};

	getCartScreen = () => {
		let route = RouteNames.CartScreen;
		if (this.props.navigation.state.routeName === RouteNames.SearchRestaurantDetailsScreen) {
			route = RouteNames.SearchCartScreen;
		}
		return route;
	};

	showCart = () => {
		const isLoading = this.state[IS_LOADING];
		const { shopRestaurant } = this.props;

		if (isLoading || (shopRestaurant && this.state.restaurant.id !== shopRestaurant.id)) {
			return null;
		}
		const { items } = this.props;
		//TODO: currency
		return (
			<RestaurantBottomCart
				items={items}
				currency={'L'}
				onPress={() => this.props.navigation.push(this.getCartScreen())}
			/>
		);
	};

	reorderCartReset = async (order) => {
		const restaurant = {
			...this.state.restaurant,
			favourite: this.state.favorite,
		};
		await this.setState({ reorderingId: order.id });
		this.props.reOrder(order, restaurant).then(
			async (items) => {
				await this.setState({
					reorderingId: null,
					selectedProduct: {},
					items,
				});
				this.props.navigation.push(this.getCartScreen());
			},
			(error) => {
				this.setState({ reorderingId: null });
				alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(error));
			}
		);
	};

	onReorder = (order) => {
		const { restaurant } = this.state;
		if (!restaurant['is_open']) {
			alerts.error(
				translate('restaurant_details.we_are_sorry'),
				translate('restaurant_details.restaurant_closed')
			);
		} else {
			if (
				this.props.shopRestaurant &&
				this.props.shopRestaurant.id &&
				this.props.shopRestaurant.id !== this.state.restaurant.id
			) {
				alerts
					.confirmation(
						translate('restaurant_details.started_new_order'),
						translate('restaurant_details.current_cart_will_erase'),
						translate('restaurant_details.confirm'),
						translate('restaurant_details.cancel')
					)
					.then(() => {
						this.reorderCartReset(order).then();
						this.props.setCutlery(false);
					});
			} else {
				this.reorderCartReset(order).then();
			}
		}
	};

	renderRecentOrders = () => {
		const { recentOrders, reorderingId } = this.state;

		if (recentOrders && recentOrders.length > 0) {
			return (
				<View style={{ backgroundColor: '#f5f5f5', paddingBottom: 10 }}>
					<AppText style={styles.orderAgain}>{translate('restaurant_details.recent_orders')}</AppText>
					<AppText style={styles.orderAgainDesc}>
						{translate('restaurant_details.your_recent_orders')}
					</AppText>

					<FlatList
						indicatorStyle={'white'}
						showsHorizontalScrollIndicator={false}
						data={recentOrders}
						keyExtractor={(item) => item.id.toString()}
						horizontal
						renderItem={({ item }) => {
							return (
								<RestaurantPreviousOrder
									order={item}
									onReOrder={this.onReorder}
									loading={reorderingId === item.id}
									currency={'L'} /*TODO*/
								/>
							);
						}}
					/>
				</View>
			);
		}
		return null;
	};

	renderDiscount = ({ discount }) => {
		if (!discount || !discount.value) {
			return null;
		}

		const textStyle = {
			textAlign: 'center',
			color: Theme.colors.white,
			fontSize: 14,
			fontFamily: 'SanFranciscoDisplay-Bold',
		};
		return (
			<View
				style={{
					backgroundColor: Theme.colors.cyan2,
					borderRadius: 5,
					flex: 1,
					margin: 10,
					paddingVertical: 10,
					overflow: 'hidden',
				}}
			>
				<AppText style={textStyle}>{discount.description}</AppText>
			</View>
		);
	};

	render() {
		const { restaurant, language, selectedProduct, isLoading, categoryIndex } = this.state;

		return (
			<View style={{ flex: 1 }}>
				<StickyHeader
					onScrollableMenuItemSelected={(index) => {
						console.log('onScrollableMenuItemSelected called', index);
						this.setState({ categoryIndex: index });
					}}
					onProductPress={this.onProductPress}
					removeItemFromCart={this._removeItemFromCart}
					categoryIndex={categoryIndex}
					onRestaurantProfilePressed={this.goToRestaurantProfile}
					onToggleFavourite={(favorite) => this.toggleFavourite(favorite)}
					onShare={this.share}
					onBackPressed={() => this.props.navigation.goBack()}
					onItemPressed={(product) => this.onProductPress(restaurant, product)}
					isLoggedIn={this.props.isLoggedIn}
					favorite={this.state.favorite}
					isLoading={isLoading}
					image={{ uri: restaurant.cover }}
					restaurant={restaurant}
					recentOrders={this.state.recentOrders}
					language={language}
					customStyles={styles}
					onCategoryPress={(category) => {
						this.props.navigation.navigate(RouteNames.SearchByCategoryScreen, {
							categoryId: category.id,
						});
					}}
					refreshing={this.state[IS_REFRESHING]}
					tintColor={Theme.colors.primary}
					onRefresh={() => {
						this.getRestaurantDetails(IS_REFRESHING).then();
						this.getRecentOrders();
					}}
				>
					{restaurant.max_delivery_time && <RestaurantDetailsHeader restaurant={restaurant} />}

					{this.renderRestaurantDescription(restaurant)}
					{this.renderDiscount(restaurant)}
					{this.renderRecentOrders()}
					{/* {this.renderProductList()} */}
					<RestaurantProductModal
						setRef={(ref) => (this.addProductToCartModal = ref)}
						currency={'L'} /*TODO*/
						product={selectedProduct}
						updateCart={this.updateCart}
						onDismiss={this.onDismiss}
					/>
				</StickyHeader>
				<View style={{ position: 'absolute', bottom: 0, width: '100%' }}>{this.showCart()}</View>
			</View>
		);
	}
}

const mapStateToProps = ({ app, shop }) => ({
	isLoggedIn: app.isLoggedIn,
	items: shop.items,
	shopRestaurant: shop.restaurant,
	coordinates: app.coordinates,
	selectedAddress: shop.address,
});

export default connect(mapStateToProps, {
	toggleFavourite,
	updateCart,
	setCutlery,
	reOrder,
})(withNavigation(RestaurantDetailsScreen));
