import { APP } from '../types';
import { KEYS, setStorageKey } from '../../common/services/storage';
import apiFactory from '../../common/services/apiFactory';
import { translate } from '../../common/services/translate';

export const updateCart = (items, restaurant) => async (dispatch) => {
	return new Promise(async (resolve, reject) => {
		try {
			await setStorageKey(KEYS.CART_ITEMS, items);
			await setStorageKey(KEYS.CART_RESTAURANT, restaurant);
			await dispatch({
				type: APP.UPDATE_CART,
				payload: items,
				restaurant,
			});
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};

export const setLastOrder = (order) => async (dispatch) => {
	return new Promise(async (resolve, reject) => {
		try {
			await setStorageKey(KEYS.LAST_ORDER, order);
			await dispatch({
				type: APP.SET_LAST_ORDER,
				payload: order,
			});
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};

export const updateCartItems = (items) => async (dispatch) => {
	return new Promise(async (resolve, reject) => {
		try {
			await setStorageKey(KEYS.CART_ITEMS, items);
			await dispatch({
				type: APP.UPDATE_CART_ITEMS,
				payload: items,
			});
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};

export const setStoreAddress = (address) => async (dispatch) => {
	dispatch({
		type: APP.SET_ADDRESS,
		payload: address,
	});
};

export const setCutlery = (cutlery) => async (dispatch) => {
	return new Promise(async (resolve, reject) => {
		try {
			await setStorageKey(KEYS.CUTLERY, cutlery);
			await dispatch({
				type: APP.CUTLERY_UPDATED,
				payload: cutlery,
			});
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};

export const sendOrder = (orderData) => (dispatch) => {
	return new Promise(async (resolve, reject) => {
		apiFactory.post('checkout', orderData).then(
			async ({ data }) => {
				try {
					await setStorageKey(KEYS.CUTLERY, false);
					await dispatch({
						type: APP.CUTLERY_UPDATED,
						payload: false,
					});
					await setStorageKey(KEYS.CART_ITEMS, []);
					await setStorageKey(KEYS.CART_RESTAURANT, {});
					await setStorageKey(KEYS.LAST_ORDER, {});
					await dispatch({
						type: APP.UPDATE_CART,
						payload: [],
						restaurant: {},
					});
					await dispatch({
						type: APP.SET_LAST_ORDER,
						payload: {},
					});
					resolve(data.order);
				} catch (e) {
					reject(e);
				}
			},
			(e) => {
				reject(e);
			}
		);
	});
};

export const reOrder = (order, restaurant) => (dispatch) => {
	return new Promise(async (resolve, reject) => {
		apiFactory.get(`orders/${order.id}/reorder`).then(
			async ({ data }) => {
				if (!data['vendor_is_open']) {
					reject(translate('restaurant_details.restaurant_closed'));
				}
				const cartProducts = data.products;
				const items = cartProducts.map((cartProduct) => {
					const orderProduct = order.products.find((p) => p['product_id'] === cartProduct.id);
					const quantity = orderProduct ? orderProduct.quantity : 1;
					const options = orderProduct ? orderProduct.options : [];
					const item_instructions = orderProduct ? orderProduct.item_instructions : 1;
					cartProduct.quantity = quantity;
					return {
						product: cartProduct,
						options,
						item_instructions,
						quantity,
					};
				});

				await setStorageKey(KEYS.CART_ITEMS, items);
				await setStorageKey(KEYS.CART_RESTAURANT, restaurant);
				await setStorageKey(KEYS.LAST_ORDER, order);
				await dispatch({
					type: APP.UPDATE_CART,
					payload: items,
					restaurant,
				});
				await dispatch({
					type: APP.SET_LAST_ORDER,
					payload: order,
				});
				resolve(items);
			},
			(error) => reject(error)
		);
	});
};

export const getDiscount = (vendorId, total) => (dispatch) => {
	return new Promise((resolve) => {
		apiFactory.get(`discounts?vendor_id=${vendorId}&subtotal=${total}`).then(
			({ data }) => {
				resolve(data.discount ? data.discount : {});
			},
			() => {
				resolve({});
			}
		);
	});
};

export const setCouponCode = (code) => async (dispatch) => {
	return new Promise(async (resolve, reject) => {
		try {
			await setStorageKey(KEYS.COUPON_CODE, code);
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};
