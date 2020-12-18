import firebase from 'firebase/app'
import 'firebase/firestore'
import "firebase/auth";


firebase.initializeApp( {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGE_SENDER_ID,
})

// console.log(firebase.app().options)
if (process.env.REACT_APP_USE_FIREBASE_EMULATOR) {
    firebase.auth().useEmulator('http://localhost:9099/');
    firebase.firestore().useEmulator('localhost', 8080);
    //firebase.hosting().useEmulator('localhost' , 5000);
    //firebase.functions().useEmulator('localhost', 5001);
}

export const firestore = firebase.firestore()