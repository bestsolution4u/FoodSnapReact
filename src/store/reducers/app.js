import {APP} from '../types';

const INITIAL_STATE = {
    hasLocation: false,
    hasVerifiedPhone: false,
    coordinates: {},
    lastCoordinates: {},
    address: null,
    closedRestaurantData: {},
    user: {},
    isReviewModalVisible: false,
    reviewModalData: null,
    safeAreaDims: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    vendors: {
        loading: false,
        loaded: false,
        error: null,
        data: [],
        featured: [],
        exclusiveVendors: [],
        newVendors: [],
        freeDeliveryVendors: [],
    },
    featureBlocks: {
        loading: false,
        loaded: false,
        error: null,
        data: [],
    },
    favourites: {
        loading: false,
        loaded: false,
        error: null,
        data: [],
    },
    unreviewedorder: {
        loading: false,
        loaded: false,
        error: null,
        data: null,
    },
    banners: [],
    addresses: [],
    message: null,
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case APP.SAFE_AREA_DIMENSIONS:
            return {...state, safeAreaDims: action.payload};
        case APP.LOGGED_IN:
            return {...state, isLoggedIn: action.payload};
        case APP.SET_USER_DATA:
            return {...state, user: action.payload};
        case APP.SET_HAS_VERIFIED_PHONE:
            return {...state, hasVerifiedPhone: !!action.payload};
        case APP.SET_LOCATION_DATA:
            return {...state, location: action.payload};
        case APP.APPLY_LOCATION: {
            return {
                ...state,
                hasLocation: true,
                coordinates: action.payload.coordinates,
                lastCoordinates: action.payload.coordinates,
                address: action.payload.address,
            };
        }
        case APP.SET_FIRST_TIME_OPEN: {
            return {...state, hasLocation: action.payload};
        }
        case APP.GET_BANNERS_SUCCESS: {
            return {...state, banners: action.payload};
        }
        case APP.SET_UNREVIEWED_ORDER: {
            return {
                ...state,
                isReviewModalVisible: !!action.payload,
                reviewModalData: action.payload,
            };
        }
        case APP.CLOSE_REVIEW_MODAL: {
            return {
                ...state,
                isReviewModalVisible: false,
                reviewModalData: null,
            };
        }
        case APP.SET_ADDRESSES: {
            return {
                ...state,
                addresses: action.payload,
            };
        }
        case APP.DELETED_ADDRESS: {
            const {addresses} = state;

            return {
                ...state,
                addresses: addresses.filter(a => a.id !== action.payload),
            };
        }
        default:
            return {...state};
    }
};

