import {KEYS, setStorageKey} from '../../common/services/storage';
import {APP} from '../types';
import apiFactory from '../../common/services/apiFactory';
import firebase from 'react-native-firebase';

export const PHONE_NOT_VERIFIED = 'PHONE_NOT_VERIFIED';

const getLoggedInUserData = () => {
    return new Promise(async (resolve, reject) => {
        try {
            apiFactory.get('users').then((res) => {
                resolve(res.data.user);
            });
        } catch (e) {
            reject(e);
        }
    });
};

export const legacyLogin = token => async dispatch => {
    return new Promise(async (resolve, reject) => {
        try {
            const device = {
                token: await firebase.messaging().getToken(),
            };
            apiFactory.post('login/legacy', {device}, {
                headers: {
                    Authorization: token,
                },
            }).then(async (response) => {
                const {token, verified_by_mobile} = response.data;
                await setStorageKey(KEYS.TOKEN, token);
                const user = await getLoggedInUserData();
                await setStorageKey(KEYS.IS_LOGGED_IN, true);
                dispatch({
                    type: APP.SET_HAS_VERIFIED_PHONE,
                    payload: !!verified_by_mobile,
                });
                dispatch({
                    type: APP.SET_USER_DATA,
                    payload: user,
                });
                dispatch({
                    type: APP.LOGGED_IN,
                    payload: true,
                });
                if (!verified_by_mobile) {
                    reject({
                        code: PHONE_NOT_VERIFIED,
                        hasPhone: !!user.phone,
                    });
                } else {
                    resolve();
                }
            }, async (e) => {
                await setStorageKey(KEYS.IS_LOGGED_IN, false);
                reject(e);
            });
        } catch (e) {
            reject(e);
        }
    });
};

export const login = ({email, password}) => async dispatch => {
    return new Promise(async (resolve, reject) => {
        try {
            const device = {
                token: await firebase.messaging().getToken(),
            };
            apiFactory.post('login', {email, password, device}).then(async (response) => {
                const {token, verified_by_mobile} = response.data;
                await setStorageKey(KEYS.TOKEN, token);
                const user = await getLoggedInUserData();
                await setStorageKey(KEYS.IS_LOGGED_IN, true);
                dispatch({
                    type: APP.SET_HAS_VERIFIED_PHONE,
                    payload: !!verified_by_mobile,
                });
                dispatch({
                    type: APP.SET_USER_DATA,
                    payload: user,
                });
                dispatch({
                    type: APP.LOGGED_IN,
                    payload: true,
                });
                if (!verified_by_mobile) {
                    reject({
                        code: PHONE_NOT_VERIFIED,
                        hasPhone: !!user.phone,
                    });
                } else {
                    resolve();
                }
            }, async (e) => {
                await setStorageKey(KEYS.IS_LOGGED_IN, false);
                reject(e);
            });
        } catch (e) {
            reject(e);
        }
    });
};

export const register = (user) => () => {
    return new Promise(async (resolve, reject) => {
        try {
            const device = {
                token: await firebase.messaging().getToken(),
            };
            apiFactory.post('register', {...user, device}).then(resolve, reject);
        } catch (e) {
            reject(e);
        }
    });
};

export const facebookLogin = (token) => async dispatch => {
    return new Promise(async (resolve, reject) => {
        try {
            const device = {
                token: await firebase.messaging().getToken(),
            };
            apiFactory.post('login/facebook', {
                access_token: token,
                device,
            }).then(async ({data}) => {
                await setStorageKey(KEYS.TOKEN, data.token);
                await setStorageKey(KEYS.IS_LOGGED_IN, true);
                const user = await getLoggedInUserData();
                dispatch({
                    type: APP.SET_USER_DATA,
                    payload: user,
                });
                dispatch({
                    type: APP.LOGGED_IN,
                    payload: true,
                });
                dispatch({
                    type: APP.SET_HAS_VERIFIED_PHONE,
                    payload: !!user['verified_by_mobile'],
                });
                if (!user['verified_by_mobile']) {
                    reject({
                        code: PHONE_NOT_VERIFIED,
                        hasPhone: !!user.phone,
                    });
                } else {
                    resolve();
                }
            }, async (e) => {
                await setStorageKey(KEYS.IS_LOGGED_IN, false);
                reject(e);
            });
        } catch (e) {
            await setStorageKey(KEYS.IS_LOGGED_IN, false);
            reject(e);
        }
    });
};

