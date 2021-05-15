import React from 'react';
import {
	ActivityIndicator,
	Keyboard,
	RefreshControl,
	ScrollView,
	Switch,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import AppText from '../../../common/components/AppText';
import {
	calculateCartTotal,
	extractErrorMessage,
	formatPrice,
	getStaticMapUrl,
} from '../../../common/services/utility';
import RouteNames from '../../../routes/names';
import { translate } from '../../../common/services/translate';
import FastImage from 'react-native-fast-image';
import styles from './styles/cart';
import apiFactory from '../../../common/services/apiFactory';
import FavoriteFoodSlider from '../components/FavouriteFoodSlider';

import Config from '../../../config';
import Theme from '../../../theme';
import SelectAddressModal from '../components/SelectAddressModal';
import {
	getDiscount,
	sendOrder,
	setCouponCode,
	setCutlery,
	setStoreAddress,
	updateCartItems,
} from '../../../store/actions/shop';
import alerts from '../../../common/services/alerts';
import OrderProcessModal from '../../orders/components/OrderProcessModal';
import BlockSpinner from '../../../common/components/BlockSpinner';
import { EventRegister } from 'react-native-event-listeners';
import { PUSH_NOTIFICATION_OPENED_EVENT } from '../../../common/services/pushNotifications';
import { getAddresses } from '../../../store/actions/app';
import CartProductItem from '../components/CartProductItem';
import CartAddressSection from '../components/CartAddressSection';
import CartSubTotals from '../components/CartSubTotals';
import FontelloIcon from '../../../common/components/FontelloIcon';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { KEYS, getStorageKey } from '../../../common/services/storage';

const IS_LOADING = 'isLoading';
const IS_REFRESHING = 'isRefreshing';
const IS_LOADING_COUPON = 'isLoadingCoupon';
const HAS_VALID_COUPON = 'hasValidCoupon';

class CartScreen extends React.Component {
	constructor(props) {
		super(props);

		const { restaurant } = props;
		const { user } = props;
		const { hasCutlery } = props;
		const { selectedAddress } = props;

		const favorites = [];

		if (restaurant.categories) {
			for (const category of restaurant.categories) {
				for (const product of category.products) {
					if (product['is_popular']) {
						favorites.push(product);
					}
				}
			}
		}

		this.state = {
			coupon: '', //TODO: update this from store if has a valid one
			notes: selectedAddress ? selectedAddress.notes : '',
			processingOrder: false,
			allFavorites: favorites,
			favorites: [],
			isPickup: false, //TODO
			currency: 'L', //TODO
			deliveryFee: restaurant.delivery_fee,
			maxDeliveryTime: restaurant['maximum_delivery_time'],
			minOrderPrice: restaurant['delivery_minimum_order_price'],
			outOfDeliveryArea: false,
			hasCutlery: !!hasCutlery,
			phone: user.phone,
			total: 0,
			showMinAlert: false,
			processingOrderData: {},
			lastSelectedAddress: {},
			discountInfo: {},
			[IS_LOADING]: true,
			[IS_REFRESHING]: false,
			[IS_LOADING_COUPON]: false,
			[HAS_VALID_COUPON]: false, //TODO: update this from store
			couponInfo: {},
			couponSuccessMessage: null,
		};
	}

	static navigationOptions = () => {
		return {
			title: 'Checkout',
		};
	};

	componentDidMount(): void {
		this.focusListener = this.props.navigation.addListener('didFocus', async () => {
			await this.getStoreCoupon();
			this.getDeliveryFees(IS_LOADING).then();
			this.props.getAddresses();
		});
		this.eventListener = EventRegister.addEventListener(PUSH_NOTIFICATION_OPENED_EVENT, () => {
			if (this.detailsModal) {
				this.detailsModal.close();
			}
		});
	}

	componentWillUnmount(): void {
		if (this.focusListener) {
			this.focusListener.remove();
		}
		EventRegister.removeEventListener(this.eventListener);
	}

	getStoreCoupon = async () => {
		try {
			const cartCoupon = await getStorageKey(KEYS.COUPON_CODE);
			await this.setState({
				coupon: cartCoupon,
			});
			return cartCoupon;
		} catch (e) {
			this.props.setCouponCode(null);
			return null;
		}
	};

	getDeliveryFees = async (prop = IS_REFRESHING) => {
		const { restaurant, items } = this.props;
		const { selectedAddress, coordinates } = this.props;
		if (!restaurant || !restaurant.id) {
			this.props.navigation.goBack();
			return;
		}
		const params = [`vendor_id=${restaurant.id}`];
		if (selectedAddress.id) {
			params.push(`address_id=${selectedAddress.id}`);
		} else {
			params.push(`lat=${coordinates.latitude}`);
			params.push(`lng=${coordinates.longitude}`);
		}
		const queryParams = params.join('&');
		await this.setState({ [prop]: true });
		apiFactory.get(`checkout/delivery-fee?${queryParams}`).then(
			async ({ data }) => {
				const total = calculateCartTotal(items);
				this.setState({
					total,
					deliveryFee: data['deliveryFee'],
					maxDeliveryTime: data['deliveryTime'],
					minOrderPrice: data['minimumOrder'],
					outOfDeliveryArea: data['outOfDeliveryArea'],
					[prop]: false,
				});
				this.checkMinPrice();
			},
			async (error) => {
				await this.props.setStoreAddress(this.state.lastSelectedAddress);
				alerts.error(translate('attention'), extractErrorMessage(error));
				if (prop === IS_LOADING) {
					this.getDeliveryFees(IS_LOADING);
				} else {
					this.setState({
						[prop]: false,
					});
				}
			}
		);
	};

	isReOrdering = (products) => {
		const { lastOrder } = this.props;
		if (!lastOrder || !lastOrder.products || lastOrder.products.length === 0) {
			return 0;
		}
		const lastOrderProducts = lastOrder.products.map((p) => {
			return {
				id: p['product_id'],
				qty: p.quantity,
				options: p.options && p.options.length > 0 ? p.options.map((x) => x.id) : [],
			};
		});
		if (products.length !== lastOrderProducts.length) {
			return 0;
		}
		for (let i = 0; i < products.length; i++) {
			const p = products[i];
			const lastP = lastOrderProducts.find((x) => x.id === p.id);
			if (!lastP) {
				return 0;
			}
			if (p.qty !== lastP.qty) {
				return 0;
			}
		}
		return 1;
	};

	finalizeCheckout = async () => {
		await this.setState({ processingOrder: true });
		const { items, restaurant } = this.props;
		const products = items.map((item) => {
			return {
				id: item.product.id,
				qty: item.quantity,
				options: item.options && item.options.length > 0 ? item.options.map((x) => x.id) : [],
				item_instructions: item.item_instructions,
			};
		});

		const orderData = {
			vendor_id: restaurant.id,
			products,
			notes: this.state.notes,
			has_cutlery: !!this.state.hasCutlery ? 1 : 0,
			source: Config.isAndroid ? 'android' : 'ios',
			repeated: this.isReOrdering(products),
			coupon_code: this.state.coupon,
		};

		let { selectedAddress, locationAddress, coordinates } = this.props;

		if (!selectedAddress || !selectedAddress.id) {
			orderData.address = {
				...locationAddress,
				lat: coordinates.latitude,
				lng: coordinates.longitude,
			};
		} else {
			orderData.address_id = selectedAddress.id;
		}

		this.props.sendOrder(orderData).then(
			(order) => {
				this.props.setCouponCode(null);
				if (!order.vendor) {
					order.vendor = restaurant;
				}
				this.setState(
					{
						isShowingDetailsModal: true,
						processingOrder: false,
						processingOrderData: order,
					},
					() => {
						this.detailsModal.open();
					}
				);
			},
			(error) => {
				this.setState({ processingOrder: false });
				alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(error));
			}
		);
	};

	onCheckoutPress = () => {
		const { isPickup, showMinAlert } = this.state;
		const { restaurant, isLoggedIn, hasVerifiedPhone } = this.props;

		if (!isPickup && showMinAlert) {
			return alerts.error(
				translate('attention'),
				`${translate('cart.minimum_order')} ${this.state['minOrderPrice']}${this.state.currency}`
			);
		}
		if (!restaurant['is_open']) {
			return alerts.error(
				translate('restaurant_details.we_are_sorry'),
				translate('restaurant_details.restaurant_closed')
			);
		}
		if (isLoggedIn && hasVerifiedPhone) {
			return this.finalizeCheckout();
		} else {
			this.props.navigation.navigate(RouteNames.LoginScreen, {
				backScreenView: this.props.navigation.state.routeName,
			});
		}
	};

	calculateTotal = (hasFreeDelivery) => {
		const { total, deliveryFee, discountInfo } = this.state;
		let discountValue = 0;
		const totalDiscountTypes = ['discount', 'percentage', 'fixed'];
		if (totalDiscountTypes.indexOf(discountInfo.type) > -1) {
			discountValue = discountInfo && discountInfo.value ? discountInfo.value : 0;
		}
		let delivery = deliveryFee;
		if (hasFreeDelivery) {
			delivery = 0;
		}
		return formatPrice(parseFloat(total) + parseFloat(delivery) - parseFloat(discountValue));
	};

	renderTotal = () => {
		const { processingOrder } = this.state;

		const containerStyles = [
			styles.bottomContainer,
			{ paddingBottom: this.props.safeAreaDims.bottom ? this.props.safeAreaDims.bottom / 3 : 0 },
		];

		if (processingOrder) {
			return (
				<View style={containerStyles}>
					<ActivityIndicator
						style={[Theme.styles.buttonText]}
						size={Theme.sizes.normal}
						color={Theme.colors.whitePrimary}
					/>
				</View>
			);
		}

		const { discountInfo } = this.state;
		const hasFreeDelivery = discountInfo && ['free_delivery'].indexOf(discountInfo.type) > -1;

		return (
			<TouchableOpacity style={containerStyles} onPress={() => this.onCheckoutPress()}>
				<View style={{ flex: 7 }}>
					<AppText
						style={{
							paddingLeft: 15,
							color: Theme.colors.white,
							fontFamily: 'SanFranciscoDisplay-Bold',
							fontSize: 15,
						}}
					>
						{translate('cart.continue_with_payment')}
					</AppText>
				</View>
				<View style={{ flex: 2 }}>
					<AppText
						style={{
							paddingRight: 15,
							color: Theme.colors.white,
							fontFamily: 'SanFranciscoDisplay-Bold',
							fontSize: 15,
							textAlign: 'right',
						}}
					>
						{this.calculateTotal(hasFreeDelivery)} {this.state.currency}
					</AppText>
				</View>
				<View style={{ flex: 1 }}>
					<FastImage
						resizeMode={FastImage.resizeMode.contain}
						source={require('../../../common/assets/images/restaurant/checkout_cart.png')}
						style={styles.footerImage}
					/>
				</View>
			</TouchableOpacity>
		);
	};

	goToDetails = () => {
		const { restaurant } = this.props;
		this.props.navigation.push(RouteNames.RestaurantDetailsScreen, {
			restaurant,
			restaurantTitle: restaurant.title,
			isFavourite: restaurant.favourite,
		});
	};

	renderChangeOrder = () => {
		const { restaurant } = this.props;
		if (!restaurant || !restaurant.id || !restaurant['is_open']) {
			return null;
		}
		return (
			<View style={{ paddingHorizontal: 15, paddingBottom: 5, flexDirection: 'row' }}>
				<AppText numberOfLines={2} ellipsizeMode='tail' style={styles.changeOrderTopContainerText}>
					{translate('cart.change_this_order')}
				</AppText>
				<TouchableOpacity
					onPress={() => this.goToDetails()}
					style={{ ...styles.orderTopContainer, marginTop: 5, marginBottom: 15, marginLeft: 0 }}
				>
					<AppText style={styles.changeOrderTopContainerMenu}>
						{' '}
						{translate('cart.change_this_order_restaurant_menu')}
					</AppText>
				</TouchableOpacity>
			</View>
		);
	};

	renderClosedRestaurant = () => {
		const { restaurant } = this.props;
		if (!restaurant || !restaurant.id || restaurant['is_open']) {
			return null;
		}
		return (
			<View
				style={{
					...styles.bottomContainerButton,
					paddingHorizontal: 15,
					paddingBottom: 5,
					flexDirection: 'row',
				}}
			>
				<AppText style={styles.bottomContainerButtonText} ellipsizeMode='tail'>
					{translate('cart.closed_restaurant')}
				</AppText>
			</View>
		);
	};

	renderSender = () => {
		const { restaurant } = this.props;

		let deliveryMethod = restaurant.title;
		if(restaurant.delivery_type && restaurant.delivery_type === 'Snapfood') {
			deliveryMethod = 'Snapfood';
		}

		return (
			<View style={styles.profileContainer}>
				<View style={styles.profileImageContainer}>
					<FastImage
						source={require('../../../common/assets/images/motori.png')}
						style={{
							width: 46,
							height: 28,
							marginLeft: -5,
						}}
					/>
				</View>
				<View style={styles.infoContainer}>
					<View>
						<AppText style={styles.nameText}>
							{translate('cart.order_arrives_for_x_minutes').replace('%', this.state.maxDeliveryTime)}
						</AppText>
					</View>
					<AppText style={styles.deliveryTimeText}>
						{translate('cart.delivered_by')} {deliveryMethod}
					</AppText>
				</View>
			</View>
		);
	};

	addressSection() {
		let { selectedAddress, locationAddress, coordinates } = this.props;
		if (!selectedAddress || !selectedAddress.id) {
			selectedAddress = locationAddress;
		}
		const { notes, showInstructions, outOfDeliveryArea } = this.state;
		const latitude = selectedAddress.lat ? parseFloat(selectedAddress.lat) : coordinates.latitude;
		const longitude = selectedAddress.lng ? parseFloat(selectedAddress.lng) : coordinates.longitude;
		const staticMapUrl = getStaticMapUrl({ latitude, longitude });
		return (
			<CartAddressSection
				notes={notes}
				staticMapUrl={staticMapUrl}
				outOfDeliveryArea={outOfDeliveryArea}
				selectedAddress={selectedAddress}
				addressesModal={this.addressesModal}
				showInstructions={showInstructions}
				setState={(state) => this.setState(state)}
			/>
		);
	}

	isSameProductAsDiscount = (discount, product) => {
		return discount && discount.product && discount.product.id === product.product.id;
	};

	calculateProductPrice(product) {
		let total = 0;
		let qty = product.quantity;
		const { discountInfo } = this.state;
		const isSameProduct = this.isSameProductAsDiscount(discountInfo, product);
		if (isSameProduct) {
			qty = qty + discountInfo.value;
		}

		total += parseFloat(product.product.price);
		if (product.options) {
			product.options.map((option) => (total += parseFloat(option.price)));
		}
		total = total * parseFloat(qty);

		return `${formatPrice(total)} ${this.state.currency}`;
	}

	validateCoupon = async (vendorId, total) => {
		const { coupon } = this.state;
		return new Promise((resolve, reject) => {
			apiFactory.get(`/coupons?subtotal=${total}&&vendor_id=${vendorId}&code=${coupon}`).then(
				async ({ data }) => {
					const discountInfo = data.coupon;
					await this.setState({
						[HAS_VALID_COUPON]: true,
					});
					this.props.setCouponCode(coupon);
					resolve(discountInfo);
				},
				async (error) => {
					await this.setState({
						couponSuccessMessage: null,
						[HAS_VALID_COUPON]: false,
					});
					this.props.setCouponCode(null);
					const message = extractErrorMessage(error);
					reject(message);
				}
			);
		});
	};

	checkMinPrice = async (showCouponMessages = false) => {
		const { restaurant, items } = this.props;
		let { discountInfo } = this.state;
		const total = calculateCartTotal(items, discountInfo);
		const { allFavorites } = this.state;

		const productIds = items.map((x) => x.product.id);
		const favorites = allFavorites.filter((x) => productIds.indexOf(x.id) === -1);

		try {
			if (showCouponMessages) {
				await this.setState({ [IS_LOADING_COUPON]: true });
			}
			discountInfo = await this.validateCoupon(restaurant.id, total);
			this.setState({
				couponSuccessMessage: translate('cart.coupon.applied_successfully'),
			});
		} catch (message) {
			if (showCouponMessages && typeof message === 'string') {
				alerts.error(translate('alerts.error'), message);
			}
		}

		if (!this.state[HAS_VALID_COUPON]) {
			discountInfo = await this.props.getDiscount(restaurant.id, total);
		}

		this.setState({
			showMinAlert: total < this.state.minOrderPrice,
			favorites: favorites,
			total: total,
			discountInfo: discountInfo,
			[IS_LOADING_COUPON]: false,
		});
	};

	decrement = (cartProduct) => {
		const { items } = this.props;
		let currentProduct = items.find((i) => i.product.id === cartProduct.product.id);
		if (currentProduct) {
			currentProduct.quantity = Math.max(currentProduct.quantity - 1, 0);
			if (currentProduct.quantity === 0) {
				items.splice(
					items.findIndex((i) => i.product.id === cartProduct.product.id),
					1
				);
			}
			this.props.updateCartItems(items);
			this.checkMinPrice();
			const setBadge = this.props.navigation.getParam('setBadge', null);
			if (setBadge) {
				setBadge();
			}
		}
	};

	increment = (cartProduct) => {
		const { items } = this.props;
		let currentProduct = items.find((i) => i.product.id === cartProduct.product.id);
		if (currentProduct) {
			currentProduct.quantity++;
			this.props.updateCartItems(items);
			this.checkMinPrice();
			const setBadge = this.props.navigation.getParam('setBadge', null);
			if (setBadge) {
				setBadge();
			}
		} else {
			const { discountInfo } = this.state;
			if (this.isSameProductAsDiscount(discountInfo, cartProduct)) {
				this.addSuggested(discountInfo.product);
			}
		}
	};

	renderCartProducts = (cartProducts) => {
		const { items } = this.props;
		const { discountInfo } = this.state;
		let existsInCart = false;
		if (discountInfo && discountInfo.product) {
			existsInCart = !!items.find((x) => x.product.id === discountInfo.product.id);
		}
		return (
			<View>
				{cartProducts.map((cartProduct) => {
					return (
						<CartProductItem
							key={cartProduct.product.id}
							product={cartProduct}
							increment={(product) => this.increment(product)}
							decrement={(product) => this.decrement(product)}
							calculateProductPrice={(product) => this.calculateProductPrice(product)}
							discount={discountInfo}
						/>
					);
				})}
				{!existsInCart && discountInfo && discountInfo.product && (
					<CartProductItem
						product={{
							options: [],
							item_instructions: '',
							product: discountInfo.product,
							quantity: 0,
						}}
						increment={(product) => this.increment(product)}
						decrement={(product) => this.decrement(product)}
						calculateProductPrice={(product) => this.calculateProductPrice(product)}
						discount={discountInfo}
					/>
				)}
			</View>
		);
	};

	closeAddressModal = () => {
		this.addressesModal.close();
	};

	onAddressSelected = async (address) => {
		this.closeAddressModal();
		await this.setState({ lastSelectedAddress: this.props.selectedAddress });
		await this.props.setStoreAddress(address);
		this.setState({
			notes: address.notes,
			showInstructions: !!address.notes,
		});
		await this.getDeliveryFees(IS_REFRESHING);
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

	handleRefresh = () => {
		return (
			<RefreshControl
				refreshing={this.state[IS_REFRESHING]}
				tintColor={Theme.colors.primary}
				onRefresh={() => {
					this.getDeliveryFees(IS_REFRESHING).then();
				}}
			/>
		);
	};

	renderMinPriceAlert = () => {
		const { showMinAlert } = this.state;
		if (!showMinAlert) {
			return null;
		}
		return (
			<View style={{ backgroundColor: '#fff', paddingHorizontal: 15, marginTop: 15 }}>
				<TouchableOpacity
					style={{
						...styles.bottomContainerButton,
						padding: 10,
					}}
				>
					<AppText style={styles.bottomContainerButtonText}>
						{translate('cart.minimum_order')} {formatPrice(this.state.minOrderPrice)} {this.state.currency}
					</AppText>
				</TouchableOpacity>
			</View>
		);
	};

	addSuggested = (product) => {
		const { items } = this.props;
		items.push({
			product,
			quantity: 1,
		});
		this.props.updateCartItems(items);
		this.checkMinPrice();
		const setBadge = this.props.navigation.getParam('setBadge', null);
		if (setBadge) {
			setBadge();
		}
	};

	renderFavouriteProducts = () => {
		const { favorites } = this.state;
		if (!favorites || favorites.length === 0) {
			return null;
		}

		return (
			<React.Fragment>
				<View style={{ marginVertical: 8, backgroundColor: '#F4F4F4' }} />
				<View style={{ backgroundColor: 'white', flex: 1 }}>
					<AppText style={styles.favoriteMainTitle}>{translate('cart.favorite_products')}</AppText>
					<ScrollView horizontal={true} indicatorStyle={'white'} showsHorizontalScrollIndicator={false}>
						{favorites.map((product) => (
							<FavoriteFoodSlider
								key={product.id}
								product={product}
								currency={this.state.currency}
								add={this.addSuggested}
								count={favorites.length}
							/>
						))}
					</ScrollView>
				</View>
			</React.Fragment>
		);
	};

	handleHasCutlerySwitch = (hasCutlery) => {
		this.setState({ hasCutlery });
		this.props.setCutlery(hasCutlery);
	};

	renderCutlery = () => {
		const { hasCutlery } = this.state;

		return (
			<View
				style={{
					flex: 1,
					backgroundColor: 'white',
					marginVertical: 15,
					paddingVertical: 10,
					flexDirection: 'row',
					alignItems: 'center',
					paddingHorizontal: 15,
				}}
			>
				<View style={{ justifyContent: 'center', flex: 1 }}>
					<AppText style={{ marginVertical: 5, fontSize: 14, fontWeight: 'bold' }}>
						{translate('cart.cutlery_title')}
					</AppText>
					<AppText style={{ marginVertical: 5, fontSize: 13, color: Theme.colors.gray1 }}>
						{!hasCutlery
							? translate('cart.cutlery_description_off')
							: translate('cart.cutlery_description_on')}
					</AppText>
				</View>
				<Switch
					value={hasCutlery}
					onValueChange={this.handleHasCutlerySwitch}
					trackColor={{ true: Theme.colors.cyan1 }}
				/>
			</View>
		);
	};

	renderSubTotals = () => {
		const { total, deliveryFee, discountInfo } = this.state;
		return (
			<CartSubTotals
				total={total}
				deliveryFee={deliveryFee}
				discountInfo={discountInfo}
				calculateTotal={(hasFreeDelivery) => this.calculateTotal(hasFreeDelivery)}
			/>
		);
	};

	renderProcessingOrderModal = () => {
		const { processingOrderData } = this.state;
		return (
			<OrderProcessModal
				setRef={(ref) => (this.detailsModal = ref)}
				onClose={() => this.props.navigation.navigate(RouteNames.HomeScreen)}
				order={processingOrderData}
			/>
		);
	};

	checkCoupon = async () => {
		Keyboard.dismiss();
		await this.checkMinPrice(true);
	};

	renderCouponInput = () => {
		const isLoading = this.state[IS_LOADING_COUPON];
		const isValid = this.state[HAS_VALID_COUPON];
		const { coupon, couponSuccessMessage } = this.state;

		return (
			<View style={styles.couponContainer}>
				<View style={{ zIndex: 50, marginVertical: 15 }}>
					<AppText style={styles.couponTitle}>{translate('cart.coupon.have_one')}</AppText>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							borderRadius: 5,
						}}
					>
						<TextInput
							style={{
								flex: 1,
								borderBottomWidth: 0.25,
								borderColor: '#cbcbcb',
								marginTop: 10,
								paddingVertical: 5,
							}}
							value={coupon}
							placeholder={translate('cart.coupon.placeholder')}
							onChangeText={(coupon) => this.setState({ coupon })}
							autoCapitalize={'none'}
							autoCorrect={false}
							returnKeyType={'done'}
							onSubmitEditing={() => this.checkCoupon()}
							placeholderTextColor={Theme.colors.placeholder}
						/>
						<TouchableOpacity
							style={{
								position: 'absolute',
								right: 10,
							}}
							onPress={() => this.checkCoupon()}
						>
							{isLoading ? (
								<ActivityIndicator color={Theme.colors.primary} />
							) : (
								<FontelloIcon
									icon='ok-1'
									size={Theme.icons.small}
									color={isValid ? Theme.colors.cyan2 : Theme.colors.placeholder}
								/>
							)}
						</TouchableOpacity>
					</View>
					{!!couponSuccessMessage && (
						<View>
							<AppText
								style={{
									marginTop: 5,
									color: Theme.colors.cyan2,
									fontSize: 13,
								}}
							>
								{couponSuccessMessage}
							</AppText>
						</View>
					)}
				</View>
				<View style={{ position: 'absolute', top: -10, right: 10 }}>
					<FontelloIcon icon='ticket' size={135} color={Theme.colors.greyBackground} />
				</View>
			</View>
		);
	};

	render() {
		const isLoading = this.state[IS_LOADING];
		if (isLoading) {
			return <BlockSpinner />;
		}

		const { items } = this.props;
		return (
			<View style={styles.container}>
				<KeyboardAwareScrollView
					refreshControl={this.handleRefresh()}
					style={styles.topContainer}
					enableOnAndroid={true}
					keyboardShouldPersistTaps='handled'
				>
					<View style={{ paddingVertical: 8 }} />
					{this.renderChangeOrder()}
					{this.renderClosedRestaurant()}
					{this.renderSender()}
					{this.addressSection()}
					{this.renderCartProducts(items)}
					{this.renderMinPriceAlert()}
					{this.renderFavouriteProducts()}
					{this.renderCutlery()}
					{this.renderCouponInput()}
					{this.renderSubTotals()}
				</KeyboardAwareScrollView>
				{this.renderTotal()}
				{this.renderAddressesModal()}
				{this.renderProcessingOrderModal()}
			</View>
		);
	}
}

const mapStateToProps = ({ app, shop }) => ({
	user: app.user,
	items: shop.items,
	isLoggedIn: app.isLoggedIn,
	restaurant: shop.restaurant,
	addresses: app.addresses,
	coordinates: app.coordinates,
	locationAddress: app.address,
	selectedAddress: shop.address,
	hasCutlery: shop.hasCutlery,
	lastOrder: shop.lastOrder,
	safeAreaDims: app.safeAreaDims,
	hasVerifiedPhone: app.hasVerifiedPhone,
});

export default connect(mapStateToProps, {
	getDiscount,
	setStoreAddress,
	updateCartItems,
	setCutlery,
	sendOrder,
	getAddresses,
	setCouponCode,
})(withNavigation(CartScreen));
