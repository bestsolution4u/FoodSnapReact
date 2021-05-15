import React, { useState, useEffect, useRef } from 'react';
import {
	Text,
	View,
	StyleSheet,
	Platform,
	TextInput,
	TouchableOpacity,
	FlatList,
	Animated,
	Keyboard,
} from 'react-native';

import FontelloIcon from './FontelloIcon';
import { translate } from '../services/translate';

const isiOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

const RestaurantSearchModal = ({ onDismiss, items, onItemPressed = () => {}, style = {}, top }) => {
	const [listItems, setListItems] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const textInput = useRef(null);
	const modalTop = useRef(new Animated.Value(0)).current;
	const [keyboardHeight, setKeyboardHeight] = useState(0);

	useEffect(() => {
		Keyboard.addListener('keyboardDidShow', onKeyboardDidShow);
		Keyboard.addListener('keyboardDidHide', onKeyboardDidHide);
		textInput.current && textInput.current.focus();
		Animated.timing(modalTop, {
			toValue: top,
			duration: 300,
		}).start();
		return () => {
			Keyboard.removeListener('keyboardDidShow', onKeyboardDidShow);
			Keyboard.removeListener('keyboardDidHide', onKeyboardDidHide);
		};
	}, []);

	function onKeyboardDidShow(e) {
		console.log('K E Y B O A R D: ', e);
		setKeyboardHeight(e.endCoordinates.height);
	}

	function onKeyboardDidHide() {
		setKeyboardHeight(0);
	}

	useEffect(() => {
		const searchResults = getSearchResults(searchTerm);
		setListItems(searchResults);
	}, [searchTerm]);

	const getSearchResults = () => {
		if ((searchTerm === '') | (searchTerm.length < 1)) {
			return [];
		}
		return items.filter(function filterItems({ title }) {
			let formattedTitle = title
				.replace(/ë/g, 'e')
				.replace(/ç/g, 'c')
				.toLowerCase()
				.replace(/[&\/\\#,+()$~%.'":*?;’!<>]/g, '');
			return formattedTitle.includes(searchTerm.trim().toLowerCase());
		});
	};

	const renderListItem = (product) => {
		const { id, price, categoryName, title, available } = product;
		return (
			<TouchableOpacity
				activeOpacity={1}
				onPress={() => {
					onItemPressed(product);
					onDismiss();
				}}
				key={id}
				style={[
					styles.listItem,
					available === 0 && {
						backgroundColor: '#ededed',
					},
				]}
			>
				<Text style={styles.listItemCategory}>{categoryName}</Text>
				<Text style={styles.listItemName}>{title}</Text>
				<Text style={styles.listItemPrice}>{`${price} L`}</Text>
				<View style={styles.listItemSeparator} />
			</TouchableOpacity>
		);
	};

	return (
		<Animated.View style={[styles.modal, { top: modalTop }]}>
			<View style={{ width: '100%', overflow: 'hidden', paddingBottom: 5, zIndex: 2 }}>
				<View
					style={[
						styles.searchContainer,
						isiOS && styles.searchContainerIos,
						isAndroid && styles.searchContainerAndroid,
					]}
				>
					<View style={styles.search}>
						<FontelloIcon icon='search' size={14} color='rgb(122,118,122)' />
					</View>
					<View style={styles.inputContainer}>
						<TextInput
							value={searchTerm}
							ref={textInput}
							onChangeText={(text) => {
								setSearchTerm(text);
							}}
							placeholder={translate('search.searchMenu')}
							style={styles.input}
						/>
						{searchTerm.length > 0 && (
							<TouchableOpacity
								activeOpacity={0.7}
								onPress={() => {
									setSearchTerm('');
								}}
								style={styles.closeX}
							>
								<FontelloIcon icon='cancel-circled-outline' size={18} color='rgba(122,118,122,0.8)' />
							</TouchableOpacity>
						)}
					</View>

					<View style={styles.separator} />
					<TouchableOpacity activeOpacity={0.7} onPress={onDismiss} style={styles.cancelBtn}>
						<Text style={styles.cancel}>{translate('search.cancel')}</Text>
					</TouchableOpacity>
				</View>
			</View>
			<FlatList
				keyboardShouldPersistTaps={'always'}
				bounces={false}
				style={[styles.list, { marginBottom: keyboardHeight }]}
				data={listItems}
				renderItem={(item, index) => renderListItem(item.item)}
			/>
			{/* <View style={{ width: '100%', height: 50, backgroundColor: 'white', marginTop: -5 }} /> */}
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	modal: {
		position: 'absolute',
		alignItems: 'center',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: '#00000050',
		zIndex: 1000,
	},
	searchContainer: {
		paddingVertical: 4,
		backgroundColor: 'white',
		flexDirection: 'row',
		elevation: 5,
	},
	searchContainerIos: {
		shadowColor: '#000',
		shadowRadius: 3,
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 1 },
	},
	searchContainerAndroid: {
		elevation: 1,
	},
	inputContainer: {
		height: 40,
		flex: 7,
	},
	input: {
		flex: 1,
		fontSize: 15,
		fontWeight: '600',
	},
	search: {
		flex: 1,
		paddingTop: 2,
		justifyContent: 'center',
		alignItems: 'center',
	},
	closeX: {
		position: 'absolute',
		top: 0,
		justifyContent: 'center',
		right: 10,
		bottom: 0,
	},
	separator: {
		width: 0.5,
		height: '100%',
		backgroundColor: 'rgba(122,118,122,0.5)',
	},
	cancelBtn: {
		flex: 2,
		justifyContent: 'center',
		alignItems: 'center',
	},
	cancel: {
		color: 'rgb(122,118,122)',
		fontSize: 11,
		fontWeight: '600',
		textAlign: 'center',
	},
	listItem: {
		width: '100%',
		backgroundColor: 'white',
		paddingLeft: 8,
		paddingVertical: 20,
	},
	listItemCategory: {
		fontSize: 18,
		marginBottom: 20,
		alignSelf: 'stretch',
		fontWeight: '600',
		color: '#000',
		textAlign: 'left',
	},
	listItemName: {
		fontSize: 15,
		fontWeight: '600',
		justifyContent: 'center',
		marginBottom: 10,
		color: 'rgb(71,74,75)',
	},
	listItemPrice: {
		fontSize: 14,
		color: 'rgb(71,74,75)',
	},
	list: {
		marginTop: -5,
		width: '100%',
	},
	listItemSeparator: {
		height: 0.5,
		backgroundColor: 'rgba(122,118,122,0.5)',
		position: 'absolute',
		bottom: 0,
		left: 10,
		right: 10,
	},
});

export default RestaurantSearchModal;

//ON SEARCH, set the other scrollview scrollable false
//KEEP KEYBOARD OPENED?