export const appleLogin = ({user, identityToken, email, fullName}) => async dispatch => {

    return new Promise(async (resolve, reject) => {

        try {
            const device = { token: await firebase.messaging().getToken(), };

            if (!email) { email = "" ;}

            if (!fullName.nickName) { fullName = ""}
            else { fullName = fullName.nickName ;}


            apiFactory.post('login/apple',
              {
                  apple_id: user,
                  apple_identity_token: identityToken,
                  email: email,
                  name: fullName,
                  device
              }).then(async (response) => {

                  const {token, verified_by_mobile} = response.data;
                  await setStorageKey(KEYS.TOKEN, token);
                  const user = await getLoggedInUserData();
                  await setStorageKey(KEYS.IS_LOGGED_IN, true);


                  dispatch({
                      type: APP.SET_USER_DATA,
                      payload: user,
                  });

                  dispatch({
                      type: APP.LOGGED_IN,
                      payload: true,
                  });

                  dispatch({
                      type: APP.SET_HAS_VERIFIED_PHONE,
                      payload: !!verified_by_mobile,

                  });

                 if (!verified_by_mobile) {

                      reject({
                          code: PHONE_NOT_VERIFIED,
                          hasPhone: !!user.phone,
                      });

                 } else {
                    resolve();
                }

            }, async (e) => {
                await setStorageKey(KEYS.IS_LOGGED_IN, false);
                reject(e);
            });

        } catch (e) {
            reject(e);
        }

    });

};

export const setAsLoggedIn = () => async dispatch => {
    return new Promise(async (resolve, reject) => {
        try {
            await dispatch({
                type: APP.LOGGED_IN,
                payload: true,
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

export const logout = () => async dispatch => {
    return new Promise(async (resolve) => {
        try {
            apiFactory.get('logout').then();
            await setStorageKey(KEYS.IS_LOGGED_IN, false);
            await setStorageKey(KEYS.TOKEN, null);
            await dispatch({
                type: APP.LOGGED_IN,
                payload: false,
            });
            await dispatch({
                type: APP.USER_LOGGED_OUT,
                payload: false,
            });
            dispatch({
                type: APP.SET_ADDRESSES,
                payload: [],
            });
            dispatch({
                type: APP.SET_ADDRESS,
                payload: {},
            });
            resolve();
        } catch (e) {
            resolve();
        }
    });
};

export const updateProfileDetails = (user) => async dispatch => {
    return new Promise(async (resolve, reject) => {
        apiFactory.put('users', {
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            notifications: user.notifications ? 1 : 0,
            promotions: user.promotions ? 1 : 0,
            blog_notifications: user.blog_notifications ? 1 : 0,
        }).then(async ({data}) => {
            dispatch({
                type: APP.SET_HAS_VERIFIED_PHONE,
                payload: !!data.user['verified_by_mobile'],
            });
            await dispatch({
                type: APP.SET_USER_DATA,
                payload: user,
            });
            resolve();
        }, reject);
    });
};

export const changePassword = (password) => async dispatch => {
    return new Promise(async (resolve, reject) => {
        apiFactory.put('users', {
            password: password,
        }).then(resolve, reject);
    });
};

export const setHasVerifiedPhone = (value) => async dispatch => {
    dispatch({
        type: APP.SET_HAS_VERIFIED_PHONE,
        payload: value,
    });
};

export const getLoggedInUser = () => dispatch => {
    return new Promise(async (resolve) => {
        try {
            const user = await getLoggedInUserData();
            dispatch({
                type: APP.SET_USER_DATA,
                payload: user,
            });
            dispatch({
                type: APP.SET_HAS_VERIFIED_PHONE,
                payload: !!user['verified_by_mobile'],
            });
            resolve(user);
        } catch (e) {
            resolve();
        }
    });
};
