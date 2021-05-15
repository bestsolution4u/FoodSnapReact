import React from 'react';
import {
	ActivityIndicator,
	Dimensions,
	FlatList,
	RefreshControl,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { connect } from 'react-redux';
import { appMoment, translate } from '../../../common/services/translate';
import BlockSpinner from '../../../common/components/BlockSpinner';
import { TabBar, TabView } from 'react-native-tab-view';
import Config from '../../../config';
import Theme from '../../../theme';
import AppText from '../../../common/components/AppText';
import RouteNames from '../../../routes/names';
import FastImage from 'react-native-fast-image';
import PromotionDetailsModal from '../components/PromotionDetailsModal';
import apiFactory from '../../../common/services/apiFactory';

const IS_LOADING = 'isLoading';
const IS_REFRESHING = 'isRefreshing';
const IS_LOADING_NEXT = 'isLoadingNextPage';
const IS_LOADING_ACTIVE = 'isLoadingActive';
const IS_REFRESHING_ACTIVE = 'isRefreshingActive';

const windowWidth = Dimensions.get('window').width;

const initialLayout = {
	height: 0,
	width: windowWidth,
};

const getTabs = () => {
	return [
		{
			id: 0,
			key: 'processing',
			title: translate('promotions.active_tab'),
			color: Theme.colors.primary,
		},
		{
			id: 1,
			key: 'completed',
			title: translate('promotions.history_tab'),
			color: Theme.colors.primary,
		},
	];
};

class PromotionsScreen extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			[IS_LOADING]: false,
			[IS_REFRESHING]: false,
			[IS_LOADING_NEXT]: false,
			[IS_LOADING_ACTIVE]: false,
			[IS_REFRESHING_ACTIVE]: false,
			promotions: [],
			activePromotions: [],
			selectedPromotion: {},
			index: 0,
			page: 1,
			tabs: getTabs(),
		};
	}

	static navigationOptions = () => {
		return {
			title: translate('account.promotions_menu'),
		};
	};

	componentDidMount(): void {
		this.getActivePromotions().then();
		this.getPromotions().then();
		this.focusListener = this.props.navigation.addListener('didFocus', () => {
			if (this.props.isLoggedIn) {
				this.setState({
					tabs: getTabs(),
				});
			} else {
				this.props.navigation.navigate(RouteNames.ProfileStack);
			}
		});
	}

	componentWillUnmount(): void {
		this.focusListener.remove();
	}

	getActivePromotions = async (prop = IS_LOADING_ACTIVE) => {
		await this.setState({ [prop]: true });
		apiFactory.get('/promotions/active').then(
			async ({ data }) => {
				const { promotions } = data;
				await this.setState({
					activePromotions: promotions,
					[prop]: false,
				});
			},
			() => {
				this.setState({ [prop]: false });
			}
		);
	};

	getPromotions = async (prop = IS_LOADING) => {
		await this.setState({ [prop]: true });
		apiFactory.get('/promotions/used').then(
			async ({ data }) => {
				const promotions = data.data;
				await this.setState({
					promotions,
					[prop]: false,
				});
			},
			() => {
				this.setState({ [prop]: false });
			}
		);
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

	renderNoData = () => {
		return (
			<View style={{ marginTop: 50, marginBottom: 300 }}>
				<View style={Theme.styles.noData.imageContainer}>
					<FastImage
						resizeMode={FastImage.resizeMode.contain}
						source={require('../../../common/assets/images/nopromo.png')}
						style={Theme.styles.noData.noImage}
					/>
				</View>
				<AppText style={Theme.styles.noData.noTitle}>{translate('promotions.no_promotions')}</AppText>
				<AppText style={Theme.styles.noData.noDescription}>
					{translate('promotions.no_promotions_message')}
				</AppText>
			</View>
		);
	};

	_refresh = async (isPaginated) => {
		if (isPaginated) {
			await this.setState({ page: 1 });
			this.getPromotions(IS_REFRESHING).then();
		} else {
			this.getActivePromotions(IS_REFRESHING_ACTIVE).then();
		}
	};

	handleRefresh = (isPaginated) => {
		return (
			<RefreshControl
				refreshing={this.state[IS_REFRESHING] || this.state[IS_REFRESHING_ACTIVE]}
				tintColor={Theme.colors.primary}
				onRefresh={() => this._refresh(isPaginated)}
			/>
		);
	};

	renderNextLoader = () => {
		if (this.state[IS_LOADING_NEXT]) {
			return <ActivityIndicator size={Theme.sizes.xLarge} color={Theme.colors.primary} />;
		}
		return null;
	};

	onPromotionPress = async (selectedPromotion) => {
		await this.setState({ selectedPromotion });
		this.detailsModal.open();
	};

	renderPromotionItem = (item) => {
		return (
			<View key={item.id} style={styles.container}>
				<AppText style={styles.title} numberOfLines={1} ellipsizeMode={'tail'}>
					{item.title}
				</AppText>
				<AppText style={styles.description} numberOfLines={2} ellipsizeMode={'tail'}>
					{item.description}
				</AppText>
				<View style={styles.footerContainer}>
					<AppText style={styles.date}>
						{translate('promotions.expires_at', {
							date: appMoment(item['end_time']).format('DD MMMM YYYY'),
						})}
					</AppText>
					<TouchableOpacity onPress={() => this.onPromotionPress(item)} style={styles.action}>
						<AppText style={styles.actionText}>{translate('promotions.details')}</AppText>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	renderDetailsModal = () => {
		const { index, selectedPromotion } = this.state;
		return (
			<PromotionDetailsModal
				setRef={(ref) => (this.detailsModal = ref)}
				onClose={() => this.setState({ selectedPromotion: {} })}
				promotion={selectedPromotion}
				isActive={index === 0}
			/>
		);
	};

	renderContent = (tabIndex) => {
		let promotions;
		let isPaginated = true;
		if (tabIndex === 0) {
			promotions = this.state.activePromotions;
			isPaginated = false;
		} else {
			promotions = this.state.promotions;
		}

		return (
			<View style={{ marginTop: 20 }}>
				{this.renderDetailsModal()}
				<FlatList
					ref={(ref) => (this.flatListRef = ref)}
					keyExtractor={(item) => item.id.toString()}
					refreshControl={this.handleRefresh(isPaginated)}
					onEndReached={isPaginated && this.loadNextPage}
					ListHeaderComponentStyle={{}}
					ListFooterComponent={isPaginated && this.renderNextLoader()}
					ListEmptyComponent={this.renderNoData()}
					onEndReachedThreshold={0.3}
					data={promotions}
					renderItem={({ item }) => this.renderPromotionItem(item)}
				/>
			</View>
		);
	};

	_handleIndexChange = (index) => {
		this.setState({ index });
	};

	render() {
		const isLoading = this.state[IS_LOADING] || this.state[IS_LOADING_ACTIVE];

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
				renderScene={({ route }) => this.renderContent(route.id)}
				renderTabBar={this._renderTabs}
				onIndexChange={this._handleIndexChange}
			/>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 15,
		paddingLeft: 20,
		paddingRight: 15,
		paddingBottom: 10,
		marginBottom: 10,
		marginHorizontal: 20,
		backgroundColor: Theme.colors.white,
		borderRadius: 5,
		borderWidth: 1,
		borderColor: Theme.colors.backgroundTransparent8,
	},
	title: {
		fontSize: 14,
		color: Theme.colors.gray2,
	},
	description: {
		marginVertical: 5,
		fontSize: 17,
		fontFamily: 'SanFranciscoDisplay-Bold',
	},
	footerContainer: {
		flexDirection: 'row',
		marginTop: 10,
	},
	date: {
		flex: 1,
		fontSize: 14,
		color: Theme.colors.gray2,
		alignContent: 'center',
		alignSelf: 'center',
		justifyContent: 'center',
	},
	action: {
		backgroundColor: Theme.colors.backgroundTransparent8,
		borderRadius: 5,
		paddingHorizontal: 10,
		paddingVertical: 5,
		alignContent: 'flex-end',
		alignSelf: 'flex-end',
		justifyContent: 'flex-end',
	},
	actionText: {
		fontSize: 13,
	},
});

function mapStateToProps({ app }) {
	return {
		isLoggedIn: app.isLoggedIn,
		safeAreaDims: app.safeAreaDims,
	};
}

export default connect(mapStateToProps, {})(PromotionsScreen);
