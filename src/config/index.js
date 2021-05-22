import { Platform } from 'react-native';

const beta = {
	isAndroid: Platform.OS === 'android',
	BASE_URL: 'http://v3apibeta.snapfood.al/api/',
	APP_KEY: 'SNAPFOOD-3exeAtM4CMRAKNWNdza92QyP4',
	GOOGLE_MAP_API_KEY: 'AIzaSyAUdAKToy4ERLV80Dehuts67EPUWlt8y2I',
	API_KEY_OPEN_CAGE: 'b99bbb1ecc8443a39a35d666087604fd',
	WEB_PAGE_URL: 'http://v3webbeta.snapfood.al/',
};

const live = {
	isAndroid: Platform.OS === 'android',
	BASE_URL: 'http://v3api.snapfood.al/api/',
	APP_KEY: 'SNAPFOOD-3exeAtM4CMRAKNWNdza92QyP4',
	GOOGLE_MAP_API_KEY: 'AIzaSyAUdAKToy4ERLV80Dehuts67EPUWlt8y2I',
	API_KEY_OPEN_CAGE: 'b99bbb1ecc8443a39a35d666087604fd',
	WEB_PAGE_URL: 'https://snapfood.al/',
};

export default live;
