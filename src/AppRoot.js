import React from 'react';
import { AsyncStorage, StatusBar, View } from 'react-native';
import BottomTabs from './routes/stack';
import { getStorageKey, KEYS } from './common/services/storage';
import SplashScreen from 'react-native-splash-screen';
import { connect } from 'react-redux';
import { getLoggedInUser, legacyLogin, setAsLoggedIn } from './store/actions/auth';
import { setI18nConfig } from './common/services/translate';
import * as RNLocalize from 'react-native-localize';
import {
	closeRatingModal,
	getAddresses,
	getLastUnReviewedOrder,
	setAddress,
	setHasLocation,
	setSafeAreaData,
} from './store/actions/app';
import { initiateChatRoom } from './store/actions/chat';
import { getAddressByCoordinates, getCurrentLocation } from './common/services/location';
import { setCutlery, setLastOrder, updateCart } from './store/actions/shop';
import Config from './config';
import RatingOrderModal from './common/components/RatingOrderModal';
import {
	PUSH_NOTIFICATION_NEW_BLOG,
	PUSH_NOTIFICATION_NEW_VENDOR,
	PUSH_NOTIFICATION_OPENED_EVENT,
	PUSH_NOTIFICATION_RECEIVED_EVENT,
	setupPushNotifications,
} from './common/services/pushNotifications';
import { EventRegister } from 'react-native-event-listeners';
import apiFactory from './common/services/apiFactory';
import OrderProcessModal from './modules/orders/components/OrderProcessModal';
import moment from 'moment';
import { openRateAppModal, shouldOpenRateAppModal, updateOpenedAppCount } from './common/services/rate';

