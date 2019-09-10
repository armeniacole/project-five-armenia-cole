
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDhU4Uaio3XRiBJzpq_ssWeDLD7PWdoZeI",
    authDomain: "tracker-app-b1f0e.firebaseapp.com",
    databaseURL: "https://tracker-app-b1f0e.firebaseio.com",
    projectId: "tracker-app-b1f0e",
    storageBucket: "",
    messagingSenderId: "739101612866",
    appId: "1:739101612866:web:de72c18088553d7f24c6db"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;