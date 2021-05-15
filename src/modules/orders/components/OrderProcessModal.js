import React, { Component } from 'react';
import {
	ActivityIndicator,
	Dimensions,
	Keyboard,
	PixelRatio,
	ScrollView,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import AppText from '../../../common/components/AppText';
import Theme from '../../../theme';
import FastImage from 'react-native-fast-image';
import { translate } from '../../../common/services/translate';
import RBSheet from 'react-native-raw-bottom-sheet';
import { REACTIONS } from '../../../config/constants';
import apiFactory from '../../../common/services/apiFactory';
import alerts from '../../../common/services/alerts';
import cartStyles from '../../home/screens/styles/cart';
import {
	extractErrorMessage,
	formatPrice,
	getOrderDiscountValue,
	getOrderRealDeliveryFee,
	groupBy,
	hasOrderFreeDelivery,
	prepareOrderProducts,
	sum,
} from '../../../common/services/utility';

const { width, height } = Dimensions.get('window');
const WIDTH = width - 20;
const DISTANCE = WIDTH / REACTIONS.length;

class OrderProcessModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isShowingRatingModal: false,
			isEditable: true,
			emotion: 3,
			comment: '',
		};
	}

	updateState = () => {
		const { order } = this.props;

		if (order.rating) {
			if (!order.rating.rating_comment) {
				order.rating.rating_comment = {};
			}
			this.setState({
				isShowingRatingModal: false,
				isEditable: false,
				emotion: order.rating.emotion,
				comment: order.rating['rating_comment'].comment,
			});
		} else {
			this.setState({
				isShowingRatingModal: false,
				isEditable: true,
				emotion: 3,
				comment: '',
			});
		}
	};

	showOrderState = () => {
		const { order } = this.props;
		const { status } = order;
		if (status === 'new') {
			return (
				<View style={{ marginBottom: 20 }}>
					<View>
						<FastImage
							source={require('../../../common/assets/images/orders/waiting.png')}
							style={styles.headerImage}
						/>
						<View style={styles.headerStatusContainer}>
							<View style={styles.headerStatusContainerItem}>
								<AppText style={styles.headerStatusTextSelected}>
									{translate('orders.list_status_pending')}
								</AppText>
							</View>
							<View style={styles.headerStatusContainerItem}>
								<AppText style={styles.headerStatusText}>
									{translate('orders.list_status_in_the_way')}
								</AppText>
							</View>
							<View style={styles.headerStatusContainerItem}>
								<AppText style={[styles.headerStatusText, { marginLeft: 20 }]}>
									{translate('orders.list_status_delivered')}
								</AppText>
							</View>
						</View>
					</View>
				</View>
			);
		} else if (status === 'processing') {
			return (
				<View style={{ marginBottom: 20 }}>
					<View>
						<FastImage
							source={require('../../../common/assets/images/orders/delivering.png')}
							style={styles.headerImage}
						/>
						<View style={styles.headerStatusContainer}>
							<View style={styles.headerStatusContainerItem}>
								<AppText style={styles.headerStatusText}>
									{translate('orders.list_status_pending')}
								</AppText>
							</View>
							<View style={styles.headerStatusContainerItem}>
								<AppText style={styles.headerStatusTextSelected}>
									{translate('orders.list_status_in_the_way')}
								</AppText>
							</View>
							<View style={styles.headerStatusContainerItem}>
								<AppText style={[styles.headerStatusText, { marginLeft: 20 }]}>
									{translate('orders.list_status_delivered')}
								</AppText>
							</View>
						</View>
					</View>
				</View>
			);
		} else if (status === 'delivered') {
			return (
				<View style={{ marginBottom: 20 }}>
					<View>
						<FastImage
							source={require('../../../common/assets/images/orders/done.png')}
							style={styles.headerImage}
						/>
						<View style={styles.headerStatusContainer}>
							<View style={styles.headerStatusContainerItem}>
								<AppText style={styles.headerStatusText}>
									{translate('orders.list_status_pending')}
								</AppText>
							</View>
							<View style={styles.headerStatusContainerItem}>
								<AppText style={styles.headerStatusText}>
									{translate('orders.list_status_in_the_way')}
								</AppText>
							</View>
							<View style={styles.headerStatusContainerItem}>
								<AppText style={[styles.headerStatusTextDelivered, { marginLeft: 20 }]}>
									{translate('orders.list_status_delivered')}
								</AppText>
							</View>
						</View>
					</View>
				</View>
			);
		} else if (status === 'declined') {
			return (
				<View style={{ marginBottom: 20 }}>
					<View>
						<FastImage
							source={require('../../../common/assets/images/orders/canceled.png')}
							style={styles.headerImage}
						/>
						<View style={styles.headerStatusContainer}>
							<View style={styles.headerStatusContainerItem}>
								<AppText style={styles.headerStatusTextRejected}>
									{translate('orders.list_status_rejected')}
								</AppText>
							</View>
							<View style={styles.headerStatusContainerItem}>
								<AppText style={styles.headerStatusText}>
									{translate('orders.list_status_in_the_way')}
								</AppText>
							</View>
							<View style={styles.headerStatusContainerItem}>
								<AppText style={[styles.headerStatusText, { marginLeft: 20 }]}>
									{translate('orders.list_status_delivered')}
								</AppText>
							</View>
						</View>
					</View>
				</View>
			);
		} else {
			return null;
		}
	};

	review = () => {
		this.setState({ isShowingRatingModal: true });
	};

	closeReviewModal = () => {
		this.setState({ isShowingRatingModal: false });
	};

	selectEmoji(val) {
		this.setState({ emotion: val });
	}

	sendReview = () => {
		Keyboard.dismiss();
		const { order } = this.props;
		const { comment, emotion } = this.state;
		apiFactory.post(`orders/${order.id}/review`, { comment, emotion }).then(
			async ({ data }) => {
				if (this.props.ratingAdded) {
					this.props.ratingAdded(data.rating);
				}
				await this.setState({ isEditable: false });
				this.closeReviewModal();
			},
			(error) => {
				alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(error));
			}
		);
	};

	renderRatingModalContent = () => {
		const { order } = this.props;
		const { isEditable } = this.state;
		const vendor = order.vendor;
		const { emotion, comment } = this.state;

		return (
			<ScrollView>
				<TouchableOpacity style={ratingStyles.headerCloseContainer} onPress={this.closeReviewModal}>
					<FastImage
						source={require('../../../common/assets/images/orders/close.png')}
						style={ratingStyles.headerCloseImage}
					/>
					<AppText style={ratingStyles.headerLabel}>{translate('order_details.close')}</AppText>
				</TouchableOpacity>
				<View style={ratingStyles.container}>
					<View>
						<AppText style={ratingStyles.reviewTitle}> {translate('orders.rate_vendor')} </AppText>
						<AppText style={ratingStyles.mainTitle}>{vendor.title}</AppText>
					</View>
					<View style={ratingStyles.wrap}>
						<View style={{ flexDirection: 'row', marginTop: -5, paddingBottom: 3, marginBottom: -10 }}>
							{REACTIONS.map((reaction) => {
								return (
									<TouchableOpacity
										key={reaction.emotion}
										style={{ flex: 1 }}
										onPress={() => {
											if (isEditable) {
												this.selectEmoji(reaction.emotion);
											}
										}}
									>
										<View style={{ justifyContent: 'center', alignItems: 'center' }}>
											<FastImage
												source={emotion === reaction.emotion ? reaction.bigSrc : reaction.src}
												style={{ height: 30, width: 30, resizeMode: 'contain' }}
											/>
										</View>
									</TouchableOpacity>
								);
							})}
						</View>
					</View>
					<View>
						{!isEditable && (
							<AppText
								style={{
									fontFamily: 'SanFranciscoDisplay-Semibold',
									fontSize: 15,
									color: '#505050',
									textAlign: 'center',
									paddingTop: 10,
									marginTop: -20,
									paddingBottom: 10,
								}}
							>
								{translate('orders.your_rating')}
							</AppText>
						)}

						<TextInput
							style={ratingStyles.input}
							multiline={true}
							underlineColorAndroid='transparent'
							autoCorrect={false}
							onChangeText={(comment) => this.setState({ comment })}
							value={comment}
							editable={isEditable}
						/>
					</View>

					{isEditable && (
						<TouchableOpacity style={ratingStyles.Button} onPress={this.sendReview}>
							<AppText style={ratingStyles.ButtonText}>{translate('review.review_restaurant')}</AppText>
						</TouchableOpacity>
					)}
				</View>
			</ScrollView>
		);
	};

	renderOrderModalContent = () => {
		const { order, currency = 'L', onReorder, loading } = this.props;
		const products = prepareOrderProducts(order);
		const discountValue = getOrderDiscountValue(order);
		const realDeliveryFee = getOrderRealDeliveryFee(order);

		return (
			<ScrollView style={styles.container}>
				<TouchableOpacity style={styles.headerCloseContainer} onPress={() => this.modal.close()}>
					<FastImage
						source={require('../../../common/assets/images/orders/close.png')}
						style={styles.headerCloseImage}
					/>
					<AppText style={styles.headerLabel}>{translate('order_details.close')}</AppText>
				</TouchableOpacity>
				{order && this.showOrderState()}
				<View>
					<View style={styles.lineView}>
						<AppText style={styles.Label}>{translate('order_details.restaurant_name')}</AppText>
						<View style={styles.line} />
					</View>
					<View>
						<AppText style={styles.Title}>{order.vendor.title}</AppText>
					</View>
				</View>
				<View>
					<View style={styles.lineView}>
						<AppText style={styles.Label}>{translate('order_details.order_uppercase')}</AppText>
						<View style={styles.line} />
					</View>
					<View style={styles.tariffContainer}>
						{products.map((product) => (
							<View key={product.id} style={styles.tariffRow}>
								<View style={styles.leftRow}>
									<AppText style={[styles.orderText, { color: Theme.colors.cyan2 }]}>
										{product.total_quantity}x{' '}
									</AppText>
									<View style={{ flexDirection: 'column' }}>
										<AppText style={styles.orderText}>{product.title}</AppText>
										{product['product_options'].map((option) => {
											return (
												<AppText key={option.id.toString()} style={styles.orderOptionsText}>
													{option.title}
												</AppText>
											);
										})}
										{!!product.item_instructions && (
											<AppText
												style={[
													cartStyles.instructionsText,
													{
														fontFamily: 'SanFranciscoDisplay-Medium',
													},
												]}
											>
												<AppText
													style={[
														cartStyles.instructionsText,
														{
															fontFamily: 'SanFranciscoDisplay-Semibold',
														},
													]}
												>
													{translate('restaurant_details.instructionsTitle')}
												</AppText>
												: {`"${product.item_instructions}"`}
											</AppText>
										)}
									</View>
								</View>
								<View style={styles.rightRow}>
									<AppText style={styles.orderRightText}>
										{!!product.has_discount ? (
											<AppText>
												<AppText
													style={{
														textDecorationLine: 'line-through',
														color: Theme.colors.danger,
													}}
												>
													{formatPrice(
														parseInt(product.total_quantity) * parseFloat(product.price)
													)}{' '}
													{currency}
												</AppText>{' '}
												{formatPrice(parseInt(product.quantity) * parseFloat(product.price))}{' '}
												{currency}
											</AppText>
										) : (
											<AppText>
												{formatPrice(parseInt(product.quantity) * parseFloat(product.price))}{' '}
												{currency}
											</AppText>
										)}
									</AppText>
								</View>
							</View>
						))}
					</View>
				</View>
				<View style={{ flexDirection: 'row', paddingTop: 20 }}>
					<View style={{ padding: 10, paddingTop: 20, flex: 1 }}>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<AppText style={styles.Label}>{translate('order_details.date')}</AppText>
							<View style={styles.line} />
						</View>
						<View style={{ paddingTop: 10 }}>
							<AppText style={styles.desc}>{order['created_at'].split(' ')[0]}</AppText>
							<AppText style={styles.desc}>{order['created_at'].split(' ')[1]}</AppText>
						</View>
					</View>
					<View style={{ padding: 10, paddingTop: 20, flex: 1 }}>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<AppText style={styles.Label}>{translate('order_details.address')}</AppText>
							<View style={styles.line} />
						</View>
						<View style={{ paddingTop: 10 }}>
							<AppText style={styles.desc}>{order.address && order.address.street}</AppText>
						</View>
					</View>
				</View>
				<View style={{ paddingBottom: 15 }}>
					<View style={styles.lineView}>
						<AppText style={styles.Label}>{translate('order_details.total_paid')}</AppText>
						<View style={styles.line} />
					</View>
					<View style={styles.tariffContainer}>
						<View style={styles.tariffRow}>
							<View style={styles.leftRow}>
								<AppText style={styles.leftRowText}>{translate('order_details.subtotal')}</AppText>
							</View>
							<View style={styles.rightRow}>
								<AppText style={styles.rightRowText}>
									{formatPrice(order['sub_total'])} {currency}
								</AppText>
							</View>
						</View>
						<View style={styles.tariffRow}>
							<View style={styles.leftRow}>
								<AppText style={styles.leftRowText}>{translate('order_details.delivery_fee')}</AppText>
							</View>
							<View style={styles.rightRow}>
								{realDeliveryFee > 0 ? (
									<AppText style={styles.rightRowText}>
										<AppText
											style={{
												textDecorationLine: 'line-through',
												color: Theme.colors.danger,
											}}
										>
											{formatPrice(realDeliveryFee)} {currency}
										</AppText>{' '}
										{formatPrice(order.delivery_fee)} {currency}
									</AppText>
								) : (
									<AppText style={styles.rightRowText}>
										{formatPrice(order.delivery_fee)} {currency}
									</AppText>
								)}
							</View>
						</View>
						{discountValue > 0 && (
							<View style={styles.tariffRow}>
								<View style={styles.leftRow}>
									<AppText style={styles.leftRowText}>
										{order.discount
											? order.discount.name
											: order.coupon
											? translate('promotions.coupon_discount', {
													code: order.coupon.code,
											  })
											: ''}
									</AppText>
								</View>
								<View style={styles.rightRow}>
									<AppText style={[styles.rightRowText, { color: Theme.colors.danger }]}>
										-{formatPrice(discountValue)} {currency}
									</AppText>
								</View>
							</View>
						)}
						<View style={styles.tariffRow}>
							<View style={styles.leftRow}>
								<AppText style={[styles.leftRowText, { fontFamily: 'SanFranciscoDisplay-Bold' }]}>
									{translate('order_details.total')}
								</AppText>
							</View>
							<View style={styles.rightRow}>
								<AppText style={styles.rightRowText}>
									{formatPrice(order['total_price'])} {currency}
								</AppText>
							</View>
						</View>
					</View>
				</View>
				{order.status === 'delivered' && (
					<View style={{ flexDirection: 'row', padding: 10, marginTop: -8 }}>
						{!loading && (
							<TouchableOpacity
								onPress={() => onReorder && onReorder(order)}
								style={styles.outlineBottomContainerButton}
							>
								<AppText style={[styles.bottomContainerButtonText, { color: Theme.colors.cyan2 }]}>
									{translate('order_details.re_order')}
								</AppText>
							</TouchableOpacity>
						)}
						{loading && (
							<View style={styles.outlineBottomContainerButton}>
								<ActivityIndicator color={Theme.colors.primary} />
							</View>
						)}
						<TouchableOpacity style={styles.bottomContainerButton} onPress={() => this.review()}>
							<AppText style={styles.bottomContainerButtonText}>
								{translate('review.review_restaurant')}
							</AppText>
						</TouchableOpacity>
					</View>
				)}
			</ScrollView>
		);
	};

	renderModalContent = () => {
		const { isShowingRatingModal } = this.state;
		if (isShowingRatingModal) {
			return this.renderRatingModalContent();
		} else {
			return this.renderOrderModalContent();
		}
	};

	render() {
		const { order, setRef, onClose } = this.props;

		if (!order || !order.vendor) {
			return null;
		}

		return (
			<RBSheet
				hasScrollView={true}
				onOpen={() => this.updateState()}
				onClose={() => {
					if (onClose) {
						onClose();
					}
				}}
				closeOnDragDown={true}
				height={height * 0.88}
				duration={300}
				customStyles={{
					container: {
						borderTopLeftRadius: 10,
						borderTopRightRadius: 10,
						alignItems: 'center',
					},
				}}
				ref={(ref) => {
					this.modal = ref;
					setRef(ref);
				}}
			>
				{this.renderModalContent()}
			</RBSheet>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Theme.colors.white,
	},
	headerCloseContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	headerCloseImage: {
		width: 15,
		height: 15,
		resizeMode: 'contain',
		margin: 10,
		marginRight: 5,
	},
	headerLabel: {
		color: '#7fbfd1',
		fontFamily: 'SanFranciscoDisplay-Regular',
		fontSize: 13,
		padding: 10,
		paddingLeft: 0,
	},
	headerImage: {
		width: width,
		height: width / 8.65,
		resizeMode: 'contain',
		marginTop: 40,
	},
	headerStatusContainer: {
		flexDirection: 'row',
	},
	headerStatusContainerItem: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerStatusText: {
		color: '#646464',
		fontFamily: 'SanFranciscoDisplay-Light',
		fontSize: 13,
		padding: 10,
		textAlign: 'center',
	},
	headerStatusTextSelected: {
		color: '#54AAC1',
		fontFamily: 'SanFranciscoDisplay-Bold',
		fontSize: 13,
		padding: 10,
		textAlign: 'center',
	},
	headerStatusTextDelivered: {
		color: '#23B574',
		fontFamily: 'SanFranciscoDisplay-Bold',
		fontSize: 13,
		padding: 10,
		textAlign: 'center',
	},
	headerStatusTextRejected: {
		color: '#ed1c24',
		fontFamily: 'SanFranciscoDisplay-Bold',
		fontSize: 13,
		padding: 10,
		textAlign: 'center',
	},
	title: {
		color: '#4D4D4D',
		fontFamily: 'SanFranciscoDisplay-Bold',
		fontSize: 20,
		paddingTop: 30,
		padding: 10,
	},
	desc: {
		color: '#4D4D4D',
		fontFamily: 'SanFranciscoDisplay-Regular',
		fontSize: 15,
	},
	Label: {
		color: Theme.colors.cyan2,
		fontFamily: 'SanFranciscoDisplay-Regular',
		fontSize: 15,
		paddingRight: 10,
		paddingBottom: 0,
	},
	lineView: {
		flexDirection: 'row',
		paddingHorizontal: 10,
		alignItems: 'center',
		paddingTop: 20,
	},
	line: {
		flex: 1,
		height: 2,
		borderBottomColor: Theme.colors.cyan2,
		borderBottomWidth: 1,
	},
	Title: {
		color: Theme.colors.black,
		fontFamily: 'SanFranciscoDisplay-Bold',
		fontSize: 19,
		paddingLeft: 10,
		paddingTop: 10,
	},
	address: {
		color: '#4D4D4D',
		fontFamily: 'SanFranciscoDisplay-Regular',
		fontSize: 15,
		padding: 10,
	},
	tariffContainer: {
		backgroundColor: Theme.colors.white,
		padding: 10,
	},
	tariffRow: {
		flexDirection: 'row',
		paddingVertical: 5,
	},
	leftRow: {
		flex: 3,
		flexDirection: 'row',
	},
	rightRow: {
		flex: 2,
	},
	rightRowText: {
		color: Theme.colors.black,
		fontFamily: 'SanFranciscoDisplay-Medium',
		fontSize: 15,
		textAlign: 'right',
	},
	leftRowText: {
		color: Theme.colors.black,
		fontFamily: 'SanFranciscoDisplay-Regular',
		fontSize: 15,
		textAlign: 'left',
	},
	orderText: {
		color: Theme.colors.black,
		fontFamily: 'SanFranciscoDisplay-Medium',
		fontSize: 15,
		textAlign: 'left',
	},
	orderOptionsText: {
		color: Theme.colors.black,
		fontFamily: 'SanFranciscoDisplay-Medium',
		fontSize: 12,
		textAlign: 'left',
	},
	orderRightText: {
		color: Theme.colors.black,
		fontFamily: 'SanFranciscoDisplay-Regular',
		fontSize: 15,
		textAlign: 'right',
	},
	bottomContainerButton: {
		backgroundColor: Theme.colors.cyan2,
		flex: 1,
		margin: 10,
		marginBottom: 20,
		marginHorizontal: 5,
		padding: 10,
		paddingHorizontal: 5,
		justifyContent: 'center',
		alignItems: 'center',
		borderTopLeftRadius: 5,
		borderTopRightRadius: 5,
		borderBottomLeftRadius: 5,
		borderBottomRightRadius: 5,
	},
	outlineBottomContainerButton: {
		borderColor: Theme.colors.cyan2,
		borderWidth: 1,
		flex: 1,
		margin: 10,
		marginBottom: 20,
		marginHorizontal: 5,
		padding: 10,
		paddingHorizontal: 5,
		justifyContent: 'center',
		alignItems: 'center',
		borderTopLeftRadius: 5,
		borderTopRightRadius: 5,
		borderBottomLeftRadius: 5,
		borderBottomRightRadius: 5,
	},
	bottomContainerButtonText: {
		fontFamily: 'SanFranciscoDisplay-Regular',
		color: Theme.colors.white,
		fontSize: 15,
		textAlign: 'center',
	},
});

