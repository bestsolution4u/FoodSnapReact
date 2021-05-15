import { Dimensions, StyleSheet } from 'react-native';
import Theme from '../../../../theme';

const { width } = Dimensions.get('window');

const cartStyles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	topContainer: {
		flex: 0.92,
	},
	bottomContainer: {
		flex: 0.08,
		flexDirection: 'row',
		backgroundColor: Theme.colors.cyan2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	foodContainer: {
		backgroundColor: Theme.colors.white,
		paddingHorizontal: 15,
		paddingVertical: 4,
	},
	profileContainer: {
		flexDirection: 'row',
		backgroundColor: Theme.colors.white,
		paddingHorizontal: 15,
		paddingVertical: 15,
	},
	profileImageContainer: {
		backgroundColor: '#F4F4F4',
		borderRadius: 4,
		width: 70,
		height: 50,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 20,
	},
	profileImage: {
		width: 50,
		height: 50,
		resizeMode: 'contain',
	},
	infoContainer: {
		flex: 1,
		justifyContent: 'space-around',
		paddingVertical: 4,
	},
	nameText: {
		color: Theme.colors.cyan3,
		fontFamily: 'SanFranciscoDisplay-Medium',
		fontSize: 17,
	},
	deliveryTimeText: {
		color: Theme.colors.gray4,
		fontFamily: 'SanFranciscoDisplay-Medium',
		fontSize: 14,
	},
	nrContainer: {
		flex: 1,
		flexDirection: 'row',
		margin: 5,
		padding: 5,
		borderTopLeftRadius: 5,
		borderTopRightRadius: 5,
		borderBottomLeftRadius: 5,
		borderBottomRightRadius: 5,
		borderWidth: 2,
		borderColor: Theme.colors.cyan2,
	},
	nr: {
		flex: 1,
		justifyContent: 'center',
		borderRightWidth: 2,
		borderRightColor: Theme.colors.cyan2,
	},
	titleContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
	},
	priceContainer: {
		flex: 1,
		flexDirection: 'row',
		marginVertical: 5,
	},
	titleText: {
		color: Theme.colors.black,
		fontFamily: 'SanFranciscoDisplay-Medium',
		fontSize: 16,
	},
	instructionsText: {
		color: Theme.colors.gray3,
		fontSize: 13,
	},
	optionText: {
		color: Theme.colors.black,
		fontFamily: 'SanFranciscoDisplay-Medium',
		fontSize: 12,
	},
	priceText: {
		color: Theme.colors.cyan2,
		fontFamily: 'SanFranciscoDisplay-Semibold',
		fontSize: 15,
		textAlign: 'right',
	},
	nrText: {
		color: Theme.colors.cyan2,
		fontFamily: 'SanFranciscoDisplay-Semibold',
		fontSize: 15,
		textAlign: 'center',
	},
	footerText: {
		paddingLeft: 10,
		color: Theme.colors.white,
		fontFamily: 'SanFranciscoDisplay-Semibold',
		fontSize: 15,
	},
	footerTextAmount: {
		paddingLeft: 25,
		color: Theme.colors.white,
		fontFamily: 'SanFranciscoDisplay-Semibold',
		fontSize: 15,
	},
	footerImage: {
		width: 15,
		height: 15,
		resizeMode: 'contain',
	},
	////////////////////////////////////////////
	favoriteContainer: {
		paddingVertical: 10,
		paddingHorizontal: 10,
		backgroundColor: Theme.colors.light,
		marginLeft: 15,
		alignItems: 'center',
		// width: width - 70,
		padding: 8,
		//paddingBottom: ,
		marginBottom: 15,
		borderRadius: 5,
		flexDirection: 'row',
	},
	favoriteTop: {
		flex: 2,
		marginRight: 30,
		// borderBottomWidth: 1,
		// borderBottomColor: Theme.colors.listBorderColor,
	},
	favoriteBottom: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		alignContent: 'center',
	},
	favoriteMainTitle: {
		padding: 10,
		marginLeft: 5,
		paddingTop: 10,
		color: Theme.colors.black,
		fontWeight: 'bold',
		fontSize: 14,
	},
	favoriteTitle: {
		textAlign: 'left',
		paddingLeft: 10,
		color: Theme.colors.black,
		fontFamily: 'SanFranciscoDisplay-Regular',
		fontSize: 14,
		maxWidth: width * 0.7 - (30 + 10 + 40 + 10 + 17),
	},
	favoritePrice: {
		paddingLeft: 10,
		color: Theme.colors.cyan2,
		fontFamily: 'SanFranciscoDisplay-Regular',
		fontSize: 13,
		textAlign: 'right',
	},
	////////////////////////////////////////////
	tariffContainer: {
		backgroundColor: Theme.colors.white,
		padding: 5,
		paddingTop: 10,
		paddingRight: 15,
	},
	tariffRow: {
		flexDirection: 'row',
		paddingVertical: 5,
	},
	leftRow: {
		flex: 4,
	},
	rightRow: {
		flex: 1,
	},
	rightRowText: {
		paddingLeft: 10,
		color: Theme.colors.black,
		fontFamily: 'SanFranciscoDisplay-Medium',
		fontSize: 16,
		textAlign: 'right',
	},
	leftRowText: {
		paddingLeft: 10,
		color: Theme.colors.black,
		fontFamily: 'SanFranciscoDisplay-Medium',
		fontSize: 16,
		textAlign: 'left',
	},
	bottomContainerButton: {
		backgroundColor: 'transparent',
		margin: 10,
		marginHorizontal: 15,
		padding: 7,
		paddingRight: 2,
		paddingLeft: 2,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
		borderWidth: 1,
		borderColor: Theme.colors.danger,
	},
	bottomContainerButtonText: {
		fontFamily: 'SanFranciscoDisplay-Medium',
		color: Theme.colors.danger,
		fontSize: 15,
		textAlign: 'center',
	},

	changeOrderTopContainerText: {
		fontFamily: 'SanFranciscoDisplay-Medium',
		color: Theme.colors.gray4,
		fontSize: 14,
		flex: 7,
		textAlign: 'left',
	},
	changeOrderTopContainerMenu: {
		fontFamily: 'SanFranciscoDisplay-Medium',
		color: Theme.colors.cyan1,
		fontSize: 13,
		textAlign: 'right',
	},

	orderTopContainer: {
		flex: 3,
		backgroundColor: 'transparent',
		margin: 10,
		marginHorizontal: 15,
		padding: 4,
		paddingRight: 8,
		paddingLeft: 8,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
		borderWidth: 1,
		borderColor: Theme.colors.cyan1,
	},

	priceStyle: {
		color: '#979797',
		fontSize: 14,
		paddingLeft: 10,
	},
	couponContainer: {
		backgroundColor: Theme.colors.white,
		paddingHorizontal: 15,
	},
	couponTitle: {
		marginVertical: 5,
		fontSize: 14,
		fontWeight: 'bold',
	},
});
export default cartStyles;
