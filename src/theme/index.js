import { getStatusBarHeight } from 'react-native-status-bar-height';
import Config from '../config';

const Theme = {};
// ------------------------------------------------------------
// Sizing
// ------------------------------------------------------------
Theme.sizes = {
	xsTiny: 4,
	xTiny: 8,
	tiny: 12,
	small: 16,
	normal: 20,
	base: 24,
	large: 48,
	xLarge: 64,
};

Theme.icons = {
	tiny: 10,
	small: 20,
	headerIcon: 24,
	base: 30,
	large: 40,
	xLarge: 50,
};

// ------------------------------------------------------------
// Specifications
//
Theme.specifications = {
	statusBarHeight: Config.isAndroid ? 5 : getStatusBarHeight(),
	headerHeight: 40,
};

// ------------------------------------------------------------
// Colors
//
Theme.colors = {
	transparent: 'transparent',
	background: '#FAFAFA',
	darkerBackground: '#ededed',
	greyBackground: '#f5f5f5',
	text: '#232323',
	placeholder: '#595959',
	whitePrimary: '#FFFFFF',
	blackPrimary: '#000000',
	disabled: '#C9D6DF',
	blackTransparent6: 'rgba(0, 0, 0, 0.6)',
	backgroundTransparent3: 'rgba(225, 225, 225, 0.3)',
	backgroundTransparent4: 'rgba(225, 225, 225, 0.4)',
	backgroundTransparent5: 'rgba(225, 225, 225, 0.5)',
	backgroundTransparent6: 'rgba(225, 225, 225, 0.6)',
	backgroundTransparent7: 'rgba(225, 225, 225, 0.7)',
	backgroundTransparent8: 'rgba(225, 225, 225, 0.8)',
	primaryTransparent8: 'rgba(34, 173, 196, 0.8);',
	inactiveTintColor: '#373A3F',
	backgroundColor: '#f2f7f9',
	listBorderColor: '#d3e0e5',
	primary: '#22adc4',
	secondary: '#32db64',
	danger: '#f53d3d',
	light: '#f4f4f4',
	dark: '#222',
	black: '#000',
	white: '#fff',
	gray1: '#454b4c',
	gray2: '#707a7c',
	gray3: '#8c9799',
	gray4: '#737373',
	cyan1: '#21adc4',
	cyan2: '#23cbd8',
	cyan3: '#23dee2',
	alertError: '#cc1c4e',
	alertSuccess: '#1dd890',
	alertWarning: '#f4e637',
	warning: '#f4be38',
	alertInfo: '#109df7',
	alertNeutral: '#7850dd',
	socialFacebook: '#3b5998',
	socialTwitter: '#00aced',
};

Theme.styles = {
	container: {
		flex: 1,
		marginTop: Theme.specifications.statusBarHeight,
		backgroundColor: '#fff',
	},
	appText: {
		fontFamily: 'SanFranciscoDisplay-Medium',
	},
	background: {
		width: '100%',
		height: '100%',
	},
	top: {
		flex: 5,
		justifyContent: 'center',
		alignItems: 'center',
	},
	title: {
		margin: 10,
		fontFamily: 'SanFranciscoDisplay-Bold',
		color: Theme.colors.white,
		fontSize: 20,
		textAlign: 'center',
	},
	description: {
		fontFamily: 'SanFranciscoDisplay-Medium',
		color: Theme.colors.black,
		fontSize: 20,
	},
	locationTitle: {
		margin: 10,
		fontFamily: 'SanFranciscoDisplay-Bold',
		color: Theme.colors.black,
		fontSize: 20,
		textAlign: 'center',
	},
	locationDescription: {
		marginLeft: 10,
		marginRight: 10,
		fontFamily: 'SanFranciscoDisplay-Medium',
		color: Theme.colors.gray1,
		fontSize: 15,
		textAlign: 'center',
	},
	logo: {
		width: 140,
		height: 100,
		resizeMode: 'contain',
	},
	location: {
		width: 180,
		height: 150,
		resizeMode: 'contain',
	},
	bottom: {
		flex: 1,
	},
	button: {
		backgroundColor: Theme.colors.cyan2,
		margin: 30,
		padding: 10,
		justifyContent: 'center',
		alignItems: 'center',
		borderTopLeftRadius: 3,
		borderTopRightRadius: 3,
		borderBottomLeftRadius: 3,
		borderBottomRightRadius: 3,
	},
	disabledButton: {
		opacity: 0.5,
	},
	buttonText: {
		fontFamily: 'SanFranciscoDisplay-Medium',
		color: Theme.colors.white,
		fontSize: 18,
	},
	alert: {
		fontFamily: 'SanFranciscoDisplay-Regular',
		fontSize: Theme.sizes.normal,
		lineHeight: Theme.sizes.normal,
		marginRight: Theme.sizes.small,
		color: Theme.colors.whitePrimary,
	},
	headerTitle: {
		color: '#000',
		fontFamily: 'SanFranciscoDisplay-Medium',
		fontSize: 18,
		textAlign: 'center',
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
	},
	noData: {
		imageContainer: {
			justifyContent: 'center',
			alignItems: 'center',
		},
		noImage: {
			width: 200,
			height: 180,
		},
		noTitle: {
			color: Theme.colors.black,
			fontFamily: 'SanFranciscoDisplay-Bold',
			fontSize: 19,
			padding: 10,
			textAlign: 'center',
		},
		noDescription: {
			color: Theme.colors.gray1,
			fontFamily: 'SanFranciscoDisplay-Medium',
			fontSize: 16,
			paddingTop: 0,
			padding: 10,
			textAlign: 'center',
		},
		button: {
			backgroundColor: Theme.colors.cyan2,
			marginTop: 30,
			margin: 10,
			marginHorizontal: 30,
			marginBottom: 0,
			padding: 10,
			justifyContent: 'center',
			alignItems: 'center',
			borderTopLeftRadius: 100,
			borderTopRightRadius: 100,
			borderBottomLeftRadius: 100,
			borderBottomRightRadius: 100,
		},
		buttonText: {
			fontFamily: 'SanFranciscoDisplay-Medium',
			color: Theme.colors.white,
			fontSize: 18,
			textAlign: 'center',
		},
	},
};

export default Theme;
