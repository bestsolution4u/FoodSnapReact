import React from 'react';
import { ActivityIndicator, Dimensions, FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import AppText from '../../../common/components/AppText';
import apiFactory from '../../../common/services/apiFactory';
import { translate } from '../../../common/services/translate';
import FastImage from 'react-native-fast-image';
import RouteNames from '../../../routes/names';
import OrderItem from '../components/OrderItem';
import Theme from '../../../theme';
import { TabBar, TabView } from 'react-native-tab-view';
import Config from '../../../config';
import OrderProcessModal from '../components/OrderProcessModal';
import alerts from '../../../common/services/alerts';
import { extractErrorMessage } from '../../../common/services/utility';
import { reOrder, setCutlery } from '../../../store/actions/shop';
import BlockSpinner from '../../../common/components/BlockSpinner';
import { EventRegister } from 'react-native-event-listeners';
import { PUSH_NOTIFICATION_OPENED_EVENT } from '../../../common/services/pushNotifications';

const IS_LOADING = 'isLoading';
const IS_REFRESHING = 'isRefreshing';
const IS_LOADING_NEXT = 'isLoadingNextPage';
const IS_LOADING_PROCESSING = 'isLoadingProcessing';
const IS_REFRESHING_PROCESSING = 'isRefreshingProcessing';

const windowWidth = Dimensions.get('window').width;

const initialLayout = {
	height: 0,
	width: windowWidth,
};

const getOrderTabs = () => {
	return [
		{
			id: 0,
			key: 'processing',
			title: translate('orders.processing_tab'),
			color: Theme.colors.primary,
		},
		{
			id: 1,
			key: 'completed',
			title: translate('orders.completed_tab'),
			color: Theme.colors.primary,
		},
	];
};

class OrdersScreen extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loadingReOrderId: null,
			[IS_LOADING]: false,
			[IS_REFRESHING]: false,
			[IS_LOADING_NEXT]: false,
			[IS_LOADING_PROCESSING]: false,
			[IS_REFRESHING_PROCESSING]: false,
			selectedOrder: null,
			orders: [],
			processingOrders: [],
			tabs: getOrderTabs(),
			orderStats: {},
			page: 1,
			index: 0,
		};
		this.firstLoad = true;
	}

	static navigationOptions = ({ navigation }) => {
		return {
			title: navigation.getParam('headerTitle', translate('orders.order_title')),
		};
	};

	componentDidMount(): void {
		this.firstLoad = false;
		this.getProcessingOrders().then();
		this.getOrders().then();
		this.focusListener = this.props.navigation.addListener('didFocus', () => {
			if (!this.firstLoad) {
				this.getProcessingOrders(IS_REFRESHING).then();
				this.getOrders(IS_REFRESHING_PROCESSING).then();
			}
			if (this.props.isLoggedIn) {
				this.props.navigation.setParams({
					headerTitle: translate('orders.order_title'),
				});
				this.setState({
					tabs: getOrderTabs(),
				});
			} else {
				this.props.navigation.navigate(RouteNames.ProfileStack);
			}
		});
		this.eventListener = EventRegister.addEventListener(PUSH_NOTIFICATION_OPENED_EVENT, () => {
			if (this.detailsModal) {
				this.detailsModal.close();
			}
		});
	}

	componentWillUnmount(): void {
		this.focusListener.remove();
		EventRegister.removeEventListener(this.eventListener);
	}

	getOrders = async (prop = IS_LOADING) => {
		await this.setState({ [prop]: true });
		const { page } = this.state;
		apiFactory.get(`orders?status=past&page=${page}`).then(({ data }) => {
			data = data.orders;
			if ([IS_LOADING_NEXT].indexOf(prop) > -1) {
				const { orders } = this.state;
				this.setState({
					[prop]: false,
					page: data['current_page'],
					totalPages: data['last_page'],
					orders: [...orders, ...data.data],
				});
			} else {
				this.setState({
					[prop]: false,
					page: data['current_page'],
					totalPages: data['last_page'],
					orders: data.data,
				});
			}
		});
	};

	getProcessingOrders = async (prop = IS_LOADING_PROCESSING) => {
		await this.setState({ [prop]: true });
		apiFactory.get('orders?status=current').then(({ data }) => {
			this.setState({
				[prop]: false,
				processingOrders: data.orders.data,
			});
		});
	};

	renderNoOrders = () => {
		return (
			<View style={{ marginTop: 50, marginBottom: 300 }}>
				<View style={Theme.styles.noData.imageContainer}>
					<FastImage
						resizeMode={FastImage.resizeMode.contain}
						source={require('../../../common/assets/images/orders/noorders.png')}
						style={Theme.styles.noData.noImage}
					/>
				</View>
				<AppText style={Theme.styles.noData.noTitle}>{translate('orders.no_recent_orders')}</AppText>
				<AppText style={Theme.styles.noData.noDescription}>
					{translate('orders.no_recent_orders_message')}
				</AppText>
				<TouchableOpacity
					onPress={() => this.props.navigation.navigate(RouteNames.HomeScreen)}
					style={Theme.styles.noData.button}
				>
					<AppText style={Theme.styles.noData.buttonText}>{translate('orders.order_now')}</AppText>
				</TouchableOpacity>
			</View>
		);
	};

	loadNextPage = async () => {
		const isLoadingNext = this.state[IS_LOADING_NEXT];
		const { page, totalPages } = this.state;
		if (!isLoadingNext && page < totalPages) {
			await this.setState({
				page: page + 1,
				[IS_LOADING_NEXT]: true,
			});
			this.getOrders(IS_LOADING_NEXT);
		}
	};

	renderNextLoader = () => {
		if (this.state[IS_LOADING_NEXT]) {
			return <ActivityIndicator size={Theme.sizes.xLarge} color={Theme.colors.primary} />;
		}
		return null;
	};

	reorderRequest = async (order, restaurant) => {
		await this.setState({ loadingReOrderId: order.id });
		this.props.reOrder(order, restaurant).then(
			async () => {
				await this.setState({ loadingReOrderId: null });
				this.props.navigation.navigate(RouteNames.OrdersCartScreen);
			},
			async (error) => {
				await this.setState({ loadingReOrderId: null });
				alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(error));
			}
		);
	};

	reorder = (order) => {
		const restaurant = order.vendor;
		if (
			this.props.shopRestaurant &&
			this.props.shopRestaurant.id &&
			this.props.shopRestaurant.id !== restaurant.id
		) {
			alerts
				.confirmation(
					translate('restaurant_details.started_new_order'),
					translate('restaurant_details.current_cart_will_erase'),
					translate('restaurant_details.confirm'),
					translate('restaurant_details.cancel')
				)
				.then(() => {
					this.reorderRequest(order, restaurant);
					this.props.setCutlery(false);
				});
		} else {
			this.reorderRequest(order, restaurant);
		}
	};

	renderOrders = (tabIndex) => {
		let orders;
		let isPaginated = true;
		if (tabIndex === 0) {
			orders = this.state.processingOrders;
			isPaginated = false;
		} else {
			orders = this.state.orders;
		}

		const { selectedOrder, loadingReOrderId } = this.state;

		return (
			<View>
				<OrderProcessModal
					setRef={(ref) => (this.detailsModal = ref)}
					loading={selectedOrder && loadingReOrderId === selectedOrder.id}
					onReorder={(order) => {
						this.detailsModal.close();
						setTimeout(() => {
							this.reorder(order);
						}, 400);
					}}
					ratingAdded={(rating) => {
						orders = orders.map((x) => {
							if (x.id === selectedOrder.id) {
								x.rating = rating;
							}
							return x;
						});
						this.setState({ orders });
					}}
					order={selectedOrder}
				/>
				<FlatList
					ref={(ref) => (this.flatListRef = ref)}
					keyExtractor={(item) => item.id.toString()}
					refreshControl={this.handleRefresh(isPaginated)}
					onEndReached={isPaginated && this.loadNextPage}
					ListHeaderComponentStyle={{}}
					ListFooterComponent={isPaginated && this.renderNextLoader()}
					ListEmptyComponent={this.renderNoOrders()}
					onEndReachedThreshold={0.3}
					data={orders}
					renderItem={({ item }) => (
						<OrderItem
							key={item.id.toString()}
							currency={'L'}
							loading={loadingReOrderId === item.id}
							onPress={() => {
								this.setState(
									{
										selectedOrder: item,
									},
									() => {
										this.detailsModal.open();
									}
								);
							}}
							onReOrder={() => this.reorder(item)}
							order={item}
						/>
					)}
				/>
			</View>
		);
	};

	_refresh = async (isPaginated) => {
		if (isPaginated) {
			await this.setState({ page: 1 });
			this.getOrders(IS_REFRESHING).then();
		} else {
			this.getProcessingOrders(IS_REFRESHING_PROCESSING);
		}
	};

	handleRefresh = (isPaginated) => {
		return (
			<RefreshControl
				refreshing={this.state[IS_REFRESHING] || this.state[IS_REFRESHING_PROCESSING]}
				tintColor={Theme.colors.primary}
				onRefresh={() => this._refresh(isPaginated)}
			/>
		);
	};

	_handleIndexChange = (index) => {
		this.setState({ index });
	};

	_renderTabs = (props) => {
		const tab = this.state.tabs[this.state.index];

		if (tab) {
			return (
				<TabBar
					{...props}
					scrollEnabled={true}
					style={{ backgroundColor: Theme.colors.background }}
					tabStyle={{ width: windowWidth / 2 }}
					indicatorStyle={{ backgroundColor: tab.color }}
					renderLabel={({ route, focused }) => (
						<AppText
							style={{
								color: focused ? route.color : Theme.colors.disabled,
								fontFamily: 'SanFranciscoDisplay-Bold',
							}}
						>
							{route.title}
						</AppText>
					)}
				/>
			);
		}
		return null;
	};

	render() {
		const isLoading = this.state[IS_LOADING] || this.state[IS_LOADING_PROCESSING];

		if (isLoading) {
			return <BlockSpinner />;
		}

		const { index, tabs } = this.state;

		return (
			<TabView
				navigationState={{ index, routes: tabs }}
				swipeEnabled={true}
				initialLayout={initialLayout}
				lazy={true}
				removeClippedSubviews={!!Config.isAndroid}
				renderScene={({ route }) => this.renderOrders(route.id)}
				renderTabBar={this._renderTabs}
				onIndexChange={this._handleIndexChange}
			/>
		);
	}
}

const mapStateToProps = ({ app, shop }) => ({
	isLoggedIn: app.isLoggedIn,
	shopRestaurant: shop.restaurant,
});

export default connect(mapStateToProps, {
	reOrder,
	setCutlery,
})(withNavigation(OrdersScreen));
