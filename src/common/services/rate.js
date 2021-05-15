import * as StoreReview from 'react-native-store-review';
import {getStorageKey, KEYS, setStorageKey} from './storage';

const COUNT_LIMIT = 10;

const _hasRated = async () => {
    try {
        return await getStorageKey(KEYS.HAS_RATED);
    } catch (e) {
        return false;
    }
};

const _getOpenedCount = async () => {
    try {
        return await getStorageKey(KEYS.APP_OPENED_COUNT);
    } catch (e) {
        return false;
    }
};

const _shouldOpenModal = async () => {
    const hasRated = await _hasRated();
    if (hasRated) {
        return false;
    }
    const count = await _getOpenedCount();
    return count && count % COUNT_LIMIT === 0;
};

const _updateCount = async () => {
    const count = await _getOpenedCount();
    return await setStorageKey(KEYS.APP_OPENED_COUNT, count + 1);
};

const _openRateAppModal = () => {
    if (StoreReview.isAvailable) {
        setStorageKey(KEYS.HAS_RATED, true);
        StoreReview.requestReview();
    }
};

export const shouldOpenRateAppModal = _shouldOpenModal;
export const updateOpenedAppCount = _updateCount;
export const openRateAppModal = _openRateAppModal;