const size = 30;

const ratingStyles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
	},
	wrap: {
		width: WIDTH,
		marginBottom: 30,
	},
	welcome: {
		fontSize: 18,
		textAlign: 'center',
		color: '#777',
		fontWeight: '600',
		marginBottom: 50,
	},
	reactions: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		backgroundColor: 'transparent',
	},
	smileyWrap: {
		width: DISTANCE,
		height: DISTANCE,
		justifyContent: 'center',
		alignItems: 'center',
	},
	smiley: {
		width: size,
		height: size,
		borderRadius: size / 2,
		backgroundColor: 'transparent',
	},
	bigSmiley: {
		width: DISTANCE,
		height: DISTANCE,
		borderRadius: DISTANCE / 2,
		backgroundColor: '#ffb18d',
		position: 'absolute',
		top: 0,
		left: 0,
	},
	bigSmileyImage: {
		width: DISTANCE,
		height: DISTANCE,
		position: 'absolute',
		top: 0,
		left: 0,
	},
	reactionText: {
		fontSize: 12,
		textAlign: 'center',
		color: '#999',
		fontWeight: '400',
		padding: 10,
	},
	line: {
		height: 4 / PixelRatio.get(),
		backgroundColor: '#eee',
		width: WIDTH - (DISTANCE - size),
		left: (DISTANCE - size) / 2,
		top: DISTANCE / 2 + 2 / PixelRatio.get(),
	},
	///////////////////////////////////////////////////
	reviewTitle: {
		fontFamily: 'SanFranciscoDisplay-Semibold',
		fontSize: 15,
		color: Theme.colors.cyan2,
		textAlign: 'center',
		paddingTop: 30,
		paddingBottom: 5,
	},
	mainTitle: {
		fontFamily: 'SanFranciscoDisplay-Semibold',
		fontSize: 20,
		color: '#505050',
		textAlign: 'center',
		paddingTop: 10,
		paddingBottom: 30,
	},
	desc: {
		fontFamily: 'SanFranciscoDisplay-Semibold',
		fontSize: 15,
		color: Theme.colors.cyan2,
		textAlign: 'center',
		padding: 10,
		paddingTop: 30,
	},
	input: {
		backgroundColor: '#f7f7f7',
		padding: 5,
		width: width - 20,
		height: 100,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: Theme.colors.cyan2,
	},
	headerCloseContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	headerCloseImage: {
		width: 15,
		height: 15,
		resizeMode: 'contain',
		margin: 10,
		marginRight: 5,
	},
	Button: {
		backgroundColor: Theme.colors.cyan2,
		marginTop: 30,
		marginBottom: 10,
		marginHorizontal: 70,
		padding: 10,
		justifyContent: 'center',
		alignItems: 'center',
		borderTopLeftRadius: 5,
		borderTopRightRadius: 5,
		borderBottomLeftRadius: 5,
		borderBottomRightRadius: 5,
	},
	ButtonText: {
		fontFamily: 'SanFranciscoDisplay-Regular',
		color: Theme.colors.white,
		fontSize: 15,
		textAlign: 'center',
	},
	headerLabel: {
		color: '#7fbfd1',
		fontFamily: 'SanFranciscoDisplay-Regular',
		fontSize: 13,
		padding: 10,
		paddingLeft: 0,
	},
});

export default OrderProcessModal;