class AppRoot extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			orderDetails: {},
			loadedLoggedIn: false,
		};
	}

	async componentDidMount(): void {
		RNLocalize.addEventListener('change', this.handleLocalizationChange);
		await this.setLoggedIn();
		this.setupNotificationListener();
		const wasOpenedByNotification = await setupPushNotifications();
		if (!wasOpenedByNotification) {
			setTimeout(() => {
				this.props.getLastUnReviewedOrder();
			}, 300);
		}
	}

	componentWillUnmount(): void {
		RNLocalize.removeEventListener('change', this.handleLocalizationChange);
	}

	checkStoreRating = async () => {
		const shouldOpen = await shouldOpenRateAppModal();
		if (shouldOpen) {
			openRateAppModal();
		} else {
			await updateOpenedAppCount();
		}
	};

	setupNotificationListener = () => {
		EventRegister.addEventListener(PUSH_NOTIFICATION_RECEIVED_EVENT, async (notification) => {
			this.onNotificationOpened(notification);
		});
	};

	onNotificationOpened = (notification) => {
		const vm = this;
		try {
			EventRegister.emit(PUSH_NOTIFICATION_OPENED_EVENT, notification);
		} catch (e) {
			console.log(e);
		}
		if (notification && notification.data) {
			switch (notification.data.type) {
				case 'order_status_change': {
					const maxTimeout = 350;
					const startedAt = moment();
					apiFactory.get(`orders/${notification.data['order_id']}`).then(async ({ data }) => {
						await vm.setState({ orderDetails: data.order });
						if (vm.props.isReviewModalVisible) {
							await vm.props.closeRatingModal();
						}
						const diff = moment().diff(startedAt, 'milliseconds');
						setTimeout(() => {
							vm.orderDetailsModal.open();
						}, Math.max(maxTimeout - diff, 300));
					});
					break;
				}
				case 'vendor_notification': {
					setTimeout(() => {
						try {
							EventRegister.emit(PUSH_NOTIFICATION_NEW_VENDOR, notification.data);
						} catch (e) {
							console.log(e);
						}
					}, 100);
					break;
				}
				case 'blog_notification': {
					setTimeout(() => {
						try {
							apiFactory.put(`blogs/${notification.data.blog_id}`);
							EventRegister.emit(PUSH_NOTIFICATION_NEW_BLOG, notification.data);
						} catch (e) {
							console.log(e);
						}
					}, 100);
					break;
				}
				default: {
					//GOT NOTHING TO DO xD
				}
			}
		}
	};

	handleLocalizationChange = async () => {
		await setI18nConfig();
		this.forceUpdate();
	};

	appLoaded = () => {
		this.setState({ loadedLoggedIn: true }, () => {
			SplashScreen.hide();
		});
	};

	setLoggedIn = async () => {
		try {
			let token = await AsyncStorage.getItem('@Snapfood:token');
			if (token) {
				if (!token.startsWith('Bearer')) {
					token = `Bearer ${token}`;
				}
				await this.props.legacyLogin(token);
				await AsyncStorage.setItem('@Snapfood:token', '');
			}
		} catch (e) {
			console.log(e);
		}
		try {
			this.props.setSafeAreaData();
			try {
				await setI18nConfig().then();
			} catch (e) {
				console.log(e);
			}
			try {
				const hasLocation = await getStorageKey(KEYS.HAS_LOCATION);
				if (hasLocation) {
					const location = await getCurrentLocation();
					await this.props.setHasLocation(true);
					const address = await getAddressByCoordinates(location);
					await this.props.setAddress({
						coordinates: {
							latitude: location.latitude,
							longitude: location.longitude,
						},
						address,
					});
				}
			} catch (e) {
				try {
					const location = await getStorageKey(KEYS.LAST_COORDINATES);
					await this.props.setHasLocation(true);
					const address = await getAddressByCoordinates(location);
					await this.props.setAddress({
						coordinates: {
							latitude: location.latitude,
							longitude: location.longitude,
						},
						address,
					});
				} catch (er) {
					await this.props.setHasLocation(false);
				}
			}
			const isLoggedIn = await getStorageKey(KEYS.IS_LOGGED_IN);
			if (isLoggedIn) {
				try {
					const user = await this.props.getLoggedInUser();
					if (!Config.isAndroid && user && user.id > 0) {
						this.checkStoreRating();
					}
				} catch (e) {
					console.log(e);
				}
				this.props.initiateChatRoom();
				this.props.getAddresses();
				await this.props.setAsLoggedIn();
			}
			const cartItems = await getStorageKey(KEYS.CART_ITEMS);
			const cartRestaurant = await getStorageKey(KEYS.CART_RESTAURANT);

			if (cartItems && cartRestaurant) {
				this.props.updateCart(cartItems, cartRestaurant);
			}
			this.appLoaded();

			try {
				const cutlery = await getStorageKey(KEYS.CUTLERY);
				this.props.setCutlery(!!cutlery);
			} catch (e) {
				this.props.setCutlery(false);
			}

			try {
				const order = await getStorageKey(KEYS.LAST_ORDER);
				this.props.setLastOrder(order);
			} catch (e) {
				this.props.setLastOrder({});
			}
		} catch (e) {
			this.appLoaded();
		}
	};

	renderOrderDetailsModal = () => {
		return (
			<OrderProcessModal
				setRef={(ref) => (this.orderDetailsModal = ref)}
				onClose={() => this.setState({ orderDetails: {} })}
				order={this.state.orderDetails}
			/>
		);
	};

	renderContent = () => {
		const { loadedLoggedIn } = this.state;
		if (!loadedLoggedIn) {
			return null;
		}
		return <BottomTabs />;
	};

	render() {
		const { reviewModalData, isReviewModalVisible } = this.props;

		return (
			<View style={{ flex: 1 }}>
				{!Config.isAndroid && <StatusBar barStyle={'dark-content'} />}
				<RatingOrderModal isVisible={isReviewModalVisible} order={reviewModalData} />
				{this.renderContent()}
				{this.renderOrderDetailsModal()}
			</View>
		);
	}
}

const mapStateToProps = ({ app }) => ({
	isReviewModalVisible: app.isReviewModalVisible,
	reviewModalData: app.reviewModalData,
});

export default connect(mapStateToProps, {
	setAsLoggedIn,
	initiateChatRoom,
	setAddress,
	setHasLocation,
	updateCart,
	getAddresses,
	setCutlery,
	setLastOrder,
	setSafeAreaData,
	getLastUnReviewedOrder,
	getLoggedInUser,
	closeRatingModal,
	legacyLogin,
})(AppRoot);
