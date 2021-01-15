import firebase from 'firebase/app'
import 'firebase/firestore'
import "firebase/auth";

const enabledEmulator = () => process.env.REACT_APP_USE_FIREBASE_EMULATOR


firebase.initializeApp( {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGE_SENDER_ID,
})

export const auth = firebase.auth()
export const firestore = firebase.firestore()

console.log(firebase.app().options)

if (enabledEmulator()) {
    auth.useEmulator('http://localhost:9099/');
    firestore.useEmulator('localhost', 8080);
    //firebase.hosting().useEmulator('localhost' , 5000);
    //firebase.functions().useEmulator('localhost', 5001);
}