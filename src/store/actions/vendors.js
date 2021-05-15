import { error } from 'react-native-gifted-chat/lib/utils';
import apiFactory from '../../common/services/apiFactory';
import { APP } from '../types';

export const getFoodCategories = () => {
    return new Promise((resolve, reject) => {
        apiFactory.get('vendors/food-categories').then(
          ({ data }) => {
              resolve(data);
          },
          (error) => {
              reject(error);
          }
        );
    });
};

export const getVendors = (
  page = 1,
  latitude = 41.328939,
  longitude = 19.813715,
  orderBy,
  orderDirection,
  perPage = 15,
  filterKeys,
  foodCategories
) => async (dispatch) => {
    const params = [`lat=${latitude}`, `lng=${longitude}`, `page=${page}`, `per_page=${perPage}`];
    if (orderBy) {
        params.push(`ordering_attribute=${orderBy}`);
        params.push(`ordering_order=${orderDirection ? orderDirection : 1}`);
    }

    if (!!filterKeys && filterKeys.length > 0) {
        for (let i = 0; i < filterKeys.length; i++) {
            params.push(filterKeys[i].key);
            if (filterKeys[i].key.includes('ordering_attribute')) {
                params.push('ordering_order=1');
            }
        }
    }

    if (!!foodCategories && foodCategories.length > 0) {
        for (let i = 0; i < foodCategories.length; i++) {
            params.push(`food_category_ids[]=${foodCategories[i].id}`);
        }
    }

    return new Promise(async (resolve, reject) => {
        apiFactory.get(`vendors?${params.join('&')}`).then(
          ({ data }) => {
              resolve(data.vendors);
          },
          (error) => {
              reject(error);
          }
        );
    });
};

export const getFeaturedBlocks = (latitude = 41.328939, longitude = 19.813715) => async (dispatch) => {
    return new Promise(async (resolve, reject) => {
        apiFactory.get(`mobile-feature-blocks?lat=${latitude}&lng=${longitude}`).then(
          ({ data }) => {
              resolve(data.result);
          },
          (error) => {
              reject(error);
          }
        );
    });
};

export const getAllFavourites = () => async (dispatch) => {
    return new Promise(async (resolve, reject) => {
        apiFactory.get('vendors/favourites').then(
          ({ data }) => {
              dispatch({
                  type: APP.SET_ALL_FAVOURITES,
                  payload: data.vendors,
              });
          },
          (error) => {
              reject(error);
          }
        );
    });
};

export const getFavourites = (latitude, longitude) => async (dispatch) => {
    return new Promise(async (resolve, reject) => {
        apiFactory.get(`vendors/favourites?lat=${latitude}&lng=${longitude}`).then(
          ({ data }) => {
              dispatch({
                  type: APP.SET_FAVOURITES,
                  payload: data.vendors,
              });
          },
          (error) => {
              dispatch({
                  type: APP.SET_FAVOURITES,
                  payload: [],
              });
              reject(error);
          }
        );
    });
};

export const toggleFavourite = (vendorId, isFavourite) => async (dispatch) => {
    return new Promise(async (resolve, reject) => {
        apiFactory
          .post('vendors/favourites', {
              vendor_id: vendorId,
              favourite: isFavourite ? 1 : 0,
          })
          .then(
            (response) => {
                resolve();
            },
            (error) => {
                reject(error);
            }
          );
    });
};
