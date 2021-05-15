import RNLocation from 'react-native-location';
import AndroidOpenSettings from 'react-native-android-open-settings';
import { Linking } from 'react-native';

import apiFactory from './apiFactory';
import Config from '../../config';
import alerts from './alerts';
import { translate } from './translate';

export const NO_PERMISSION = 'NO_PERMISSION';

const checkLocationPermission = () => {
	return new Promise((resolve, reject) => {
		RNLocation.checkPermission({
			ios: 'whenInUse',
			android: {
				detail: 'coarse',
			},
		}).then(resolve, reject);
	});
};

export const requestLocationPermission = (forceIfGranted) => {
	const showAlert = (resolve, reject) => {
		alerts
			.confirmation(translate('attention'), translate('locationUnavailable'), 'Settings', translate('cancel'))
			.then(
				() => {
					if (Config.isAndroid) {
						AndroidOpenSettings.locationSourceSettings();
					} else {
						Linking.openURL('app-settings:');
					}
				},
				(error) => {
					reject(error);
				}
			);
	};

	return new Promise((resolve, reject) => {
		RNLocation.requestPermission({
			ios: 'whenInUse',
			android: {
				detail: 'coarse',
			},
		}).then((granted) => {
			if (!granted) {
				showAlert(resolve, reject);
			} else {
				if (forceIfGranted) {
					showAlert(resolve, reject);
				} else {
					resolve();
				}
			}
		});
	});
};

export const getCurrentLocation = () => {
	return new Promise((resolve, reject) => {
		checkLocationPermission().then((hasPermission) => {
			if (hasPermission) {
				RNLocation.getLatestLocation()
					.then((location) => {
						if (location) {
							resolve(location);
						} else {
							reject({
								code: NO_PERMISSION,
							});
						}
					})
					.catch((error) => {
						reject(error);
					});
			} else {
				reject({
					code: NO_PERMISSION,
				});
			}
		});
	});
};

export const getAddressByCoordinates = ({ latitude, longitude }) => {
	return new Promise((resolve, reject) => {
		apiFactory(
			`https://maps.googleapis.com/maps/api/geocode/json?address=${latitude},123${longitude}12313123123123123&key=${Config.GOOGLE_MAP_API_KEY}`
		).then((res) => {
			if (res.data.results.length === 0) {
				apiFactory(
					`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${Config.API_KEY_OPEN_CAGE}`
				).then(({ data }) => {
					let addressComponents = data.results[0].components;
					let addressComponentStreet = addressComponents.road;

					if (!addressComponentStreet) {
						addressComponentStreet = addressComponents.suburb;
					} else {
						addressComponentStreet = addressComponents.road;
					}

					//Manage Translate of Pristina
					let addressComponentCity = addressComponents.city;

					if (addressComponentCity === 'Pristina') {
						addressComponentCity = 'Prishtinë';
					} else {
						addressComponentCity = addressComponents.city;
					}

					//Manage Translate of Kosovo
					let addressComponentCountry = addressComponents.country;

					if (addressComponentCountry === 'Kosovo') {
						addressComponentCountry = 'Kosove';
					} else {
						addressComponentCountry = addressComponents.country;
					}
					let address = {
						city: addressComponentCity,
						country: addressComponentCountry,
						isoCountryCode: '',
						name: addressComponentStreet,
						region: '',
						street: addressComponentStreet,
					};
					resolve(address);
				});
			} else {
				let streetName = res.data.results[0].formatted_address.split(',')[0];
				let cityName = res.data.results[0].address_components.filter(
					(x) => x.types.filter((t) => t === 'locality').length > 0
				)[0].short_name;
				let countryName = res.data.results[0].address_components.filter(
					(x) => x.types.filter((t) => t === 'country').length > 0
				)[0].long_name;
				let address = {
					city: cityName,
					country: countryName,
					isoCountryCode: '',
					name: streetName,
					region: '',
					street: streetName,
				};
				resolve(address);
			}
		});
	});
};
