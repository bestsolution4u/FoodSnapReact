import * as firebase from 'firebase';
import '@firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyC5UQhb8CRsCehJpxUyMqZ22kX5ql8fLzI',
    projectId: 'snapfood-3f623',
    authDomain: 'snapfood-3f623.firebaseapp.com',
    databaseURL: 'https://snapfood-3f623.firebaseio.com',
};


firebase.initializeApp(firebaseConfig);

export default firebase.firestore();
