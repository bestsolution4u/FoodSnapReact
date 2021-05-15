import {APP} from '../types';
import {KEYS, setStorageKey} from '../../common/services/storage';
import apiFactory from '../../common/services/apiFactory';
import {getSafeAreaDimensions} from '../../common/services/utility';

export const setAddress = ({coordinates, address}) => async dispatch => {
    return new Promise(async (resolve, reject) => {
        try {
            await setStorageKey(KEYS.HAS_LOCATION, true);
            await setStorageKey(KEYS.COORDINATES, coordinates);
            await setStorageKey(KEYS.LAST_COORDINATES, coordinates);
            await dispatch({
                type: APP.APPLY_LOCATION,
                payload: {
                    coordinates,
                    address,
                },
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

export const setHasLocation = (value) => dispatch => {
    return new Promise(async resolve => {
        await dispatch({
            type: APP.SET_FIRST_TIME_OPEN,
            payload: !!value,
        });
        resolve();
    });
};

export const getBanners = (latitude, longitude) => dispatch => {
    return new Promise(resolve => {
        apiFactory.get(`banners?lat=${latitude}&lng=${longitude}`).then(({data}) => {
            dispatch({
                type: APP.GET_BANNERS_SUCCESS,
                payload: data.banners,
            });
            resolve(data.banners);
        }, () => resolve([]));
    });
};

export const getLastUnReviewedOrder = () => dispatch => {
    return new Promise(resolve => {
        apiFactory.get('orders/un-reviewed').then(({data}) => {
            dispatch({
                type: APP.SET_UNREVIEWED_ORDER,
                payload: data.order,
            });
            resolve();
        }, (error) => {
            console.log(error);
        });
    });
};

export const getAddresses = () => dispatch => {
    return new Promise(resolve => {
        apiFactory.get('addresses').then(({data}) => {
            dispatch({
                type: APP.SET_ADDRESSES,
                payload: data.addresses,
            });
            resolve(data.addresses);
        }, () => resolve([]));
    });
};

export const saveAddress = (address, setAsDefault) => dispatch => {
    return new Promise((resolve, reject) => {
        if (address.id) {
            apiFactory.put(`addresses/${address.id}`, address).then(() => {
                resolve();
            }, reject);
        } else {
            apiFactory.post('addresses', address).then(async ({data}) => {
                if (setAsDefault) {
                    await dispatch({
                        type: APP.SET_ADDRESS,
                        payload: data.address,
                    });
                }
                resolve();
            }, reject);
        }
    });
};

export const deleteAddress = (id) => dispatch => {
    return new Promise((resolve, reject) => {
        apiFactory.delete(`addresses/${id}`).then(() => {
            dispatch({
                type: APP.DELETED_ADDRESS,
                payload: id,
            });
            resolve();
        }, reject);
    });
};

export const setAddressAsDefault = (address) => dispatch => {
    return new Promise((resolve, reject) => {
        address.favourite = true;
        apiFactory.put(`addresses/${address.id}`, address).then(resolve, reject);
    });
};

export const setSafeAreaData = () => dispatch => {
    return new Promise(async resolve => {
        const dim = await getSafeAreaDimensions();
        dispatch({
            type: APP.SAFE_AREA_DIMENSIONS,
            payload: dim,
        });
        resolve();
    });
};

export const closeRatingModal = () => async dispatch => {
    await dispatch({
        type: APP.CLOSE_REVIEW_MODAL,
    });
};
