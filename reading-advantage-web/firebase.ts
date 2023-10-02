// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyChIxCVEOeyb4NB7FkcFFsQFRIbHLKQnjQ",
    authDomain: "reading-advantage.firebaseapp.com",
    projectId: "reading-advantage",
    storageBucket: "reading-advantage.appspot.com",
    messagingSenderId: "1090865515742",
    appId: "1:1090865515742:web:b0b2ee948ea46c5b27c64f",
    measurementId: "G-GYF8Q8F8FN"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };