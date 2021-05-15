import { StyleSheet } from 'react-native';
import Theme from '../../../theme';

const itemHeight = 150;
const itemRadius = 5;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
		backgroundColor: Theme.colors.white,
		borderRadius: itemRadius,
	},
	image: {
		height: itemHeight,
		borderRadius: itemRadius,
	},
	content: {
		position: 'absolute',
		height: itemHeight,
		borderRadius: itemRadius,
		width: '100%',
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: 'rgba(0, 0, 0, 0.45)',
	},
	category: {
		position: 'absolute',
		top: 10,
		left: 20,
		color: Theme.colors.white,
		textTransform: 'uppercase',
		fontSize: 12,
		fontFamily: 'SanFranciscoDisplay-Light',
	},
	title: {
		position: 'absolute',
		top: 60,
		left: 20,
		fontSize: 20,
		color: Theme.colors.white,
	},
	date: {
		position: 'absolute',
		bottom: 10,
		left: 20,
		color: Theme.colors.white,
		textTransform: 'uppercase',
		fontSize: 12,
		fontFamily: 'SanFranciscoDisplay-Light',
	},
	rowFlex: {
		flexDirection: 'row',
		paddingVertical: 5,
	},
	hr: {
		borderBottomWidth: 1,
		borderBottomColor: Theme.colors.backgroundTransparent5,
		marginVertical: 5,
	},
	categoryDetails: {
		flex: 1,
		color: Theme.colors.placeholder,
		textTransform: 'uppercase',
	},
	dateDetails: {
		color: Theme.colors.cyan2,
		textTransform: 'uppercase',
	},
	titleDetails: {
		fontSize: 25,
		fontFamily: 'SanFranciscoDisplay-Bold',
	},
	author: {
		// textAlign: 'right',
		color: Theme.colors.placeholder,
		textTransform: 'uppercase',
		fontSize: 12,
	},
});
export default styles;
