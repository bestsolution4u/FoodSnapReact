import React, { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import { REACTIONS } from '../../config/constants';
import AppText from './AppText';
import styles from '../../modules/home/screens/styles/home';
import { translate } from '../services/translate';
import Theme from '../../theme';
import { useDispatch } from 'react-redux';
import { APP } from '../../store/types';
import apiFactory from '../services/apiFactory';
import alerts from '../services/alerts';
import { extractErrorMessage } from '../services/utility';

const RatingOrderModal = ({ isVisible, order }) => {
	if (!order) {
		return null;
	}

	const [reviewValue, setReviewValue] = useState(0);
	const [comment, setComment] = useState('');
	const dispatch = useDispatch();

	const closeModal = () => {
		dispatch({
			type: APP.CLOSE_REVIEW_MODAL,
		});
	};

	const sendReview = () => {
		apiFactory.post(`orders/${order.id}/review`, { comment, emotion: reviewValue }).then(
			() => {
				closeModal();
			},
			(error) => {
				alerts.error(translate('restaurant_details.we_are_sorry'), extractErrorMessage(error));
			}
		);
	};

	return (
		<Modal
			isVisible={isVisible}
			backdropColor={'rgba(0, 0, 0, 0.6)'}
			animationIn={'slideInUp'}
			animationOut={'slideOutDown'}
			animationInTiming={500}
			animationOutTiming={500}
			backdropTransitionInTiming={500}
			backdropTransitionOutTiming={500}
			style={styles.reviewModal}
			onBackdropPress={() => closeModal()}
			onBackButtonPress={() => closeModal()}
			onSwipe={() => closeModal()}
			swipeDirection='down'
		>
			<View style={styles.reviewModalView}>
				<View style={styles.reviewModalView}>
					<View style={styles.closedModalImageContainer}>
						<FastImage
							resizeMode={FastImage.resizeMode.contain}
							source={{
								uri: `https://snapfoodal.imgix.net/${order.vendor['logo_thumbnail_path']}?w=600&h=600`,
							}}
							style={{
								height: 60,
								width: 60,
								borderRadius: 8,
								resizeMode: 'contain',
								overflow: 'hidden',
								marginTop: Platform.OS === 'ios' ? -45 : -10,
								marginBottom: 10,
							}}
						/>
					</View>
					<View style={styles.modalContainerReview}>
						<View style={{ marginBottom: 30, height: 50 }}>
							<AppText
								style={{
									fontFamily: 'SanFranciscoDisplay-Semibold',
									fontSize: Platform.OS === 'ios' ? 16 : 14,
									color: Theme.colors.cyan2,
									textAlign: 'center',
									flexWrap: 'wrap',
									marginLeft: Platform.OS === 'android' ? 10 : 0,
								}}
							>
								{translate('orders.order_at', { vendor: order.vendor.title })}
							</AppText>
							<AppText
								style={{
									fontFamily: 'SanFranciscoDisplay-Semibold',
									fontSize: Platform.OS === 'ios' ? 13 : 11,
									color: '#505050',
									textAlign: 'center',
									marginTop: 7,
									marginLeft: Platform.OS === 'android' ? 10 : 0,
								}}
							>
								{' '}
								{translate('orders.sent_at', { date: order['created_at'] })}
							</AppText>
						</View>
					</View>
					<View style={styles.modalContainerReview}>
						{REACTIONS.map((reaction) => {
							return (
								<TouchableOpacity
									key={reaction.emotion}
									style={styles.closedModalInfo}
									onPress={() => {
										setReviewValue(reaction.emotion);
									}}
								>
									<View style={styles.closedModalImageContainer}>
										<FastImage
											resizeMode={FastImage.resizeMode.contain}
											source={reviewValue === reaction.emotion ? reaction.bigSrc : reaction.src}
											style={styles.closedModalIcoRev}
										/>
									</View>
								</TouchableOpacity>
							);
						})}
					</View>
					<View style={styles.modalContainerReview}>
						{reviewValue !== 0 && (
							<TextInput
								style={styles.inputRev}
								underlineColorAndroid='transparent'
								onChangeText={(comment) => setComment(comment)}
								value={comment}
							/>
						)}
					</View>
					<View style={styles.modalContainerReview}>
						{reviewValue !== 0 && (
							<TouchableOpacity style={styles.ButtonRev} onPress={sendReview}>
								<AppText style={styles.ButtonTextRev}>{translate('review.review_restaurant')}</AppText>
							</TouchableOpacity>
						)}
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default RatingOrderModal;
