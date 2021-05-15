import {APP} from '../types';

const INITIAL_STATE = {
    restaurant: null,
    items: [],
    hasCutlery: false,
    address: {},
    lastOrder: {},
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case APP.ADD_PRODUCT_TO_CART: {
            const {items} = state;
            const {product} = action.payload;
            let currentProduct = items.find(i => i.product.id === product.id);
            if (currentProduct) {
                currentProduct.quantity = action.payload.quantity;
            } else {
                items.push(action.payload);
            }
            return {
                ...state,
                items: items,
            };
        }
        case APP.UPDATE_CART: {
            return {
                ...state,
                items: action.payload,
                restaurant: action.restaurant,
            };
        }
        case APP.SET_LAST_ORDER: {
            return {
                ...state,
                lastOrder: action.payload,
            };
        }
        case APP.UPDATE_CART_ITEMS: {
            return {
                ...state,
                items: action.payload,
            };
        }
        case APP.CUTLERY_UPDATED: {
            return {
                ...state,
                hasCutlery: action.payload,
            };
        }
        case APP.SET_ADDRESS: {
            return {
                ...state,
                address: action.payload,
            };
        }
        default:
            return {...state};
    }
};

