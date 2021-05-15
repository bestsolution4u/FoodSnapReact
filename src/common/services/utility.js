import { Dimensions, Linking, Platform } from 'react-native';
import SafeArea, { type SafeAreaInsets } from 'react-native-safe-area';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import Theme from '../../theme';
import alerts from './alerts';
import { translate } from './translate';
import Config from '../../config';

export function isIphoneX() {
	const dim = Dimensions.get('screen');

	return (
		// This has to be iOS
		Platform.OS === 'ios' &&
		// Check either, iPhone X or XR
		(isIPhoneXSize(dim) || isIPhoneXrSize(dim))
	);
}

export function isIPhoneXSize(dim) {
	return dim.height === 812 || dim.width === 812;
}

export function isIPhoneXrSize(dim) {
	return dim.height === 896 || dim.width === 896;
}

export const getSafeAreaDimensions = async () => {
	const { safeAreaInsets } = await SafeArea.getSafeAreaInsetsForRootView();
	return safeAreaInsets;
};

export const extractErrorMessage = (error) => {
	if (typeof error === 'string') {
		return error;
	}
	if (typeof error === 'object') {
		if (error.length) {
			error = error[0];
		} else {
			error = error[Object.keys(error)[0]];
			if (typeof error === 'object') {
				error = error[0];
			}
		}
	}
	if (error.error) {
		error = error.error;
	}
	if (error.body) {
		error = error.body.error;
	}
	if (error.data) {
		error = error.data;
	}
	if (typeof error === 'string') {
		return error;
	}
	if (typeof error.message === 'string') {
		return error.message;
	}
	try {
		Object.keys(error.message).forEach((key) => {
			if (typeof error.message[key] === 'string') {
				return error.message[key];
			} else {
				error.message[key].forEach((message) => {
					return message;
				});
			}
		});
	} catch (e) {
		return translate('generic_error');
	}
};

export const openExternalUrl = (url) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (await InAppBrowser.isAvailable()) {
				await InAppBrowser.open(url, {
					dismissButtonStyle: 'close',
					preferredBarTintColor: 'white',
					preferredControlTintColor: Theme.colors.primary,
					readerMode: false,
					animated: true,
					modalPresentationStyle: 'overFullScreen',
					modalTransitionStyle: 'crossDissolve',
					modalEnabled: true,
					enableBarCollapsing: false,
					// Android Properties
					showTitle: true,
					toolbarColor: Theme.colors.primary,
					secondaryToolbarColor: 'black',
					enableUrlBarHiding: true,
					enableDefaultShare: true,
					forceCloseOnRedirection: false,
					animations: {
						startEnter: 'slide_in_right',
						startExit: 'slide_out_left',
						endEnter: 'slide_in_left',
						endExit: 'slide_out_right',
					},
				});
				resolve();
			} else {
				Linking.openURL(url);
				resolve();
			}
		} catch (error) {
			reject(error);
		}
	});
};

const validateEmailAddress = (email) => {
	let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return reg.test(email);
};

export const validatePhoneNumber = (text) => {
	const PHONE_REGEXP = /^06[6-9][1-9]\d{6}$|04[3-9][1-9]\d{5}$/;
	return PHONE_REGEXP.test(text);
};

export const validateUserData = ({ full_name, email, phone, password, pass2 }, isNew) => {
	return new Promise((resolve, reject) => {
		const mobileValidate = phone && validatePhoneNumber(phone.replace(/\s/g, ''));
		const emailValidate = email && validateEmailAddress(email);

		if (!full_name || !email || !phone || !phone.replace(/\s/g, '') || (isNew && !password)) {
			alerts.error(translate('attention'), translate('fill_all_fields'));
			reject();
		} else if (isNew && password !== pass2) {
			alerts.error(translate('attention'), translate('password_mismatch'));
			reject();
		} else if (emailValidate === false) {
			alerts.error(translate('attention'), translate('wrong_email_format'));
			reject();
		} else if (mobileValidate === false) {
			alerts.error(translate('attention'), translate('wrong_phone_format'));
			reject();
		} else {
			resolve();
		}
	});
};

export const validatePassword = (password, passwordConfirmation) => {
	return new Promise(async (resolve, reject) => {
		if (!password || !passwordConfirmation) {
			alerts.error(translate('attention'), translate('fill_all_fields'));
			reject();
		} else if (!password || password !== passwordConfirmation) {
			alerts.error(translate('attention'), translate('password_mismatch'));
			reject();
		} else {
			resolve();
		}
	});
};

export const calculateCartTotal = (items) => {
	let total = 0;

	items.map((item) => {
		let productPrice = parseFloat(item.product.price);
		if (item.options) {
			item.options.map((option) => (productPrice += parseFloat(option.price)));
		}
		total += parseFloat(productPrice * parseFloat(item.quantity));
	});

	return total;
};

export const getStaticMapUrl = (coordinates) => {
	const location = `${coordinates.latitude},${coordinates.longitude}`;
	return `https://maps.googleapis.com/maps/api/staticmap?center=${location}&zoom=15&scale=2&size=200x200&maptype=roadmap&key=${Config.GOOGLE_MAP_API_KEY}&format=png&visual_refresh=true&markers=size:mid%7Ccolor:0x00aef0%7Clabel:%7C${location}`;
};

export const formatPrice = (price, decimalPlaces = 0) => {
	return parseFloat(parseFloat(price)).toFixed(decimalPlaces);
};

export const groupBy = (items, key) =>
	items.reduce(
		(result, item) => ({
			...result,
			[item[key]]: [...(result[item[key]] || []), item],
		}),
		{}
	);

export const sum = (items, prop) => {
	return items.reduce(function (a, b) {
		return a + b[prop];
	}, 0);
};

export const prepareOrderProducts = (order) => {
	let discountInfo = order.discount;
	if (!discountInfo) {
		discountInfo = order.coupon;
	}
	const mappedProducts = groupBy(order.products, 'product_id');
	const products = [];
	Object.keys(mappedProducts).map((key) => {
		const data = mappedProducts[key][0];
		const quantity = sum(mappedProducts[key], 'quantity');
		const discount_total_price = sum(mappedProducts[key], 'total_price');
		const hasDiscount =
			mappedProducts[key].length !== 1 ||
			(discountInfo && mappedProducts[key][0].id === discountInfo.orders_product_id);
		const p = {
			...data,
			quantity: !hasDiscount || !discountInfo ? quantity : quantity - discountInfo.value,
			has_discount: hasDiscount,
			total_quantity: quantity,
			discount_total_price,
		};
		products.push(p);
	});
	return products;
};

export const getOrderDiscountValue = (order) => {
	return order.discount
		? parseFloat(order['discount_amount'])
		: order.coupon
		? parseFloat(order['coupon_amount'])
		: 0;
};

const hasOrderFreeDelivery = (order) => {
	return (
		(order.discount && order.discount.type === 'free_delivery') ||
		(order.coupon && order.coupon.type === 'free_delivery')
	);
};

export const getOrderRealDeliveryFee = (order) => {
	let realDeliveryFee = 0;
	if (hasOrderFreeDelivery(order)) {
		if (order.discount && order.discount.value > 0) {
			realDeliveryFee = order.discount.value;
		} else if (order.coupon && order.coupon.value > 0) {
			realDeliveryFee = order.coupon.value;
		}
	}
	return realDeliveryFee;
};
