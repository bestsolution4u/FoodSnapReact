import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import styles from '../styles/orderItems';
import { withNavigation } from 'react-navigation';
import ElevatedView from 'react-native-elevated-view';
import { connect } from 'react-redux';
import FastImage from 'react-native-fast-image';
import AppText from '../../../common/components/AppText';
import { translate } from '../../../common/services/translate';
import AppLine from '../../../common/components/AppLine';
import Theme from '../../../theme';
import Config from '../../../config';
import {
	formatPrice,
	getOrderDiscountValue,
	getOrderRealDeliveryFee,
	prepareOrderProducts,
} from '../../../common/services/utility';

const statusMap = {
	processing: {
		color: '#21ADC4',
		status: translate('orders.list_status_accepted'),
	},
	new: {
		color: '#B6C0C9',
		status: translate('orders.list_status_pending'),
	},
	declined: {
		color: '#BB3250',
		status: translate('orders.list_status_rejected'),
	},
	delivered: {
		color: '#23B574',
		status: translate('orders.list_status_delivered'),
	},
	picked_up: {
		color: '#23B574',
		status: translate('orders.picked_up'),
	},
	cooked: {
		color: '#23B574',
		status: translate('orders.cooked'),
	},
};

class OrderItem extends React.Component {
	render() {
		const { order, currency, onReOrder, onPress, key, loading } = this.props;

		const products = prepareOrderProducts(order);
		const discountValue = getOrderDiscountValue(order);
		const realDeliveryFee = getOrderRealDeliveryFee(order);

		return (
			<TouchableOpacity onPress={onPress} key={key}>
				<ElevatedView elevation={1} style={styles.itemContainer}>
					<View style={styles.topSection}>
						<View style={styles.topSectionLeft}>
							<View style={{ flex: 2 }}>
								<AppText style={styles.topSectionLeftTitle} numberOfLines={1} ellipsizeMode={'tail'}>
									{order.vendor.title}
								</AppText>
							</View>
						</View>
						<View style={[styles.topSectionRight, { backgroundColor: statusMap[order.status].color }]}>
							<AppText style={styles.topSectionRightText}>{statusMap[order.status].status}</AppText>
						</View>
					</View>
					<View style={styles.middleSection}>
						{products.map((product) => (
							<View style={{ flexDirection: 'row' }} key={product.id}>
								<View style={styles.middleSectionFoodContainer}>
									<AppText style={styles.middleSectionNr}>{product.total_quantity}x</AppText>
									<AppText style={styles.middleSectionFood}> {product.title}</AppText>
								</View>
								<View style={{ flex: 3 }}>
									{!!product.has_discount ? (
										<AppText style={styles.productPrice}>
											<AppText
												style={{
													textDecorationLine: 'line-through',
													color: Theme.colors.danger,
												}}
											>
												{' '}
												{formatPrice(product.price * product.total_quantity)} {currency}
											</AppText>{' '}
											{formatPrice(product.price * product.quantity)} {currency}
										</AppText>
									) : (
										<AppText style={styles.productPrice}>
											{' '}
											{formatPrice(product.price * product.quantity)} {currency}
										</AppText>
									)}
								</View>
							</View>
						))}
						<View style={{ flexDirection: 'row' }}>
							<View style={styles.middleSectionFoodContainer}>
								<AppText style={styles.middleSectionNr} />
								<AppText style={styles.middleSectionFood}>
									{translate('order_details.delivery_fee')}
								</AppText>
							</View>
							<View style={{ flex: 2 }}>
								{realDeliveryFee > 0 ? (
									<AppText style={styles.productPrice}>
										<AppText
											style={{
												textDecorationLine: 'line-through',
												color: Theme.colors.danger,
											}}
										>
											{realDeliveryFee} {currency}
										</AppText>{' '}
										{formatPrice(order.delivery_fee)} {currency}
									</AppText>
								) : (
									<AppText style={styles.productPrice}>
										{formatPrice(order.delivery_fee)} {currency}
									</AppText>
								)}
							</View>
						</View>
						{discountValue > 0 && (
							<View style={{ flexDirection: 'row' }}>
								<View style={styles.middleSectionFoodContainer}>
									<AppText style={styles.middleSectionNr} />
									<AppText style={styles.middleSectionFood}>
										{order.discount
											? order.discount.name
											: order.coupon
											? translate('promotions.coupon_discount', {
													code: order.coupon.code,
											  })
											: ''}
									</AppText>
								</View>
								<View style={{ flex: 2 }}>
									<AppText style={[styles.productPrice, { color: Theme.colors.danger }]}>
										-{formatPrice(discountValue)} {currency}
									</AppText>
								</View>
							</View>
						)}
						<AppLine color={Theme.colors.disabled} />
					</View>
					<View style={{ flex: 1 }}>
						<AppText style={styles.topSectionLeftPrice}>
							{formatPrice(order['total_price'])} {currency}
						</AppText>
					</View>
					<View style={styles.bottomSection}>
						<View style={{ flex: 8, flexDirection: 'row' }}>
							<View style={styles.bottomSectionLeft}>
								<FastImage
									resizeMode={FastImage.resizeMode.contain}
									source={require('../../../common/assets/images/orders/calendar.png')}
									style={styles.bottomSectionIco}
								/>
								<AppText style={styles.bottomSectionText}> {order.created_at.split(' ')[0]}</AppText>
							</View>
							{!!order.address && (
								<View style={styles.bottomSectionMiddle}>
									<FastImage
										resizeMode={FastImage.resizeMode.contain}
										source={require('../../../common/assets/images/orders/location.png')}
										style={styles.bottomSectionIco}
									/>
									<AppText style={styles.bottomSectionText} numberOfLines={1} ellipsizeMode={'tail'}>
										{' '}
										{order.address.street}
									</AppText>
								</View>
							)}
						</View>
						{order.status === 'delivered' && !loading && (
							<View style={{ flex: 1 }}>
								<TouchableOpacity onPress={onReOrder} style={styles.bottomSectionRight}>
									<FastImage
										source={require('../../../common/assets/images/orders/re_order.png')}
										style={styles.bottomSectionImage}
									/>
								</TouchableOpacity>
							</View>
						)}
						{loading && (
							<View style={{ flex: 1 }}>
								<ActivityIndicator size={Config.isAndroid ? 25 : 50} color={Theme.colors.primary} />
							</View>
						)}
					</View>
				</ElevatedView>
			</TouchableOpacity>
		);
	}
}

const mapStateToProps = () => ({});

export default connect(mapStateToProps, {})(withNavigation(OrderItem));
