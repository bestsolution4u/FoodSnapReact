import React from 'react';
import { ScrollView, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { LoginManager } from 'react-native-fbsdk';
import { getLanguage, setLanguage, translate } from '../../../common/services/translate';
import Config from '../../../config';
import alerts from '../../../common/services/alerts';
import { openExternalUrl } from '../../../common/services/utility';
import { logout, updateProfileDetails } from '../../../store/actions/auth';
import RouteNames from '../../../routes/names';
import Theme from '../../../theme';
import { CheckboxRow, NavigationRow, RowItem, Switch, TableView, ThemeProvider } from 'react-native-ios-kit';
import FastImage from 'react-native-fast-image';

class ProfileScreen extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			language: 'sq',
			promotions: !!props.user.promotions,
			notifications: !!props.user.notifications,
			blog_notifications: !!props.user['blog_notifications'],
		};
	}

	static navigationOptions = (props) => {
		return {
			title: props.navigation.getParam('customTitle', translate('account.header_title')),
		};
	};

	async componentDidMount(): void {
		const language = getLanguage();
		this.setState({ language });
		this.focusListener = this.props.navigation.addListener('didFocus', () => {
			this._checkLoggedIn();
		});
	}

	componentWillUnmount() {
		this.focusListener.remove();
	}

	_checkLoggedIn = () => {
		const hasVerifiedPhone = this.props.hasVerifiedPhone;
		if (!hasVerifiedPhone) {
			this.props.navigation.replace(RouteNames.PhoneVerificationScreen);
		}
	};

	onProfileDetailsPress = () => {
		this.props.navigation.navigate(RouteNames.ProfileDetailsScreen);
	};

	onAddressesPress = () => {
		this.props.navigation.navigate(RouteNames.AddressesScreen);
	};

	onFavouritesPress = () => {
		this.props.navigation.navigate(RouteNames.FavouritesScreen);
	};

	onBlogPress = () => {
		this.props.navigation.navigate(RouteNames.BlogScreen);
	};

	handleReview = () => {
		Config.isAndroid
			? openExternalUrl(`https://play.google.com/store/apps/details?id=com.snapfood.app&hl=en`)
			: openExternalUrl(`https://itunes.apple.com/al/app/snapfood-food%20delivery/id1314003561?l=en&mt=8`);
	};

	openMerchantRegister = () => {
		openExternalUrl('https://snapfood.al/merchant/');
	};

	openAboutUs = () => {
		openExternalUrl('https://snapfood.al/about');
	};

	logout = () => {
		alerts
			.confirmation(translate('alerts.confirm_logout_title'), translate('alerts.confirm_logout'))
			.then(async () => {
				try {
					LoginManager.logOut();
				} catch (e) {}
				await this.props.logout();
				this.props.navigation.replace(RouteNames.LoginScreen);
			});
	};

	setLang = (language) => {
		this.setState({ language });
		setLanguage(language).then();
		this.props.navigation.setParams({
			customTitle: translate('account.header_title'),
		});
	};

	renderNavigationRow = ({ onPress, image, title }) => {
		return (
			<NavigationRow
				theme={{ primaryColor: Theme.colors.cyan1 }}
				icon={
					image ? (
						<FastImage
							resizeMode={FastImage.resizeMode.contain}
							source={image}
							style={{
								width: 25,
								height: 25,
								resizeMode: 'contain',
							}}
						/>
					) : null
				}
				title={title}
				onPress={onPress}
			/>
		);
	};

	renderSwitch = ({ title, value, image, onChange }) => {
		return (
			<RowItem
				theme={{ primaryColor: Theme.colors.cyan1 }}
				icon={
					<FastImage
						resizeMode={FastImage.resizeMode.contain}
						source={image}
						style={{
							width: 25,
							height: 25,
							resizeMode: 'contain',
						}}
					/>
				}
				title={title}
				renderRight={() => (
					<Switch
						trackColor={{ true: Theme.colors.cyan1 }}
						onTintColor={Theme.colors.cyan1}
						value={value}
						onValueChange={(value) => onChange(value)}
					/>
				)}
			/>
		);
	};

	renderCheckbox = ({ title, value, onPress }) => {
		return <CheckboxRow selected={value} onPress={onPress} title={title} />;
	};

	onSettingUpdate = async (prop, value) => {
		await this.setState({ [prop]: value });
		this.props.updateProfileDetails({
			...this.props.user,
			notifications: this.state.notifications,
			promotions: this.state.promotions,
			blog_notifications: this.state.blog_notifications,
		});
	};

	onPromotionsPress = () => {
		this.props.navigation.navigate(RouteNames.PromotionsScreen);
	};

	render() {
		const { promotions, notifications, blog_notifications, language } = this.state;

		return (
			<ScrollView>
				<View>
					<ThemeProvider>
						<TableView withoutHeader={true} withoutFooter={true}>
							{this.renderNavigationRow({
								title: translate('account.account_details'),
								image: require('../../../common/assets/images/account/llogaria-juaj.png'),
								onPress: this.onProfileDetailsPress,
							})}
							{this.renderNavigationRow({
								title: translate('account.promotions_menu'),
								image: require('../../../common/assets/images/promo.png'),
								onPress: this.onPromotionsPress,
							})}
							{this.renderNavigationRow({
								title: translate('account.addresses'),
								image: require('../../../common/assets/images/account/adresat.png'),
								onPress: this.onAddressesPress,
							})}
							{this.renderNavigationRow({
								title: translate('account.preferred'),
								image: require('../../../common/assets/images/account/të-preferuarat.png'),
								onPress: this.onFavouritesPress,
							})}
						</TableView>
					</ThemeProvider>
				</View>
				<View>
					<ThemeProvider>
						<TableView withoutFooter={true} header={translate('account.manage_notifications')}>
							{this.renderSwitch({
								image: require('../../../common/assets/images/promo.png'),
								title: translate('account.promotions'),
								value: promotions,
								onChange: (value) => this.onSettingUpdate('promotions', value),
							})}
							{this.renderSwitch({
								image: require('../../../common/assets/images/noti.png'),
								title: translate('account.delivery'),
								value: notifications,
								onChange: (value) => this.onSettingUpdate('notifications', value),
							})}
							{this.renderSwitch({
								image: require('../../../common/assets/images/blog-setting.png'),
								title: translate('account.blog'),
								value: blog_notifications,
								onChange: (value) => this.onSettingUpdate('blog_notifications', value),
							})}
						</TableView>
					</ThemeProvider>
				</View>
				<View>
					<ThemeProvider>
						<TableView withoutFooter={true} header={translate('account.manage_socials')}>
							{this.renderNavigationRow({
								title: translate('account.blog_menu'),
								image: require('../../../common/assets/images/blog.png'),
								onPress: this.onBlogPress,
							})}
						</TableView>
					</ThemeProvider>
				</View>
				<View>
					<ThemeProvider>
						<TableView header={translate('account.lang_label')}>
							{this.renderCheckbox({
								title: translate('account.albanian'),
								value: language === 'sq',
								onPress: () => this.setLang('sq'),
							})}
							{this.renderCheckbox({
								title: translate('account.english'),
								value: language === 'en',
								onPress: () => this.setLang('en'),
							})}
						</TableView>
					</ThemeProvider>
				</View>
				<View>
					<ThemeProvider>
						<TableView withoutHeader={true} withoutFooter={true}>
							{this.renderNavigationRow({
								title: translate('account.rate_app'),
								onPress: this.handleReview,
							})}
							{this.renderNavigationRow({
								title: translate('account.become_a_partner'),
								onPress: this.openMerchantRegister,
							})}
							{this.renderNavigationRow({
								title: translate('account.about'),
								onPress: this.openAboutUs,
							})}
							{this.renderNavigationRow({
								title: translate('account.logout'),
								image: require('../../../common/assets/images/account/dilni.png'),
								onPress: this.logout,
							})}
						</TableView>
					</ThemeProvider>
				</View>
			</ScrollView>
		);
	}
}

const mapStateToProps = ({ app }) => {
	return {
		user: app.user,
		hasVerifiedPhone: app.hasVerifiedPhone,
	};
};

export default connect(mapStateToProps, {
	logout,
	updateProfileDetails,
})(withNavigation(ProfileScreen));
