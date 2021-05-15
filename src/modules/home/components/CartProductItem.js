import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import styles from '../screens/styles/cart';
import AppText from '../../../common/components/AppText';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import { formatPrice } from '../../../common/services/utility';

const CartProductItem = ({ product, increment, decrement, calculateProductPrice, discount, currency = 'L' }) => {
	const isSameProduct = discount && discount.product && discount.product.id === product.product.id;

	const customStyles = {};

	if (isSameProduct) {
		customStyles.textDecorationLine = 'line-through';
		customStyles.color = Theme.colors.danger;
	}

	return (
		<View style={styles.foodContainer}>
			<View style={styles.titleContainer}>
				<View style={{ flex: 4 }}>
					<AppText style={[styles.titleText]}>{product.product.title}</AppText>
					{!!product.item_instructions && (
						<View>
							<AppText
								style={[
									styles.instructionsText,
									{
										fontFamily: 'SanFranciscoDisplay-Medium',
									},
								]}
							>
								<AppText
									style={[
										styles.instructionsText,
										{
											fontFamily: 'SanFranciscoDisplay-Semibold',
										},
									]}
								>
									{translate('restaurant_details.instructionsTitle')}
								</AppText>
								: {`"${product.item_instructions}"`}
							</AppText>
						</View>
					)}
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<TouchableOpacity onPress={() => decrement(product)}>
						<FastImage
							source={require('../../../common/assets/images/minus-grey-250.png')}
							style={{
								width: 25,
								height: 25,
								paddingHorizontal: 10,
							}}
						/>
					</TouchableOpacity>
					<AppText style={{ fontSize: 16, paddingHorizontal: 10 }}>
						{discount && discount.product && discount.product.id === product.product.id
							? discount.value + product.quantity
							: product.quantity}
					</AppText>
					<TouchableOpacity onPress={() => increment(product)}>
						<FastImage
							source={require('../../../common/assets/images/plus-grey-250.png')}
							style={{
								width: 25,
								height: 25,
								paddingLeft: 10,
							}}
						/>
					</TouchableOpacity>
				</View>
			</View>
			<View style={styles.priceContainer}>
				<AppText style={{ color: Theme.colors.gray3, flex: 1 }}>
					{formatPrice(product.product.price) + ` ${currency}`}
				</AppText>
				<AppText style={[styles.priceText, customStyles]}>{calculateProductPrice(product)}</AppText>
				{isSameProduct && (
					<AppText style={styles.priceText}>
						{` ${formatPrice(product.quantity * product.product.price)} ${currency}`}
					</AppText>
				)}
			</View>
		</View>
	);
};

export default CartProductItem;
